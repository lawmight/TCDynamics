/**
 * Stripe routes
 * Handles Stripe checkout sessions and webhooks
 */

import express, { Request, Response, Router } from 'express'
import Stripe from 'stripe'
import { v4 as uuidv4 } from 'uuid'
import { getStripe, verifyWebhookSignature } from '../services/stripe.service'
import { logger } from '../utils/logger'

const router: Router = express.Router()

// Simple in-memory cache for Stripe price metadata
const PRICE_CACHE_TTL_MS = 15 * 60 * 1000 // 15 minutes
const priceCache = new Map<string, { price: Stripe.Price; expiresAt: number }>()

const getCachedPrice = async (priceId: string): Promise<Stripe.Price> => {
  const cached = priceCache.get(priceId)
  if (cached && cached.expiresAt > Date.now()) {
    return cached.price
  }

  const stripe = getStripe()
  const price = await stripe.prices.retrieve(priceId)
  priceCache.set(priceId, { price, expiresAt: Date.now() + PRICE_CACHE_TTL_MS })
  return price
}

/**
 * @swagger
 * /api/stripe/create-checkout-session:
 *   post:
 *     summary: Create a Stripe checkout session
 *     description: Creates a new Stripe checkout session for subscription payment
 *     tags:
 *       - Stripe
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - priceId
 *               - planName
 *             properties:
 *               priceId:
 *                 type: string
 *                 description: Stripe price ID for the subscription plan
 *               planName:
 *                 type: string
 *                 description: Name of the plan (starter, professional, enterprise)
 *     responses:
 *       200:
 *         description: Checkout session created successfully
 *       400:
 *         description: Invalid request parameters
 *       500:
 *         description: Server error
 */
router.post(
  '/stripe/create-checkout-session',
  async (req: Request, res: Response) => {
    try {
      const { priceId, planName } = req.body as {
        priceId?: string
        planName?: string
        idempotencyKey?: string
      }

      if (!priceId || !planName) {
        logger.warn('Missing required fields for checkout session', {
          priceId,
          planName,
        })
        return res.status(400).json({
          success: false,
          message: 'Price ID and plan name are required',
        })
      }

      // Warm price metadata (cached) and validate price exists
      try {
        await getCachedPrice(priceId)
      } catch (error) {
        const err = error as Error
        logger.error('Invalid Stripe price ID', {
          priceId,
          error: err.message,
        })
        return res.status(400).json({
          success: false,
          message: 'Invalid priceId',
        })
      }

      // Get the frontend URL from environment or use default
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080'

      const idempotencyKey =
        (req.headers['idempotency-key'] as string) ||
        req.body?.idempotencyKey ||
        `checkout_${uuidv4()}`

      const stripe = getStripe()

      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create(
        {
          mode: 'subscription',
          payment_method_types: ['card'],
          line_items: [
            {
              price: priceId,
              quantity: 1,
            },
          ],
          success_url: `${frontendUrl}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${frontendUrl}/pricing`,
          metadata: {
            planName,
            idempotencyKey, // Store for reference/debugging
          },
          billing_address_collection: 'required',
          allow_promotion_codes: true,
        },
        {
          idempotencyKey,
        }
      )

      logger.info('Stripe checkout session created', {
        sessionId: session.id,
        planName,
        priceId,
      })

      return res.json({
        success: true,
        sessionId: session.id,
        url: session.url,
      })
    } catch (error) {
      const err = error as Error
      logger.error('Error creating Stripe checkout session', {
        error: err.message,
        stack: err.stack,
      })

      return res.status(500).json({
        success: false,
        message: 'Failed to create checkout session',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined,
      })
    }
  }
)

/**
 * @swagger
 * /api/stripe/session/{sessionId}:
 *   get:
 *     summary: Retrieve a Stripe checkout session
 *     description: Gets details of a Stripe checkout session by ID
 *     tags:
 *       - Stripe
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Stripe checkout session ID
 *     responses:
 *       200:
 *         description: Session details retrieved successfully
 *       404:
 *         description: Session not found
 *       500:
 *         description: Server error
 */
router.get(
  '/stripe/session/:sessionId',
  async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params

      if (!sessionId) {
        return res.status(400).json({
          success: false,
          message: 'Session ID is required',
        })
      }

      const stripe = getStripe()
      const session = await stripe.checkout.sessions.retrieve(sessionId)

      logger.info('Stripe session retrieved', { sessionId })

      return res.json({
        success: true,
        session: {
          id: session.id,
          status: session.status,
          customerEmail: session.customer_details?.email,
          amountTotal: session.amount_total,
          currency: session.currency,
          paymentStatus: session.payment_status,
        },
      })
    } catch (error) {
      const err = error as Error
      logger.error('Error retrieving Stripe session', {
        error: err.message,
        sessionId: req.params.sessionId,
      })

      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve session',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined,
      })
    }
  }
)

/**
 * @swagger
 * /api/stripe/webhook:
 *   post:
 *     summary: Stripe webhook endpoint
 *     description: Handles Stripe webhook events for payment processing
 *     tags:
 *       - Stripe
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *       400:
 *         description: Invalid webhook signature
 *       500:
 *         description: Server error
 */
router.post(
  '/stripe/webhook',
  express.raw({ type: 'application/json' }),
  async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'] as string | undefined
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (!sig) {
      logger.error('Missing stripe-signature header')
      return res.status(400).send('Missing stripe-signature header')
    }

    if (!webhookSecret) {
      logger.error('STRIPE_WEBHOOK_SECRET is not configured')
      return res.status(500).send('Webhook secret not configured')
    }

    let event: Stripe.Event

    try {
      // Verify webhook signature using the service
      const rawBody =
        (req as Request & { rawBody?: Buffer }).rawBody || req.body
      event = verifyWebhookSignature(rawBody, sig, webhookSecret)
    } catch (err) {
      const error = err as Error
      logger.error('Webhook signature verification failed', {
        error: error.message,
      })
      return res.status(400).send(`Webhook Error: ${error.message}`)
    }

    // Handle the event
    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session
          logger.info('Checkout session completed', {
            sessionId: session.id,
            customerEmail: session.customer_details?.email,
          })
          // TODO: Provision user access, send welcome email, etc.
          break
        }

        case 'invoice.payment_succeeded': {
          const invoice = event.data.object as Stripe.Invoice
          logger.info('Invoice payment succeeded', {
            invoiceId: invoice.id,
            customerId: invoice.customer,
          })
          // TODO: Update subscription status, send receipt
          break
        }

        case 'invoice.payment_failed': {
          const invoice = event.data.object as Stripe.Invoice
          logger.warn('Invoice payment failed', {
            invoiceId: invoice.id,
            customerId: invoice.customer,
          })
          // TODO: Send payment failure notification
          break
        }

        case 'customer.subscription.created': {
          const subscription = event.data.object as Stripe.Subscription
          logger.info('Subscription created', {
            subscriptionId: subscription.id,
            customerId: subscription.customer,
          })
          // TODO: Activate user subscription
          break
        }

        case 'customer.subscription.updated': {
          const subscription = event.data.object as Stripe.Subscription
          logger.info('Subscription updated', {
            subscriptionId: subscription.id,
            status: subscription.status,
          })
          // TODO: Update subscription status in database
          break
        }

        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription
          logger.info('Subscription deleted', {
            subscriptionId: subscription.id,
            customerId: subscription.customer,
          })
          // TODO: Deactivate user subscription
          break
        }

        default:
          logger.info('Unhandled webhook event type', { type: event.type })
      }

      return res.json({ received: true })
    } catch (error) {
      const err = error as Error
      logger.error('Error processing webhook event', {
        error: err.message,
        eventType: event.type,
      })
      return res.status(500).json({ error: 'Webhook processing failed' })
    }
  }
)

export default router
