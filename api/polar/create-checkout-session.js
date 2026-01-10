/**
 * Vercel Serverless Function for Polar Checkout
 * Creates checkout sessions using Polar SDK
 *
 * Supports both authenticated and public checkout flows:
 * - Authenticated (default): Requires Clerk JWT, sets externalCustomerId for org linkage
 * - Public (?public=true): No Clerk auth required, optional token protection, minimum amount required
 *
 * Note: For retrieving checkout sessions, use GET /api/polar/checkout-session?checkoutId=<id>
 */

import { Polar } from '@polar-sh/sdk'
import { verifyClerkAuth } from '../_lib/auth.js'

// Product ID mapping (NIA-verified: use products array, not product_id)
const POLAR_PRODUCTS = {
  starter: process.env.POLAR_PRODUCT_STARTER,
  professional: process.env.POLAR_PRODUCT_PROFESSIONAL,
  enterprise: process.env.POLAR_PRODUCT_ENTERPRISE,
}

const MIN_CHECKOUT_AMOUNT =
  Number(process.env.MIN_CHECKOUT_AMOUNT) || 216000 // Default: 2160€ in cents
const PUBLIC_CHECKOUT_SECRET = process.env.PUBLIC_CHECKOUT_SECRET

const polar = process.env.POLAR_ACCESS_TOKEN
  ? new Polar({
      accessToken: process.env.POLAR_ACCESS_TOKEN,
      server: process.env.POLAR_SERVER || 'production',
    })
  : null

const allowCors = fn => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Checkout-Token'
  )
  if (req.method === 'OPTIONS') return res.status(200).end()
  return await fn(req, res)
}

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res
      .status(405)
      .json({ success: false, message: 'Method not allowed' })
  }

  try {
    if (!polar) {
      return res.status(500).json({
        success: false,
        message: 'Payment service not configured',
        error: 'POLAR_NOT_CONFIGURED',
      })
    }

    // Detect public checkout flow via query parameter
    const isPublic = req.query.public === 'true'

    // PUBLIC CHECKOUT FLOW
    if (isPublic) {
      // Optional token-based protection
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
        paymentType = 'one_time', // 'one_time' or 'subscription'
        customerEmail,
      } = req.body

      // Validate amount (required for public checkout)
      if (amount === undefined || amount === null) {
        return res.status(400).json({
          success: false,
          message: 'amount is required',
        })
      }

      if (typeof amount !== 'number' || amount < MIN_CHECKOUT_AMOUNT) {
        return res.status(400).json({
          success: false,
          message: `amount must be a number and at least ${MIN_CHECKOUT_AMOUNT / 100}€ (${MIN_CHECKOUT_AMOUNT} cents)`,
        })
      }

      // Validate payment type
      if (paymentType !== 'one_time' && paymentType !== 'subscription') {
        return res.status(400).json({
          success: false,
          message: "paymentType must be 'one_time' or 'subscription'",
        })
      }

      // Resolve product ID
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
          : 'http://localhost:5173')

      // Build checkout config (NO externalCustomerId - Polar creates customer from email)
      const checkoutConfig = {
        products: [resolvedProductId],
        // externalCustomerId is omitted for public checkouts
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

      // For subscriptions, we need to ensure the product supports subscriptions
      // Polar will handle this based on the product configuration
      if (paymentType === 'subscription') {
        checkoutConfig.metadata.subscription = 'true'
      }

      // NIA-verified: Use 'products' array (not deprecated product_id)
      // NIA-verified: Metadata flows from checkout → order/subscription
      const checkout = await polar.checkouts.create(checkoutConfig)

      console.log(`✅ Polar public checkout created:`, {
        checkoutId: checkout.id,
        planName,
        productId: resolvedProductId,
        amount,
        currency,
        paymentType,
        ...(customerEmail && { customerEmail }),
      })

      return res.status(200).json({
        success: true,
        checkoutId: checkout.id,
        url: checkout.url,
      })
    }

    // AUTHENTICATED CHECKOUT FLOW
    if (!isPublic) {
      const authHeader = req.headers.authorization
      const { userId: orgId, error: authError } =
        await verifyClerkAuth(authHeader)

      if (authError || !orgId) {
        return res
          .status(401)
          .json({ success: false, message: 'Authentication required' })
      }

      // Support both standard subscription and on-demand checkout
      // If 'amount' is provided, use on-demand pricing; otherwise use standard subscription
      const {
        planName,
        productId,
        amount,
        currency = 'usd',
        amountType = 'fixed',
        metadata = {},
      } = req.body

      // Resolve product ID: planName takes precedence, fallback to productId
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

      // Validate amount for on-demand checkout
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
          : 'http://localhost:5173')

      // Build checkout config
      const checkoutConfig = {
        products: [resolvedProductId],
        externalCustomerId: orgId, // Links to org, becomes customer.external_id
        successUrl: `${frontendUrl}/checkout-success?checkout_id={CHECKOUT_ID}`,
        metadata: {
          ...metadata,
          plan_name: planName || undefined,
          org_id: orgId,
          created_via: 'api',
        },
      }

      // Add on-demand pricing if amount is provided
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

      // NIA-verified: Use 'products' array (not deprecated product_id)
      // NIA-verified: Use 'externalCustomerId' (renamed from customer_external_id June 2025)
      // NIA-verified: Metadata flows from checkout → order/subscription
      const checkout = await polar.checkouts.create(checkoutConfig)

      console.log(`✅ Polar ${isOnDemand ? 'on-demand ' : ''}checkout created:`, {
        checkoutId: checkout.id,
        planName: planName || 'custom',
        productId: resolvedProductId,
        ...(isOnDemand && {
          amount: amountType === 'fixed' ? amount : 'custom',
          currency,
          amountType,
        }),
      })

      return res.status(200).json({
        success: true,
        checkoutId: checkout.id,
        url: checkout.url,
      })
    }
  } catch (error) {
    console.error('❌ Error creating Polar checkout:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to create checkout',
      error: error.message,
    })
  }
}

export default allowCors(handler)
