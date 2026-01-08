/**
 * Clerk Webhook Handler
 * Syncs Clerk user lifecycle events to MongoDB User collection
 *
 * Events handled:
 * - user.created: Create User document
 * - user.updated: Update User document
 * - user.deleted: Soft-delete User document
 */

import { Webhook } from 'svix'
import { User } from '../_lib/models/User.js'
import { connectToDatabase } from '../_lib/mongodb.js'

export const config = {
  api: { bodyParser: false },
}

async function getRawBody(req) {
  const chunks = []
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }
  return Buffer.concat(chunks)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SIGNING_SECRET
  if (!WEBHOOK_SECRET) {
    console.error('CLERK_WEBHOOK_SIGNING_SECRET not configured')
    return res.status(500).json({ error: 'Webhook secret not configured' })
  }

  // Verify webhook signature
  const payload = await getRawBody(req)
  const headers = {
    'svix-id': req.headers['svix-id'],
    'svix-timestamp': req.headers['svix-timestamp'],
    'svix-signature': req.headers['svix-signature'],
  }

  let event
  try {
    const wh = new Webhook(WEBHOOK_SECRET)
    event = wh.verify(payload.toString(), headers)
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return res.status(403).json({ error: 'Invalid signature' })
  }

  await connectToDatabase()

  try {
    switch (event.type) {
      case 'user.created': {
        const { id, email_addresses, first_name, last_name, image_url } =
          event.data
        const primaryEmail = email_addresses?.find(
          e => e.id === event.data.primary_email_address_id
        )?.email_address

        await User.create({
          clerkId: id,
          email: primaryEmail?.toLowerCase() || '',
          firstName: first_name || null,
          lastName: last_name || null,
          imageUrl: image_url || null,
          plan: 'starter', // Default plan for new users
        })

        console.log('✅ Created user from Clerk webhook', { clerkId: id })
        break
      }

      case 'user.updated': {
        const { id, email_addresses, first_name, last_name, image_url } =
          event.data
        const primaryEmail = email_addresses?.find(
          e => e.id === event.data.primary_email_address_id
        )?.email_address

        const result = await User.findOneAndUpdate(
          { clerkId: id },
          {
            $set: {
              email: primaryEmail?.toLowerCase() || undefined,
              firstName: first_name || null,
              lastName: last_name || null,
              imageUrl: image_url || null,
            },
          }
        )

        if (!result) {
          console.warn('⚠️ User not found for update, skipping', {
            clerkId: id,
          })
        }

        console.log('✅ Updated user from Clerk webhook', { clerkId: id })
        break
      }

      case 'user.deleted': {
        const { id } = event.data

        // Soft delete: Keep user record but mark as deleted
        await User.findOneAndUpdate(
          { clerkId: id },
          { $set: { deletedAt: new Date() } }
        )

        console.log('✅ Soft-deleted user from Clerk webhook', { clerkId: id })
        break
      }

      default:
        console.log(`Unhandled Clerk event: ${event.type}`)
    }

    return res.status(200).json({ received: true, type: event.type })
  } catch (error) {
    console.error('Error processing Clerk webhook:', error)
    return res.status(500).json({ error: 'Webhook processing failed' })
  }
}
