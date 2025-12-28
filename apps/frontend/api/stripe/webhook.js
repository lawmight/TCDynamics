import Stripe from 'stripe'
import { getResendClient } from '../_lib/email.js'
import { saveStripeEvent, getSupabaseClient } from '../_lib/supabase.js'

// Lazy initialization of Stripe to handle missing environment variables
let stripe = null

// Bounded in-memory dedupe cache (Map preserves insertion order for easy eviction)
const processedEvents = new Map()
const EVENT_CACHE_MAX = parsePositiveInt(
  process.env.STRIPE_EVENT_CACHE_MAX,
  1000
)
const EVENT_CACHE_TTL_MS = parsePositiveInt(
  process.env.STRIPE_EVENT_CACHE_TTL_MS,
  15 * 60 * 1000
) // 15 minutes default

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

function pruneProcessedEvents() {
  const now = Date.now()

  // Drop expired entries
  for (const [id, ts] of processedEvents) {
    if (now - ts > EVENT_CACHE_TTL_MS) {
      processedEvents.delete(id)
    }
  }

  // Enforce max size by evicting oldest first
  const keysToDelete = []
  for (const key of processedEvents.keys()) {
    if (processedEvents.size - keysToDelete.length <= EVENT_CACHE_MAX) break
    keysToDelete.push(key)
  }
  for (const key of keysToDelete) {
    processedEvents.delete(key)
  }
}

function hasSeenEvent(eventId) {
  pruneProcessedEvents()
  return processedEvents.has(eventId)
}

function markEventProcessed(eventId) {
  pruneProcessedEvents()
  processedEvents.set(eventId, Date.now())
}

function getStripeClient() {
  if (!stripe) {
    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured')
    }
    stripe = new Stripe(secretKey)
  }
  return stripe
}

/**
 * Sync subscription data to orgs table in Supabase
 * @param {Object} subscription - Stripe subscription object
 * @param {string} eventType - Stripe event type (for logging)
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function syncSubscriptionToOrg(subscription, eventType) {
  const supabase = getSupabaseClient()
  const orgId = subscription.metadata?.org_id

  if (!orgId) {
    console.warn('No org_id in subscription metadata', {
      subscriptionId: subscription.id,
      eventType,
    })
    return { success: false, error: 'Missing org_id in subscription metadata' }
  }

  // Derive plan from metadata (set during checkout)
  const plan = subscription.metadata?.planName || 'starter'

  // Map Stripe subscription status to our status
  const statusMap = {
    active: 'active',
    trialing: 'trialing',
    past_due: 'past_due',
    canceled: 'canceled',
    unpaid: 'unpaid',
    incomplete: 'incomplete',
    incomplete_expired: 'canceled',
    paused: 'past_due',
  }
  const subscriptionStatus = statusMap[subscription.status] || 'incomplete'

  try {
    const { error } = await supabase.from('orgs').upsert(
      {
        id: orgId,
        plan,
        subscription_status: subscriptionStatus,
        stripe_customer_id: subscription.customer,
        stripe_subscription_id: subscription.id,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'id',
      }
    )

    if (error) {
      console.error('Failed to sync subscription to org', {
        error: error.message,
        orgId,
        subscriptionId: subscription.id,
        eventType,
      })
      return { success: false, error: error.message }
    }

    console.log('Successfully synced subscription to org', {
      orgId,
      subscriptionId: subscription.id,
      status: subscriptionStatus,
      plan,
      eventType,
    })

    return { success: true }
  } catch (err) {
    console.error('Exception syncing subscription to org', err)
    return { success: false, error: err.message }
  }
}

/**
 * Handle subscription deletion - mark org as canceled
 * @param {Object} subscription - Stripe subscription object
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function handleSubscriptionDeleted(subscription) {
  const supabase = getSupabaseClient()
  const orgId = subscription.metadata?.org_id

  if (!orgId) {
    console.warn('No org_id in deleted subscription metadata', {
      subscriptionId: subscription.id,
    })
    return { success: false, error: 'Missing org_id' }
  }

  try {
    const { error } = await supabase
      .from('orgs')
      .update({
        subscription_status: 'canceled',
        stripe_subscription_id: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orgId)

    if (error) {
      console.error('Failed to mark org as canceled', {
        error: error.message,
        orgId,
        subscriptionId: subscription.id,
      })
      return { success: false, error: error.message }
    }

    console.log('Successfully marked org as canceled', {
      orgId,
      subscriptionId: subscription.id,
    })

    return { success: true }
  } catch (err) {
    console.error('Exception marking org as canceled', err)
    return { success: false, error: err.message }
  }
}

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const sig = req.headers['stripe-signature']
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!sig) {
    console.error('Missing stripe-signature header')
    return res.status(400).json({ error: 'Missing stripe-signature header' })
  }

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured')
    return res.status(500).json({ error: 'Webhook secret not configured' })
  }

  let event

  try {
    // Get the raw body for signature verification
    const body = await getRawBody(req)

    // Verify webhook signature
    const stripeClient = getStripeClient()
    event = stripeClient.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return res.status(400).json({ error: `Webhook Error: ${err.message}` })
  }

  // Durable idempotency guard (database first)
  try {
    const persisted = await saveStripeEvent(event)
    if (persisted?.duplicate) {
      markEventProcessed(event.id)
      return res
        .status(200)
        .json({ received: true, type: event.type, replay: true })
    }
    if (!persisted?.success) {
      console.warn('Could not persist stripe event', persisted?.error)
    }
  } catch (persistErr) {
    console.warn('Stripe event persistence failed', persistErr)
  }

  // In-memory fast-path for this runtime
  if (hasSeenEvent(event.id)) {
    return res
      .status(200)
      .json({ received: true, type: event.type, replay: true })
  }

  markEventProcessed(event.id)

  // Handle the event
  console.log(`Received webhook event: ${event.type}`)

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        console.log('Checkout session completed:', session.id)
        console.log('Customer email:', session.customer_email)
        console.log('Payment status:', session.payment_status)

        // If session has a subscription, sync it to orgs table
        if (session.subscription) {
          const stripeClient = getStripeClient()
          try {
            const subscription = await stripeClient.subscriptions.retrieve(
              session.subscription
            )
            await syncSubscriptionToOrg(subscription, event.type)
          } catch (subErr) {
            console.error('Failed to retrieve subscription for sync', subErr)
          }
        }

        await sendStripeEmail(
          'Checkout session completed',
          `Session ${session.id} for ${session.customer_email || 'unknown'}`
        )

        break
      }

      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object
        console.log('Async payment succeeded:', session.id)

        await sendStripeEmail(
          'Async payment succeeded',
          `Session ${session.id} async payment succeeded`
        )
        break
      }

      case 'checkout.session.async_payment_failed': {
        const session = event.data.object
        console.log('Async payment failed:', session.id)

        await sendStripeEmail(
          'Async payment failed',
          `Session ${session.id} async payment failed`
        )
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object
        console.log('Subscription event:', event.type, subscription.id)
        console.log('Status:', subscription.status)

        // Sync subscription to orgs table
        await syncSubscriptionToOrg(subscription, event.type)

        await sendStripeEmail(
          `Subscription ${event.type}`,
          `Subscription ${subscription.id} status: ${subscription.status}`
        )

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        console.log('Subscription cancelled:', subscription.id)

        // Mark org as canceled
        await handleSubscriptionDeleted(subscription)

        await sendStripeEmail(
          'Subscription cancelled',
          `Subscription ${subscription.id} cancelled`
        )
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object
        console.log('Invoice payment succeeded:', invoice.id)

        await sendStripeEmail(
          'Invoice payment succeeded',
          `Invoice ${invoice.id} succeeded`
        )
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object
        console.log('Invoice payment failed:', invoice.id)

        await sendStripeEmail(
          'Invoice payment failed',
          `Invoice ${invoice.id} failed`
        )
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    // Return a response to acknowledge receipt of the event
    res.json({ received: true, type: event.type })
  } catch (error) {
    console.error('Error processing webhook:', error)
    // Remove from in-memory cache so retries can reprocess
    processedEvents.delete(event.id)
    return res.status(500).json({ error: 'Webhook processing failed' })
  }
}

// Helper function to get raw body (needed for signature verification)
// Stripe requires the raw binary Buffer for HMAC signature verification
async function getRawBody(req) {
  // If body is already a string, convert it to Buffer
  if (req.body && typeof req.body === 'string') {
    return Buffer.from(req.body, 'utf8')
  }

  // If body is already a Buffer, return it directly
  if (Buffer.isBuffer(req.body)) {
    return req.body
  }

  // Collect chunks as Buffers (not strings) to preserve binary data
  return new Promise((resolve, reject) => {
    const chunks = []
    // Do NOT set encoding - we need raw binary data
    req.on('data', chunk => {
      // Ensure chunk is a Buffer
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    })
    req.on('end', () => {
      // Concatenate all Buffer chunks into a single Buffer
      resolve(Buffer.concat(chunks))
    })
    req.on('error', reject)
  })
}

async function sendStripeEmail(subject, body) {
  try {
    const toEmail = process.env.STRIPE_ALERT_EMAIL || process.env.CONTACT_EMAIL
    if (!toEmail) {
      console.warn(
        'No STRIPE_ALERT_EMAIL/CONTACT_EMAIL configured; skipping email'
      )
      return
    }
    const resend = getResendClient()
    await resend.emails.send({
      from: 'TCDynamics <contact@tcdynamics.fr>',
      to: [toEmail],
      subject,
      text: body,
    })
  } catch (err) {
    console.warn('Stripe email notification failed', err)
  }
}

// Configure to receive raw body for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
}
