/**
 * Vercel Serverless Function for Polar Checkout
 * Creates checkout sessions using Polar SDK with externalCustomerId for org linkage
 */

import { Polar } from '@polar-sh/sdk'
import { verifySupabaseAuth } from '../_lib/auth.js'

// Product ID mapping (NIA-verified: use products array, not product_id)
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

    const { planName } = req.body

    if (!planName || !POLAR_PRODUCTS[planName]) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid plan name' })
    }

    const productId = POLAR_PRODUCTS[planName]
    const frontendUrl =
      process.env.VITE_FRONTEND_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:5173')

    // NIA-verified: Use 'products' array (not deprecated product_id)
    // NIA-verified: Use 'externalCustomerId' (renamed from customer_external_id June 2025)
    // NIA-verified: Metadata flows from checkout → order/subscription
    const checkout = await polar.checkouts.create({
      products: [productId],
      externalCustomerId: orgId, // Links to org, becomes customer.external_id
      successUrl: `${frontendUrl}/checkout-success?checkout_id={CHECKOUT_ID}`,
      metadata: {
        plan_name: planName, // Stored in resulting subscription for easy access
        org_id: orgId,
        created_via: 'api',
      },
    })

    console.log('✅ Polar checkout created:', {
      checkoutId: checkout.id,
      planName,
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
