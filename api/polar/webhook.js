import { validateEvent, WebhookVerificationError } from '@polar-sh/sdk/webhooks'
import { getResendClient } from '../_lib/email.js'
import { savePolarEvent, getSupabaseClient } from '../_lib/supabase.js'

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
 * NIA-verified: Read raw body as Buffer for signature verification
 * This is REQUIRED for Vercel serverless functions
 */
async function getRawBody(req) {
  if (req.body && typeof req.body === 'string') {
    return Buffer.from(req.body, 'utf8')
  }
  if (Buffer.isBuffer(req.body)) {
    return req.body
  }

  // Collect chunks as Buffers
  const chunks = []
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }
  return Buffer.concat(chunks)
}

/**
 * Sync subscription to orgs table
 * NIA-verified: customer.external_id contains our org_id
 */
async function syncSubscriptionToOrg(subscription, eventType) {
  const supabase = getSupabaseClient()

  // NIA-verified: external_id is immutable and unique per organization
  const orgId = subscription.customer?.external_id

  if (!orgId) {
    console.warn('No external_id in customer', {
      subscriptionId: subscription.id,
      eventType,
    })
    return { success: false, error: 'Missing customer external_id' }
  }

  // NIA-verified: Metadata flows from checkout → subscription
  // Primary: Use plan_name from metadata (set during checkout creation)
  // Fallback: Map product_id to plan name
  const metadataPlan = subscription.metadata?.plan_name
  const productId =
    subscription.product_id || subscription.prices?.[0]?.product_id
  const plan = metadataPlan || PRODUCT_TO_PLAN[productId] || 'starter'

  // NIA-verified status mapping:
  // - cancel_at_period_end: true + status: active = still active until period ends (customer can uncancel)
  // - status: canceled = period ended OR immediate revocation happened
  // Note: 'revoked' is a webhook EVENT, not a status. The final status is 'canceled'.
  const subscriptionStatus = subscription.status // Use directly - Polar uses correct statuses

  try {
    const { error } = await supabase.from('orgs').upsert(
      {
        id: orgId,
        plan,
        subscription_status: subscriptionStatus,
        polar_customer_id: subscription.customer?.id,
        polar_subscription_id: subscription.id,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    )

    if (error) {
      console.error('Failed to sync subscription', error)
      return { success: false, error: error.message }
    }

    console.log('✅ Synced subscription to org', {
      orgId,
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
    // NIA-verified: Must use raw body Buffer for signature verification
    const body = await getRawBody(req)

    // NIA-verified: Use validateEvent from @polar-sh/sdk/webhooks
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
      // NIA-verified: checkout.updated fires when status changes to 'succeeded'
      case 'checkout.updated': {
        const checkout = event.data
        if (checkout.status === 'succeeded' && checkout.subscription) {
          await syncSubscriptionToOrg(checkout.subscription, event.type)
        }
        await sendPolarEmail(
          'Checkout updated',
          `Checkout ${checkout.id} status: ${checkout.status}`
        )
        break
      }

      case 'subscription.created': {
        await syncSubscriptionToOrg(event.data, event.type)
        await sendPolarEmail(
          'Subscription created',
          `Subscription ${event.data.id}`
        )
        break
      }

      // NIA-verified: subscription.updated is catch-all for cancellations, un-cancellations
      case 'subscription.updated': {
        await syncSubscriptionToOrg(event.data, event.type)
        await sendPolarEmail(
          'Subscription updated',
          `Status: ${event.data.status}`
        )
        break
      }

      case 'subscription.revoked': {
        const subscription = event.data
        const orgId = subscription.customer?.external_id
        if (orgId) {
          const supabase = getSupabaseClient()
          await supabase
            .from('orgs')
            .update({
              subscription_status: 'canceled',
              polar_subscription_id: null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', orgId)
        }
        await sendPolarEmail(
          'Subscription revoked',
          `Subscription ${subscription.id} revoked`
        )
        break
      }

      // NIA-verified: subscription.uncanceled fires when customer reverses cancellation
      case 'subscription.uncanceled': {
        await syncSubscriptionToOrg(event.data, event.type)
        await sendPolarEmail(
          'Subscription uncanceled',
          `Subscription ${event.data.id} was reactivated`
        )
        break
      }

      // NIA-verified: order.paid is recommended for payment confirmation
      case 'order.paid': {
        await sendPolarEmail('Order paid', `Order ${event.data.id} paid`)
        break
      }

      // NIA-verified: customer.state_changed is comprehensive catch-all
      case 'customer.state_changed': {
        console.log('Customer state changed:', event.data.customer?.id)
        break
      }

      default:
        console.log(`Unhandled Polar event: ${event.type}`)
    }

    // NIA-verified: Return 202 for successful processing
    return res.status(202).json({ received: true, type: event.type })
  } catch (error) {
    console.error('Error processing webhook:', error)
    processedEvents.delete(event.id)
    return res.status(500).json({ error: 'Webhook processing failed' })
  }
}

// NIA-verified: CRITICAL - Disable body parser for signature verification
export const config = {
  api: { bodyParser: false },
}
