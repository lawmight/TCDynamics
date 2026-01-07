import { validateEvent, WebhookVerificationError } from '@polar-sh/sdk/webhooks'
import { getResendClient } from '../_lib/email.js'
import { User } from '../_lib/models/User.js'
import { savePolarEvent } from '../_lib/mongodb-db.js'
import { connectToDatabase } from '../_lib/mongodb.js'

// Reverse mapping: product_id → plan name
const PRODUCT_TO_PLAN = {
  [process.env.POLAR_PRODUCT_STARTER]: 'starter',
  [process.env.POLAR_PRODUCT_PROFESSIONAL]: 'professional',
  [process.env.POLAR_PRODUCT_ENTERPRISE]: 'enterprise',
}

// In-memory dedupe cache
const processedEvents = new Map()
const EVENT_CACHE_MAX = 1000
const EVENT_CACHE_TTL_MS = 15 * 60 * 1000

function pruneCache() {
  const now = Date.now()
  for (const [id, ts] of processedEvents) {
    if (now - ts > EVENT_CACHE_TTL_MS) processedEvents.delete(id)
  }
  while (processedEvents.size > EVENT_CACHE_MAX) {
    const oldest = processedEvents.keys().next().value
    processedEvents.delete(oldest)
  }
}

/**
 * Read raw body as Buffer for signature verification
 * Required for Vercel serverless functions
 */
async function getRawBody(req) {
  if (req.body && typeof req.body === 'string') {
    return Buffer.from(req.body, 'utf8')
  }
  if (Buffer.isBuffer(req.body)) {
    return req.body
  }

  const chunks = []
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }
  return Buffer.concat(chunks)
}

/**
 * Sync subscription to User collection
 * customer.external_id contains the Clerk userId
 */
async function syncSubscriptionToUser(subscription, eventType) {
  await connectToDatabase()

  // external_id is the Clerk userId
  const clerkId = subscription.customer?.external_id

  if (!clerkId) {
    console.warn('No external_id in customer', {
      subscriptionId: subscription.id,
      eventType,
    })
    return { success: false, error: 'Missing customer external_id' }
  }

  // Primary: Use plan_name from metadata (set during checkout creation)
  // Fallback: Map product_id to plan name
  const metadataPlan = subscription.metadata?.plan_name
  const productId =
    subscription.product_id || subscription.prices?.[0]?.product_id
  const plan = metadataPlan || PRODUCT_TO_PLAN[productId] || 'starter'
  const subscriptionStatus = subscription.status

  try {
    // Upsert pattern: find by clerkId, update or create
    await User.findOneAndUpdate(
      { clerkId },
      {
        $set: {
          plan,
          subscriptionStatus,
          polarCustomerId: subscription.customer?.id,
          polarSubscriptionId: subscription.id,
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    )

    console.log('✅ Synced subscription to user', {
      clerkId,
      status: subscriptionStatus,
      plan,
    })
    return { success: true }
  } catch (err) {
    console.error('Exception syncing subscription', err)
    return { success: false, error: err.message }
  }
}

async function sendPolarEmail(subject, body) {
  try {
    const toEmail = process.env.POLAR_ALERT_EMAIL || process.env.CONTACT_EMAIL
    if (!toEmail) return
    const resend = getResendClient()
    await resend.emails.send({
      from: 'TCDynamics <contact@tcdynamics.fr>',
      to: [toEmail],
      subject,
      text: body,
    })
  } catch (err) {
    console.warn('Polar email notification failed', err)
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const webhookSecret = process.env.POLAR_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('POLAR_WEBHOOK_SECRET not configured')
    return res.status(500).json({ error: 'Webhook secret not configured' })
  }

  let event
  try {
    const body = await getRawBody(req)
    event = validateEvent(body, req.headers, webhookSecret)
  } catch (err) {
    if (err instanceof WebhookVerificationError) {
      console.error('Webhook signature verification failed:', err.message)
      return res.status(403).json({ error: 'Invalid signature' })
    }
    console.error('Webhook processing error:', err)
    return res.status(400).json({ error: err.message })
  }

  // Idempotency check
  pruneCache()
  if (processedEvents.has(event.id)) {
    return res
      .status(200)
      .json({ received: true, type: event.type, replay: true })
  }

  // Persist to database
  try {
    const result = await savePolarEvent(event)
    if (result?.duplicate) {
      return res
        .status(200)
        .json({ received: true, type: event.type, replay: true })
    }
  } catch (err) {
    console.warn('Event persistence failed', err)
  }

  processedEvents.set(event.id, Date.now())
  console.log(`Received Polar webhook: ${event.type}`)

  try {
    switch (event.type) {
      case 'checkout.updated': {
        const checkout = event.data
        if (checkout.status === 'succeeded' && checkout.subscription) {
          await syncSubscriptionToUser(checkout.subscription, event.type)
        }
        await sendPolarEmail(
          'Checkout updated',
          `Checkout ${checkout.id} status: ${checkout.status}`
        )
        break
      }

      case 'subscription.created': {
        await syncSubscriptionToUser(event.data, event.type)
        await sendPolarEmail(
          'Subscription created',
          `Subscription ${event.data.id}`
        )
        break
      }

      case 'subscription.updated': {
        await syncSubscriptionToUser(event.data, event.type)
        await sendPolarEmail(
          'Subscription updated',
          `Status: ${event.data.status}`
        )
        break
      }

      case 'subscription.revoked': {
        const subscription = event.data
        const clerkId = subscription.customer?.external_id
        if (clerkId) {
          await connectToDatabase()
          const user = await User.findOneAndUpdate(
            { clerkId },
            {
              $set: {
                subscriptionStatus: 'canceled',
                polarSubscriptionId: null,
              },
            },
            { new: true }
          )

          if (!user) {
            console.error('Failed to revoke subscription in users collection', {
              clerkId,
              subscriptionId: subscription.id,
              eventType: event.type,
            })
            throw new Error(
              `Failed to update user ${clerkId} for revoked subscription ${subscription.id}`
            )
          }

          console.log('✅ Revoked subscription for user', {
            clerkId,
            subscriptionId: subscription.id,
          })
        } else {
          console.warn('No external_id in customer for revoked subscription', {
            subscriptionId: subscription.id,
            eventType: event.type,
          })
        }
        await sendPolarEmail(
          'Subscription revoked',
          `Subscription ${subscription.id} revoked`
        )
        break
      }

      case 'subscription.uncanceled': {
        await syncSubscriptionToUser(event.data, event.type)
        await sendPolarEmail(
          'Subscription uncanceled',
          `Subscription ${event.data.id} was reactivated`
        )
        break
      }

      case 'order.paid': {
        await sendPolarEmail('Order paid', `Order ${event.data.id} paid`)
        break
      }

      case 'customer.state_changed': {
        console.log('Customer state changed:', event.data.customer?.id)
        break
      }

      default:
        console.log(`Unhandled Polar event: ${event.type}`)
    }

    return res.status(202).json({ received: true, type: event.type })
  } catch (error) {
    console.error('Error processing webhook:', error)
    processedEvents.delete(event.id)
    return res.status(500).json({ error: 'Webhook processing failed' })
  }
}

// CRITICAL - Disable body parser for signature verification
export const config = {
  api: { bodyParser: false },
}
