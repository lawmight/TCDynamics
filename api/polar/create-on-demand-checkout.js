/**
 * Vercel Serverless Function for Polar On-Demand Checkout
 * Creates checkout sessions with ad-hoc (on-demand) prices
 * Perfect for one-time payments, custom amounts, or dynamic pricing
 */

import { Polar } from '@polar-sh/sdk'
import { verifySupabaseAuth } from '../_lib/auth.js'

// Product ID mapping (supports plan names like 'enterprise')
const POLAR_PRODUCTS = {
  starter: process.env.POLAR_PRODUCT_STARTER,
  professional: process.env.POLAR_PRODUCT_PROFESSIONAL,
  enterprise: process.env.POLAR_PRODUCT_ENTERPRISE,
}

const polar = process.env.POLAR_ACCESS_TOKEN
  ? new Polar({
      accessToken: process.env.POLAR_ACCESS_TOKEN,
      server: process.env.POLAR_SERVER || 'production',
    })
  : null

const allowCors = fn => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST')
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

    // Request body should contain:
    // - planName: Plan name ('starter', 'professional', 'enterprise') OR
    // - productId: The Polar product ID to use directly
    // - amount: Price amount in cents (e.g., 10000 for €100.00)
    // - currency: Currency code (e.g., 'usd', 'eur')
    // - amountType: 'fixed' | 'custom' | 'free' (optional, defaults to 'fixed')
    // - metadata: Optional additional metadata
    const { planName, productId, amount, currency = 'eur', amountType = 'fixed', metadata = {} } = req.body

    // Resolve product ID: planName takes precedence, fallback to productId
    let resolvedProductId = null
    if (planName && POLAR_PRODUCTS[planName]) {
      resolvedProductId = POLAR_PRODUCTS[planName]
    } else if (productId) {
      resolvedProductId = productId
    }

    if (!resolvedProductId) {
      return res.status(400).json({
        success: false,
        message: planName 
          ? `Invalid plan name: ${planName}. Must be one of: ${Object.keys(POLAR_PRODUCTS).join(', ')}`
          : 'Either planName or productId is required',
      })
    }

    if (amountType === 'fixed' && (!amount || amount <= 0)) {
      return res.status(400).json({
        success: false,
        message: 'amount is required and must be greater than 0 for fixed pricing',
      })
    }

    const frontendUrl =
      process.env.VITE_FRONTEND_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:5173')

    // Create checkout with ad-hoc prices
    // Ad-hoc prices are temporary and specific to this checkout session
    const checkout = await polar.checkouts.create({
      products: [resolvedProductId],
      externalCustomerId: orgId, // Links to org, becomes customer.external_id
      successUrl: `${frontendUrl}/checkout-success?checkout_id={CHECKOUT_ID}`,
      // Ad-hoc prices: create prices on-the-fly for this checkout
      prices: {
        [resolvedProductId]: [
          {
            amountType: amountType, // 'fixed', 'custom', or 'free'
            priceAmount: amountType === 'fixed' ? amount : undefined, // Amount in cents (only for fixed)
            priceCurrency: currency,
          },
        ],
      },
      metadata: {
        ...metadata,
        payment_type: 'on_demand',
        plan_name: planName || undefined, // Include plan name if provided
        org_id: orgId,
        created_via: 'api',
        amount_type: amountType,
      },
    })

    console.log('✅ Polar on-demand checkout created:', {
      checkoutId: checkout.id,
      planName: planName || 'custom',
      productId: resolvedProductId,
      amount: amountType === 'fixed' ? amount : 'custom',
      currency,
      amountType,
    })

    return res.status(200).json({
      success: true,
      checkoutId: checkout.id,
      url: checkout.url,
    })
  } catch (error) {
    console.error('❌ Error creating Polar on-demand checkout:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to create checkout',
      error: error.message,
    })
  }
}

export default allowCors(handler)
