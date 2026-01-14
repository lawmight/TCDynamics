/**
 * Vercel Serverless Function for Polar Checkout
 * Creates checkout sessions using Polar SDK with externalCustomerId for org linkage
 *
 * Note: For retrieving checkout sessions, use GET /api/polar/checkout-session?checkoutId=<id>
 */

import { Polar } from '@polar-sh/sdk'
import { verifySupabaseAuth } from '../_lib/auth.js'

// Product ID mapping (NIA-verified: use products array, not product_id)
const POLAR_PRODUCTS = {
  starter: process.env.POLAR_PRODUCT_STARTER,
  professional: process.env.POLAR_PRODUCT_PROFESSIONAL,
  enterprise: process.env.POLAR_PRODUCT_ENTERPRISE,
}

/**
 * Determine Polar server based on environment
 * Priority: 1. Explicit POLAR_SERVER env var, 2. VERCEL_ENV preview → sandbox, 3. Default production
 */
function getPolarServer() {
  // Explicit override takes highest priority
  if (process.env.POLAR_SERVER) {
    return process.env.POLAR_SERVER
  }
  // Auto-detect preview environment for sandbox mode
  if (process.env.VERCEL_ENV === 'preview') {
    return 'sandbox'
  }
  // Default to production
  return 'production'
}

const polar = process.env.POLAR_ACCESS_TOKEN
  ? new Polar({
      accessToken: process.env.POLAR_ACCESS_TOKEN,
      server: getPolarServer(),
    })
  : null

const allowCors = fn => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
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

    const authHeader = req.headers.authorization
    const { userId: orgId, error: authError } =
      await verifySupabaseAuth(authHeader)

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
      currency = 'eur',
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
