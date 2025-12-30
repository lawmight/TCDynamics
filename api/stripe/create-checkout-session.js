/**
 * Vercel Serverless Function for Stripe Checkout
 * This replaces the backend route for MVP deployment
 * Requires Supabase authentication to link checkout to org_id
 */

import Stripe from 'stripe'
import { verifySupabaseAuth } from '../_lib/auth.js'

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
  // Support both GET (retrieve session) and POST (create session)
  if (req.method === 'GET') {
    // Retrieve checkout session
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

      const { sessionId } = req.query

      if (!sessionId) {
        return res.status(400).json({
          success: false,
          message: 'Session ID is required',
        })
      }

      const session = await stripe.checkout.sessions.retrieve(sessionId)

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

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    })
  }

  try {
    // Check if Stripe is properly initialized
    if (!stripe) {
      console.error('❌ Stripe is not initialized - missing STRIPE_SECRET_KEY')
      console.error(
        'Environment variables available:',
        Object.keys(process.env).filter(k => k.includes('STRIPE'))
      )
      return res.status(500).json({
        success: false,
        message:
          'Payment service is not configured. Please add STRIPE_SECRET_KEY to Vercel environment variables for Preview deployments.',
        error: 'STRIPE_NOT_CONFIGURED',
        debugInfo: {
          vercelEnv: process.env.VERCEL_ENV,
          hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
          availableStripeVars: Object.keys(process.env).filter(k =>
            k.includes('STRIPE')
          ),
        },
      })
    }

    // Verify Supabase authentication to get org_id
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

    const { priceId, planName } = req.body

    console.log('Received request:', { priceId, planName, orgId })

    if (!priceId || !planName) {
      return res.status(400).json({
        success: false,
        message: 'Price ID and plan name are required',
      })
    }

    // Get the frontend URL from environment or use default
    const frontendUrl =
      process.env.VITE_FRONTEND_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:5173')

    // Create Stripe checkout session with org_id for tenancy
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
      client_reference_id: orgId,
      metadata: {
        planName,
        org_id: orgId,
      },
      subscription_data: {
        metadata: {
          org_id: orgId,
          planName,
        },
      },
      billing_address_collection: 'required',
      allow_promotion_codes: true,
    })

    console.log('✅ Stripe checkout session created:', {
      sessionId: session.id,
      planName,
      priceId,
    })

    return res.status(200).json({
      success: true,
      sessionId: session.id,
      url: session.url,
    })
  } catch (error) {
    console.error('❌ Error creating Stripe checkout session:', error)
    console.error('Error stack:', error.stack)
    console.error('Environment check:', {
      hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
      keyStart: process.env.STRIPE_SECRET_KEY
        ? process.env.STRIPE_SECRET_KEY.substring(0, 7)
        : 'NOT_SET',
      vercelEnv: process.env.VERCEL_ENV,
    })

    return res.status(500).json({
      success: false,
      message: 'Failed to create checkout session',
      error: error.message || 'Unknown error occurred',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    })
  }
}

export default allowCors(handler)

