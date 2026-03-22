/**
 * Vercel Serverless Function for Polar Checkout
 * GET: Retrieve checkout session details (requires auth). Use GET /api/polar/checkout?checkoutId=<id>
 * POST: Create checkout. Supports ?public=true (no auth, optional X-Checkout-Token) or authenticated (Clerk JWT).
 */

/**
 * @security
 * Auth:
 * - GET and standard POST: Clerk JWT (`verifyClerkAuth`)
 * - Public POST flow: `x-checkout-token` when `PUBLIC_CHECKOUT_SECRET` is set
 * Tenant isolation: authenticated checkout metadata ties to JWT user id
 * Rate limit: N/A (auth/token-protected endpoint)
 * Last audit: 2026-02-26 (Phase 4)
 */

import { Polar } from '@polar-sh/sdk'
import { verifyClerkAuth } from '../_lib/auth.js'
import { allowCors } from '../_lib/cors.js'
import logger from '../_lib/logger.js'

const POLAR_PRODUCTS = {
  starter: process.env.POLAR_PRODUCT_STARTER,
  professional: process.env.POLAR_PRODUCT_PROFESSIONAL,
  enterprise: process.env.POLAR_PRODUCT_ENTERPRISE,
}
const MIN_CHECKOUT_AMOUNT = Number(process.env.MIN_CHECKOUT_AMOUNT) || 216000 // Default: 2160€ in cents
const PUBLIC_CHECKOUT_SECRET = process.env.PUBLIC_CHECKOUT_SECRET

function getPolarServer() {
  if (process.env.POLAR_SERVER) return process.env.POLAR_SERVER
  if (process.env.VERCEL_ENV === 'preview') return 'sandbox'
  return 'production'
}

const polar = process.env.POLAR_ACCESS_TOKEN
  ? new Polar({
      accessToken: process.env.POLAR_ACCESS_TOKEN,
      server: getPolarServer(),
    })
  : null

const CHECKOUT_FRONTEND_ORIGIN =
  process.env.VITE_FRONTEND_URL ||
  process.env.FRONTEND_URL ||
  (process.env.NODE_ENV === 'development'
    ? 'http://localhost:3100'
    : 'https://tcdynamics.fr')

async function handleGet(req, res) {
  const { checkoutId } = req.query
  if (!checkoutId) {
    return res.status(400).json({
      success: false,
      message: 'Checkout ID required',
      hint: 'Use GET /api/polar/checkout?checkoutId=<id> to retrieve a checkout',
    })
  }

  const authHeader = req.headers.authorization
  const { userId: orgId, error: authError } = await verifyClerkAuth(authHeader)
  if (authError || !orgId) {
    return res
      .status(401)
      .json({ success: false, message: 'Authentication required' })
  }

  if (!polar) {
    return res.status(500).json({
      success: false,
      message: 'Payment service not configured',
      error: 'POLAR_NOT_CONFIGURED',
    })
  }

  try {
    const checkout = await polar.checkouts.get(checkoutId)
    return res.json({
      success: true,
      session: {
        id: checkout.id,
        status: checkout.status,
        customerEmail: checkout.customer?.email,
        amountTotal: checkout.net_amount,
        currency: checkout.currency,
        paymentStatus:
          checkout.status === 'succeeded' ? 'paid' : checkout.status,
      },
    })
  } catch (error) {
    logger.error('Failed to retrieve checkout', {
      checkoutId,
      status: error.status || error.statusCode,
    })
    const isNotFound =
      error.status === 404 ||
      error.statusCode === 404 ||
      error.message?.toLowerCase().includes('not found') ||
      error.message?.toLowerCase().includes('404')
    if (isNotFound) {
      return res
        .status(404)
        .json({ success: false, message: 'Checkout not found' })
    }
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve checkout',
    })
  }
}

async function handlePost(req, res) {
  try {
    if (!polar) {
      return res.status(500).json({
        success: false,
        message: 'Payment service not configured',
        error: 'POLAR_NOT_CONFIGURED',
      })
    }

    const isPublic = req.query.public === 'true'

    if (isPublic) {
      if (PUBLIC_CHECKOUT_SECRET) {
        const token = req.headers['x-checkout-token']
        if (token !== PUBLIC_CHECKOUT_SECRET) {
          return res.status(401).json({
            success: false,
            message: 'Invalid checkout token',
          })
        }
      }

      const {
        planName = 'enterprise',
        amount,
        currency = 'usd',
        paymentType = 'one_time',
        customerEmail,
      } = req.body || {}

      if (amount === undefined || amount === null) {
        return res.status(400).json({
          success: false,
          message: 'amount is required',
        })
      }

      const isEnterprisePlan = planName === 'enterprise'

      if (typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'amount must be a positive number',
        })
      }

      if (isEnterprisePlan && amount < MIN_CHECKOUT_AMOUNT) {
        return res.status(400).json({
          success: false,
          message: `For the enterprise plan, amount must be at least ${MIN_CHECKOUT_AMOUNT / 100}€ (${MIN_CHECKOUT_AMOUNT} cents)`,
        })
      }
      if (paymentType !== 'one_time' && paymentType !== 'subscription') {
        return res.status(400).json({
          success: false,
          message: "paymentType must be 'one_time' or 'subscription'",
        })
      }

      let resolvedProductId = null
      if (planName && POLAR_PRODUCTS[planName]) {
        resolvedProductId = POLAR_PRODUCTS[planName]
      } else if (planName) {
        return res.status(400).json({
          success: false,
          message: `Invalid plan name: ${planName}. Must be one of: ${Object.keys(POLAR_PRODUCTS).join(', ')}`,
        })
      } else {
        return res.status(400).json({
          success: false,
          message: 'planName is required',
        })
      }

      const frontendUrl =
        process.env.VITE_FRONTEND_URL ||
        (process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : 'http://localhost:3000')

      const checkoutConfig = {
        products: [resolvedProductId],
        successUrl: `${frontendUrl}/checkout-success?checkout_id={CHECKOUT_ID}&source=manual`,
        metadata: {
          created_via: 'public_checkout',
          manual_onboarding: 'true',
          payment_type: paymentType,
          plan_name: planName,
          ...(customerEmail && { customer_email: customerEmail }),
        },
        prices: {
          [resolvedProductId]: [
            {
              amountType: 'fixed',
              priceAmount: amount,
              priceCurrency: currency,
            },
          ],
        },
      }
      if (paymentType === 'subscription') {
        checkoutConfig.metadata.subscription = 'true'
      }

      const checkout = await polar.checkouts.create(checkoutConfig)
      logger.info('Polar public checkout created', {
        checkoutId: checkout.id,
        planName,
        amount,
        currency,
        paymentType,
      })

      return res.status(200).json({
        success: true,
        checkoutId: checkout.id,
        url: checkout.url,
      })
    }

    // Authenticated flow
    const authHeader = req.headers.authorization
    const { userId: orgId, error: authError } =
      await verifyClerkAuth(authHeader)
    if (authError || !orgId) {
      return res
        .status(401)
        .json({ success: false, message: 'Authentication required' })
    }

    const {
      planName,
      productId,
      amount,
      currency = 'usd',
      amountType = 'fixed',
      metadata = {},
    } = req.body || {}

    let resolvedProductId = null
    if (planName && POLAR_PRODUCTS[planName]) {
      resolvedProductId = POLAR_PRODUCTS[planName]
    } else if (productId) {
      resolvedProductId = productId
    } else if (planName) {
      return res.status(400).json({
        success: false,
        message: `Invalid plan name: ${planName}. Must be one of: ${Object.keys(POLAR_PRODUCTS).join(', ')}`,
      })
    } else {
      return res.status(400).json({
        success: false,
        message: 'Either planName or productId is required',
      })
    }

    const isOnDemand = amount !== undefined && amount !== null
    if (isOnDemand && typeof amount !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'amount must be a number',
      })
    }
    if (isOnDemand && amountType === 'fixed' && amount <= 0) {
      return res.status(400).json({
        success: false,
        message:
          'amount is required and must be greater than 0 for fixed pricing',
      })
    }

    const frontendUrl =
      process.env.VITE_FRONTEND_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000')

    const checkoutConfig = {
      products: [resolvedProductId],
      externalCustomerId: orgId,
      successUrl: `${frontendUrl}/checkout-success?checkout_id={CHECKOUT_ID}`,
      metadata: {
        ...metadata,
        plan_name: planName || undefined,
        org_id: orgId,
        created_via: 'api',
      },
    }
    if (isOnDemand) {
      checkoutConfig.prices = {
        [resolvedProductId]: [
          {
            amountType: amountType,
            priceAmount: amountType === 'fixed' ? amount : undefined,
            priceCurrency: currency,
          },
        ],
      }
      checkoutConfig.metadata.payment_type = 'on_demand'
      checkoutConfig.metadata.amount_type = amountType
    }

    const checkout = await polar.checkouts.create(checkoutConfig)
    logger.info('Polar checkout created', {
      checkoutId: checkout.id,
      planName: planName || 'custom',
      ...(isOnDemand && { amountType }),
    })

    return res.status(200).json({
      success: true,
      checkoutId: checkout.id,
      url: checkout.url,
    })
  } catch (error) {
    logger.error('Error creating Polar checkout', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to create checkout',
      error: error.message,
    })
  }
}

const handler = async (req, res) => {
  if (req.method === 'GET') return handleGet(req, res)
  if (req.method === 'POST') return handlePost(req, res)
  return res.status(405).json({ success: false, message: 'Method not allowed' })
}

export default allowCors(handler, {
  methods: ['GET', 'OPTIONS', 'POST'],
  headers: 'Content-Type, Authorization, X-Checkout-Token',
  credentials: true,
  allowedOrigins: [CHECKOUT_FRONTEND_ORIGIN],
})
