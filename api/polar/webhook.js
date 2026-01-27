import { validateEvent, WebhookVerificationError } from '@polar-sh/sdk/webhooks'
import { getRawBody } from '../_lib/body.js'
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
 * Sync subscription to User collection
 * customer.external_id contains the Clerk userId
 * Handles manual onboarding checkouts (no clerkId but manual_onboarding metadata)
 */
async function syncSubscriptionToUser(subscription, eventType) {
  await connectToDatabase()

  // external_id is the Clerk userId
  const clerkId = subscription.customer?.external_id
  const metadata = subscription.metadata || {}
  const isManualOnboarding = metadata.manual_onboarding === 'true'

  // Handle manual onboarding checkouts (no clerkId)
  if (!clerkId && isManualOnboarding) {
    const customerEmail = subscription.customer?.email
    const paymentType = metadata.payment_type || 'unknown'
    const planName = metadata.plan_name || 'enterprise'
    const amount =
      subscription.amount || subscription.prices?.[0]?.price_amount || 0

    console.log('📝 Manual checkout detected (no clerkId):', {
      subscriptionId: subscription.id,
      eventType,
      customerEmail,
      amount: `${(amount / 100).toFixed(2)}€`,
      paymentType,
      planName,
    })

    // Send notification email to admin
    try {
      const emailBody = `Paiement manuel détecté (sans compte Clerk):

Abonnement ID: ${subscription.id}
Email client: ${customerEmail || 'Non fourni'}
Montant: ${(amount / 100).toFixed(2)}€
Type de paiement: ${paymentType === 'subscription' ? 'Abonnement récurrent' : 'Paiement unique'}
Plan: ${planName}
Statut: ${subscription.status}

Ce paiement doit être lié manuellement à un compte Clerk lorsque le client s'inscrit.

---
Reçu le ${new Date().toLocaleString('fr-FR')} via webhook Polar`

      await sendPolarEmail(
        `Paiement manuel: ${customerEmail || 'Email non fourni'}`,
        emailBody
      )
    } catch (err) {
      console.warn('Failed to send manual checkout notification email', err)
    }

    // Return success with manualOnboarding flag (don't create User record)
    return { success: true, manualOnboarding: true }
  }

  // Normal flow: require clerkId for authenticated checkouts
  if (!clerkId) {
    console.warn('No external_id in customer', {
      subscriptionId: subscription.id,
      eventType,
      metadata,
    })
    return { success: false, error: 'Missing customer external_id' }
  }

  // Primary: Use plan_name from metadata (set during checkout creation)
  // Fallback: Map product_id to plan name
  const metadataPlan = metadata.plan_name
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
        const order = event.data
        const metadata = order.metadata || {}
        const isManualOnboarding = metadata.manual_onboarding === 'true'

        // Handle manual onboarding one-time payments
        if (isManualOnboarding) {
          const customerEmail = order.customer?.email
          const paymentType = metadata.payment_type || 'one_time'
          const planName = metadata.plan_name || 'enterprise'
          const amount = order.total_amount || 0

          console.log('📝 Manual one-time payment detected (no clerkId):', {
            orderId: order.id,
            customerEmail,
            amount: `${(amount / 100).toFixed(2)}€`,
            paymentType,
            planName,
          })

          // Send notification email to admin
          try {
            const emailBody = `Paiement unique manuel détecté (sans compte Clerk):

Commande ID: ${order.id}
Email client: ${customerEmail || 'Non fourni'}
Montant: ${(amount / 100).toFixed(2)}€
Type de paiement: ${paymentType === 'subscription' ? 'Abonnement récurrent' : 'Paiement unique'}
Plan: ${planName}
Statut: ${order.status || 'paid'}

Ce paiement doit être lié manuellement à un compte Clerk lorsque le client s'inscrit.

---
Reçu le ${new Date().toLocaleString('fr-FR')} via webhook Polar`

            await sendPolarEmail(
              `Paiement unique manuel: ${customerEmail || 'Email non fourni'}`,
              emailBody
            )
          } catch (err) {
            console.warn(
              'Failed to send manual order notification email',
              err
            )
          }
        } else {
          // Normal authenticated order
          await sendPolarEmail('Order paid', `Order ${order.id} paid`)
        }
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
