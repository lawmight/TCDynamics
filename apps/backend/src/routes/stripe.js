require('dotenv').config()
const express = require('express')
const router = express.Router()
const { logger } = require('../utils/logger')

// Initialize Stripe with secret key
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

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
router.post('/stripe/create-checkout-session', async (req, res) => {
  try {
    const { priceId, planName } = req.body

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

    // Get the frontend URL from environment or use default
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080'

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
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
      },
      // Enable customer portal for subscription management
      billing_address_collection: 'required',
      allow_promotion_codes: true,
    })

    logger.info('Stripe checkout session created', {
      sessionId: session.id,
      planName,
      priceId,
    })

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    })
  } catch (error) {
    logger.error('Error creating Stripe checkout session', {
      error: error.message,
      stack: error.stack,
    })

    res.status(500).json({
      success: false,
      message: 'Failed to create checkout session',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
})

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
router.get('/stripe/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required',
      })
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId)

    logger.info('Stripe session retrieved', { sessionId })

    res.json({
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
    logger.error('Error retrieving Stripe session', {
      error: error.message,
      sessionId: req.params.sessionId,
    })

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve session',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
})

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
  async (req, res) => {
    const sig = req.headers['stripe-signature']
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    let event

    try {
      // Verify webhook signature
      event = stripe.webhooks.constructEvent(
        req.rawBody || req.body,
        sig,
        webhookSecret
      )
    } catch (err) {
      logger.error('Webhook signature verification failed', {
        error: err.message,
      })
      return res.status(400).send(`Webhook Error: ${err.message}`)
    }

    // Handle the event
    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object
          logger.info('Checkout session completed', {
            sessionId: session.id,
            customerEmail: session.customer_details?.email,
          })
          // TODO: Provision user access, send welcome email, etc.
          break
        }

        case 'invoice.payment_succeeded': {
          const invoice = event.data.object
          logger.info('Invoice payment succeeded', {
            invoiceId: invoice.id,
            customerId: invoice.customer,
          })
          // TODO: Update subscription status, send receipt
          break
        }

        case 'invoice.payment_failed': {
          const invoice = event.data.object
          logger.warn('Invoice payment failed', {
            invoiceId: invoice.id,
            customerId: invoice.customer,
          })
          // TODO: Send payment failure notification
          break
        }

        case 'customer.subscription.created': {
          const subscription = event.data.object
          logger.info('Subscription created', {
            subscriptionId: subscription.id,
            customerId: subscription.customer,
          })
          // TODO: Activate user subscription
          break
        }

        case 'customer.subscription.updated': {
          const subscription = event.data.object
          logger.info('Subscription updated', {
            subscriptionId: subscription.id,
            status: subscription.status,
          })
          // TODO: Update subscription status in database
          break
        }

        case 'customer.subscription.deleted': {
          const subscription = event.data.object
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

      res.json({ received: true })
    } catch (error) {
      logger.error('Error processing webhook event', {
        error: error.message,
        eventType: event.type,
      })
      res.status(500).json({ error: 'Webhook processing failed' })
    }
  }
)

module.exports = router
