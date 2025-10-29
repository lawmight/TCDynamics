require('dotenv').config()
const express = require('express')
const router = express.Router()
const { logger } = require('../utils/logger')

// Validate Stripe configuration before initializing
console.log('🔧 Validating Stripe configuration...')

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY not found in environment variables')
  console.error('Please add STRIPE_SECRET_KEY to your .env file')
  process.exit(1)
}

if (!process.env.STRIPE_SECRET_KEY.startsWith('sk_')) {
  console.error('❌ Invalid STRIPE_SECRET_KEY format')
  console.error('Stripe secret key should start with "sk_test_" or "sk_live_"')
  console.error(
    'Current key starts with:',
    process.env.STRIPE_SECRET_KEY.substring(0, 10) + '...'
  )
  process.exit(1)
}

console.log('✅ Stripe secret key validation passed')
console.log('🔧 Initializing Stripe SDK...')

// Initialize Stripe with latest API version (2025-09-30.clover)
let stripe
try {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-09-30.clover',
  })
  console.log('✅ Stripe SDK initialized successfully')
} catch (error) {
  console.error('❌ Failed to initialize Stripe SDK:', error.message)
  process.exit(1)
}

/**
 * @swagger
 * /api/stripe-connect/create-account:
 *   post:
 *     summary: Create a new Stripe Connect account
 *     description: Creates a new connected account with controller settings for fee collection and dashboard access
 *     tags:
 *       - Stripe Connect
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address for the connected account
 *               country:
 *                 type: string
 *                 description: Country code (e.g., 'US', 'FR', 'GB')
 *                 default: 'US'
 *     responses:
 *       200:
 *         description: Connected account created successfully
 *       400:
 *         description: Invalid request parameters
 *       500:
 *         description: Server error
 */
router.post('/stripe-connect/create-account', async (req, res) => {
  try {
    const { email, country = 'US' } = req.body

    // Validate required fields
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      })
    }

    // Validate Stripe secret key is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      logger.error('Stripe secret key not configured')
      return res.status(500).json({
        success: false,
        message: 'Stripe configuration error',
      })
    }

    // Create connected account with controller settings
    // Platform controls fee collection - connected account pays fees
    // Stripe handles payment disputes and losses
    // Connected account gets full access to Stripe dashboard
    const account = await stripe.accounts.create({
      controller: {
        // Platform controls fee collection - connected account pays fees
        fees: {
          payer: 'account',
        },
        // Stripe handles payment disputes and losses
        losses: {
          payments: 'stripe',
        },
        // Connected account gets full access to Stripe dashboard
        stripe_dashboard: {
          type: 'full',
        },
      },
      email: email,
      country: country,
      // Add metadata for tracking
      metadata: {
        created_by: 'tcdynamics_platform',
        created_at: new Date().toISOString(),
      },
    })

    logger.info('Stripe Connect account created', {
      accountId: account.id,
      email: email,
      country: country,
    })

    res.json({
      success: true,
      accountId: account.id,
      email: account.email,
      country: account.country,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      details_submitted: account.details_submitted,
    })
  } catch (error) {
    logger.error('Error creating Stripe Connect account', {
      error: error.message,
      stack: error.stack,
      email: req.body.email,
    })

    res.status(500).json({
      success: false,
      message: 'Failed to create connected account',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
})

/**
 * @swagger
 * /api/stripe-connect/account/{accountId}:
 *   get:
 *     summary: Retrieve connected account details
 *     description: Gets the current status and details of a connected account
 *     tags:
 *       - Stripe Connect
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *         description: Stripe Connect account ID
 *     responses:
 *       200:
 *         description: Account details retrieved successfully
 *       404:
 *         description: Account not found
 *       500:
 *         description: Server error
 */
router.get('/stripe-connect/account/:accountId', async (req, res) => {
  try {
    const { accountId } = req.params

    if (!accountId) {
      return res.status(400).json({
        success: false,
        message: 'Account ID is required',
      })
    }

    // Retrieve account details
    const account = await stripe.accounts.retrieve(accountId)

    logger.info('Stripe Connect account retrieved', { accountId })

    res.json({
      success: true,
      account: {
        id: account.id,
        email: account.email,
        country: account.country,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        details_submitted: account.details_submitted,
        requirements: account.requirements,
        business_type: account.business_type,
        type: account.type,
      },
    })
  } catch (error) {
    logger.error('Error retrieving Stripe Connect account', {
      error: error.message,
      accountId: req.params.accountId,
    })

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve account',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
})

/**
 * @swagger
 * /api/stripe-connect/create-account-link:
 *   post:
 *     summary: Create account link for onboarding
 *     description: Creates a Stripe account link for onboarding connected accounts
 *     tags:
 *       - Stripe Connect
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accountId
 *             properties:
 *               accountId:
 *                 type: string
 *                 description: Stripe Connect account ID
 *               refreshUrl:
 *                 type: string
 *                 description: URL to redirect to when link expires
 *                 default: Frontend onboarding page
 *               returnUrl:
 *                 type: string
 *                 description: URL to redirect to after onboarding completion
 *                 default: Frontend dashboard
 *     responses:
 *       200:
 *         description: Account link created successfully
 *       400:
 *         description: Invalid request parameters
 *       500:
 *         description: Server error
 */
router.post('/stripe-connect/create-account-link', async (req, res) => {
  try {
    const { accountId, refreshUrl, returnUrl } = req.body

    if (!accountId) {
      return res.status(400).json({
        success: false,
        message: 'Account ID is required',
      })
    }

    // Get frontend URL from environment
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080'

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url:
        refreshUrl || `${frontendUrl}/connect/onboarding?account=${accountId}`,
      return_url:
        returnUrl || `${frontendUrl}/connect/dashboard?account=${accountId}`,
      type: 'account_onboarding',
    })

    logger.info('Stripe Connect account link created', {
      accountId,
      linkUrl: accountLink.url,
    })

    res.json({
      success: true,
      url: accountLink.url,
      expires_at: accountLink.expires_at,
    })
  } catch (error) {
    logger.error('Error creating Stripe Connect account link', {
      error: error.message,
      accountId: req.body.accountId,
    })

    res.status(500).json({
      success: false,
      message: 'Failed to create account link',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
})

/**
 * @swagger
 * /api/stripe-connect/products:
 *   get:
 *     summary: List products for a connected account
 *     description: Retrieves all products for a specific connected account
 *     tags:
 *       - Stripe Connect
 *     parameters:
 *       - in: query
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *         description: Stripe Connect account ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of products to retrieve
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *       400:
 *         description: Invalid request parameters
 *       500:
 *         description: Server error
 */
router.get('/stripe-connect/products', async (req, res) => {
  try {
    const { accountId, limit = 10 } = req.query

    if (!accountId) {
      return res.status(400).json({
        success: false,
        message: 'Account ID is required',
      })
    }

    // List products for the connected account
    const products = await stripe.products.list(
      {
        limit: parseInt(limit),
        active: true,
      },
      {
        stripeAccount: accountId, // Use stripeAccount for the Stripe-Account header
      }
    )

    logger.info('Stripe Connect products retrieved', {
      accountId,
      productCount: products.data.length,
    })

    res.json({
      success: true,
      products: products.data.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        active: product.active,
        created: product.created,
        default_price: product.default_price,
        images: product.images,
        metadata: product.metadata,
      })),
      has_more: products.has_more,
    })
  } catch (error) {
    logger.error('Error retrieving Stripe Connect products', {
      error: error.message,
      accountId: req.query.accountId,
    })

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve products',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
})

/**
 * @swagger
 * /api/stripe-connect/products:
 *   post:
 *     summary: Create a product for a connected account
 *     description: Creates a new product with pricing for a connected account
 *     tags:
 *       - Stripe Connect
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accountId
 *               - name
 *               - description
 *               - priceInCents
 *               - currency
 *             properties:
 *               accountId:
 *                 type: string
 *                 description: Stripe Connect account ID
 *               name:
 *                 type: string
 *                 description: Product name
 *               description:
 *                 type: string
 *                 description: Product description
 *               priceInCents:
 *                 type: integer
 *                 description: Price in cents (e.g., 2999 for $29.99)
 *               currency:
 *                 type: string
 *                 description: Currency code (e.g., 'usd', 'eur')
 *                 default: 'usd'
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of image URLs
 *     responses:
 *       200:
 *         description: Product created successfully
 *       400:
 *         description: Invalid request parameters
 *       500:
 *         description: Server error
 */
router.post('/stripe-connect/products', async (req, res) => {
  try {
    const {
      accountId,
      name,
      description,
      priceInCents,
      currency = 'usd',
      images = [],
    } = req.body

    // Validate required fields
    if (!accountId || !name || !description || !priceInCents) {
      return res.status(400).json({
        success: false,
        message: 'Account ID, name, description, and price are required',
      })
    }

    // Validate price is positive
    if (priceInCents <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be greater than 0',
      })
    }

    // Create product for the connected account
    const product = await stripe.products.create(
      {
        name: name,
        description: description,
        images: images,
        default_price_data: {
          unit_amount: priceInCents,
          currency: currency,
        },
        metadata: {
          created_by: 'tcdynamics_platform',
          created_at: new Date().toISOString(),
        },
      },
      {
        stripeAccount: accountId, // Use stripeAccount for the Stripe-Account header
      }
    )

    logger.info('Stripe Connect product created', {
      accountId,
      productId: product.id,
      name: product.name,
      price: priceInCents,
      currency: currency,
    })

    res.json({
      success: true,
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        active: product.active,
        created: product.created,
        default_price: product.default_price,
        images: product.images,
        metadata: product.metadata,
      },
    })
  } catch (error) {
    logger.error('Error creating Stripe Connect product', {
      error: error.message,
      accountId: req.body.accountId,
      name: req.body.name,
    })

    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
})

/**
 * @swagger
 * /api/stripe-connect/create-checkout-session:
 *   post:
 *     summary: Create checkout session for connected account
 *     description: Creates a checkout session for purchasing products from a connected account with application fee
 *     tags:
 *       - Stripe Connect
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accountId
 *               - lineItems
 *               - successUrl
 *             properties:
 *               accountId:
 *                 type: string
 *                 description: Stripe Connect account ID
 *               lineItems:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     price_data:
 *                       type: object
 *                       properties:
 *                         unit_amount:
 *                           type: integer
 *                         currency:
 *                           type: string
 *                         product_data:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                     quantity:
 *                       type: integer
 *               successUrl:
 *                 type: string
 *                 description: URL to redirect to after successful payment
 *               cancelUrl:
 *                 type: string
 *                 description: URL to redirect to if payment is cancelled
 *               applicationFeeAmount:
 *                 type: integer
 *                 description: Application fee amount in cents
 *                 default: 123
 *     responses:
 *       200:
 *         description: Checkout session created successfully
 *       400:
 *         description: Invalid request parameters
 *       500:
 *         description: Server error
 */
router.post('/stripe-connect/create-checkout-session', async (req, res) => {
  try {
    const {
      accountId,
      lineItems,
      successUrl,
      cancelUrl,
      applicationFeeAmount = 123, // Sample application fee in cents
    } = req.body

    // Validate required fields
    if (!accountId || !lineItems || !successUrl) {
      return res.status(400).json({
        success: false,
        message: 'Account ID, line items, and success URL are required',
      })
    }

    // Validate line items
    if (!Array.isArray(lineItems) || lineItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Line items must be a non-empty array',
      })
    }

    // Get frontend URL for cancel URL if not provided
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080'
    const defaultCancelUrl = `${frontendUrl}/store/${accountId}`

    // Create checkout session with application fee
    const session = await stripe.checkout.sessions.create(
      {
        line_items: lineItems,
        payment_intent_data: {
          // Sample Application Fee - in production, calculate based on your business model
          application_fee_amount: applicationFeeAmount,
        },
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl || defaultCancelUrl,
        // Enable customer portal for connected account
        customer_creation: 'always',
        billing_address_collection: 'required',
        // Add metadata for tracking
        metadata: {
          connected_account: accountId,
          platform: 'tcdynamics',
          created_at: new Date().toISOString(),
        },
      },
      {
        stripeAccount: accountId, // Use stripeAccount for the Stripe-Account header
      }
    )

    logger.info('Stripe Connect checkout session created', {
      sessionId: session.id,
      accountId,
      applicationFeeAmount,
    })

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    })
  } catch (error) {
    logger.error('Error creating Stripe Connect checkout session', {
      error: error.message,
      accountId: req.body.accountId,
    })

    res.status(500).json({
      success: false,
      message: 'Failed to create checkout session',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
})

module.exports = router
