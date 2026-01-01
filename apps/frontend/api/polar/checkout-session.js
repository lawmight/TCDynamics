/**
 * Vercel Serverless Function for Polar Checkout Session Retrieval
 * Retrieves checkout session details using Polar SDK
 * Requires authentication to protect customer PII
 */

import { Polar } from '@polar-sh/sdk'
import { verifySupabaseAuth } from '../_lib/auth.js'

const polar = process.env.POLAR_ACCESS_TOKEN
  ? new Polar({
      accessToken: process.env.POLAR_ACCESS_TOKEN,
      server: process.env.POLAR_SERVER || 'production',
    })
  : null

const allowCors = fn => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()
  return await fn(req, res)
}

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res
      .status(405)
      .json({ success: false, message: 'Method not allowed' })
  }

  // Retrieve checkout session
  const { checkoutId } = req.query

  if (!checkoutId) {
    return res.status(400).json({
      success: false,
      message: 'Checkout ID required',
      hint: 'Use GET /api/polar/checkout-session?checkoutId=<id> to retrieve a checkout',
    })
  }

  // Require authentication for GET requests to protect customer PII
  const authHeader = req.headers.authorization
  const { userId: orgId, error: authError } =
    await verifySupabaseAuth(authHeader)

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

    // NIA-verified: Use net_amount (not deprecated subtotal_amount)
    // customerEmail is now protected by authentication requirement above
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
    // Log full error details for debugging
    console.error('Failed to retrieve checkout:', {
      error: error.message,
      stack: error.stack,
      status: error.status || error.statusCode,
      checkoutId,
    })

    // Check if error is a "not found" error (404)
    const isNotFound =
      error.status === 404 ||
      error.statusCode === 404 ||
      error.message?.toLowerCase().includes('not found') ||
      error.message?.toLowerCase().includes('404')

    if (isNotFound) {
      return res.status(404).json({
        success: false,
        message: 'Checkout not found',
      })
    }

    // Return 500 for all other errors (server/SDK errors)
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve checkout',
    })
  }
}

export default allowCors(handler)
