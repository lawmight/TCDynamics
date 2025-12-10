/**
 * Vercel Serverless Function for Stripe Checkout (CommonJS to avoid ESM import issues)
 */

const Stripe = require('stripe')

// Startup diagnostics for troubleshooting missing env vars
console.log('Stripe create-checkout-session init', {
  hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
  keyPrefix: process.env.STRIPE_SECRET_KEY
    ? process.env.STRIPE_SECRET_KEY.substring(0, 8)
    : 'NOT_SET',
  vercelEnv: process.env.VERCEL_ENV,
  nodeEnv: process.env.NODE_ENV,
})

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null

// Allow CORS for cross-origin usage (e.g., preview builds)
const allowCors = fn => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET,OPTIONS,PATCH,DELETE,POST,PUT'
  )
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  return await fn(req, res)
}

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    })
  }

  try {
    // Guard: Stripe configured
    if (!stripe) {
      console.error('Stripe not initialized - missing STRIPE_SECRET_KEY')
      return res.status(500).json({
        success: false,
        message:
          'Payment service is not configured. Please add STRIPE_SECRET_KEY to Vercel environment variables.',
        error: 'STRIPE_NOT_CONFIGURED',
      })
    }

    const { priceId, planName } = req.body || {}

    if (!priceId || !planName) {
      return res.status(400).json({
        success: false,
        message: 'Price ID and plan name are required',
      })
    }

    // Resolve frontend URL for redirects
    const frontendUrl =
      process.env.VITE_FRONTEND_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:5173')

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
      billing_address_collection: 'required',
      allow_promotion_codes: true,
    })

    console.log('Stripe checkout session created', {
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
    console.error('Error creating Stripe checkout session', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to create checkout session',
      error: error.message || 'Unknown error occurred',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    })
  }
}

module.exports = allowCors(handler)
