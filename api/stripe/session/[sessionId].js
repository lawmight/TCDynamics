/**
 * Vercel Serverless Function for retrieving Stripe session
 * Dynamic route: /api/stripe/session/[sessionId]
 */

const stripe = process.env.STRIPE_SECRET_KEY
  ? require('stripe')(process.env.STRIPE_SECRET_KEY)
  : null;

// Enable CORS
const allowCors = fn => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  return await fn(req, res);
};

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    // Check if Stripe is properly initialized
    if (!stripe) {
      console.error('❌ Stripe is not initialized - missing STRIPE_SECRET_KEY');
      return res.status(500).json({
        success: false,
        message: 'Payment service is not configured. Please add STRIPE_SECRET_KEY to environment variables.',
        error: 'STRIPE_NOT_CONFIGURED',
      });
    }

    const { sessionId } = req.query;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required',
      });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    console.log('Stripe session retrieved:', sessionId);

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
    });
  } catch (error) {
    console.error('Error retrieving Stripe session:', error);

    if (error.type === 'StripeInvalidRequestError') {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve session',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = allowCors(handler);