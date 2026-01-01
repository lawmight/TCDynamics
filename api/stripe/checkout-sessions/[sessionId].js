/**
 * Vercel Serverless Function for Stripe Checkout Session Retrieval (RESTful)
 * GET /api/stripe/checkout-sessions/{sessionId} - Retrieve a checkout session by ID
 * Requires Supabase authentication to verify session ownership
 */

import Stripe from 'stripe'
import { verifySupabaseAuth } from '../../_lib/auth.js'

// Enhanced logging for debugging
console.log('Environment check at startup:', {
  hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
  keyPrefix: process.env.STRIPE_SECRET_KEY
    ? process.env.STRIPE_SECRET_KEY.substring(0, 10)
    : 'NOT_SET',
  vercelEnv: process.env.VERCEL_ENV,
  nodeEnv: process.env.NODE_ENV,
})

// Check if Stripe key is configured
if (!process.env.STRIPE_SECRET_KEY) {
  console.error(
    '❌ STRIPE_SECRET_KEY is not configured in environment variables'
  )
  console.error(
    'Available env keys:',
    Object.keys(process.env).filter(k => k.includes('STRIPE'))
  )
}

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null

if (stripe) {
  console.log('✅ Stripe initialized successfully')
} else {
  console.error('❌ Stripe initialization failed')
}

// Enable CORS
const allowCors = fn => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET,OPTIONS,PATCH,DELETE,POST,PUT'
  )
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  )

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  return await fn(req, res)
}

const handler = async (req, res) => {
  // Only support GET for retrieving sessions
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed. Use GET to retrieve a checkout session.',
    })
  }

  try {
    if (!stripe) {
      console.error('❌ Stripe is not initialized - missing STRIPE_SECRET_KEY')
      return res.status(500).json({
        success: false,
        message:
          'Payment service is not configured. Please add STRIPE_SECRET_KEY to environment variables.',
        error: 'STRIPE_NOT_CONFIGURED',
      })
    }

    // Verify authentication
    const authHeader = req.headers.authorization
    const { userId: orgId, error: authError } =
      await verifySupabaseAuth(authHeader)

    if (authError || !orgId) {
      console.warn('Authentication failed:', authError)
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: authError || 'Invalid token',
      })
    }

    // Get sessionId from URL path parameter
    const { sessionId } = req.query

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required',
      })
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId)

    // Verify the session belongs to the authenticated org
    if (session.metadata?.org_id !== orgId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      })
    }

    console.log('Stripe session retrieved:', sessionId)

    return res.status(200).json({
      success: true,
      session: {
        id: session.id,
        status: session.status,
        customerEmail: session.customer_details?.email,
        amountTotal: session.amount_total,
        currency: session.currency,
        metadata: session.metadata,
      },
    })
  } catch (error) {
    console.error('Error retrieving Stripe session:', error)

    if (error.type === 'StripeInvalidRequestError') {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      })
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve session',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
}

export default allowCors(handler)
