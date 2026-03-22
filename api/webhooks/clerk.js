/**
 * Clerk Webhook Handler
 * Syncs Clerk user lifecycle events to MongoDB User collection
 *
 * Events handled:
 * - user.created: Create User document
 * - user.updated: Update User document
 * - user.deleted: Soft-delete User document
 */

/**
 * @security
 * Auth: Svix signature verification (`Webhook.verify`)
 * Tenant isolation: user records keyed by trusted Clerk event `id`
 * Rate limit: N/A (signed webhook endpoint)
 * Last audit: 2026-02-26 (Phase 4)
 */

import { Webhook } from 'svix'
import { getRawBody } from '../_lib/body.js'
import logger from '../_lib/logger.js'
import { User } from '../_lib/models/User.js'
import { connectToDatabase } from '../_lib/mongodb.js'

function getAppBaseUrl() {
  if (process.env.APP_URL) return process.env.APP_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3201'
}

export const config = {
  api: { bodyParser: false },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SIGNING_SECRET
  if (!WEBHOOK_SECRET) {
    logger.error('CLERK_WEBHOOK_SIGNING_SECRET not configured')
    return res.status(500).json({ error: 'Webhook secret not configured' })
  }

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
    logger.error('Webhook signature verification failed', err)
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

        logger.info('Created user from Clerk webhook', { clerkId: id })

        if (primaryEmail) {
          fetch(
            `${getAppBaseUrl()}/api/emails?action=trigger&type=signup`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: id,
                email: primaryEmail.toLowerCase(),
                firstName: first_name || undefined,
              }),
            }
          ).catch(err => {
            logger.error('Failed to trigger welcome email', err)
          })
        }

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
          logger.warn('User not found for update, skipping', { clerkId: id })
        }

        if (result) {
          logger.info('Updated user from Clerk webhook', { clerkId: id })
        }
        break
      }

      case 'user.deleted': {
        const { id } = event.data

        // Soft delete: Keep user record but mark as deleted
        await User.findOneAndUpdate(
          { clerkId: id },
          { $set: { deletedAt: new Date() } }
        )

        logger.info('Soft-deleted user from Clerk webhook', { clerkId: id })
        break
      }

      default:
        logger.info(`Unhandled Clerk event: ${event.type}`)
    }

    return res.status(200).json({ received: true, type: event.type })
  } catch (error) {
    logger.error('Error processing Clerk webhook', error)
    return res.status(500).json({ error: 'Webhook processing failed' })
  }
}
