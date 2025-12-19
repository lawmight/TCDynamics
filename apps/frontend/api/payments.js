import Stripe from 'stripe'

/**
 * Consolidated Payments API
 * Handles both payment-intent and subscription creation
 * 
 * Usage:
 * - POST /api/payments?action=payment-intent - Create payment intent
 * - POST /api/payments?action=subscription - Create subscription
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { action } = req.query

  if (!process.env.STRIPE_SECRET_KEY) {
    return res
      .status(503)
      .json({ error: 'Service de paiement non configuré' })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

  try {
    if (action === 'payment-intent') {
      return await handlePaymentIntent(req, res, stripe)
    } else if (action === 'subscription') {
      return await handleSubscription(req, res, stripe)
    } else {
      return res.status(400).json({
        error: 'Action invalide',
        validActions: ['payment-intent', 'subscription'],
      })
    }
  } catch (error) {
    console.error('Payment error:', error)
    return res.status(500).json({
      error: 'Erreur de paiement',
      message: error.message,
    })
  }
}

/**
 * Handle payment intent creation
 */
async function handlePaymentIntent(req, res, stripe) {
  const { amount, currency = 'eur' } = req.body

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Montant invalide' })
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency,
    metadata: { source: 'tcdynamics' },
  })

  return res.status(200).json({
    success: true,
    message: 'Payment intent créé',
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  })
}

/**
 * Handle subscription creation
 */
async function handleSubscription(req, res, stripe) {
  const { email, priceId } = req.body

  if (!email || !priceId) {
    return res.status(400).json({
      error: 'Email et priceId requis',
      required: ['email', 'priceId'],
    })
  }

  // Create or retrieve customer
  const customers = await stripe.customers.list({ email })
  let customer
  if (customers.data.length > 0) {
    customer = customers.data[0]
  } else {
    customer = await stripe.customers.create({ email })
  }

  // Create subscription
  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: priceId }],
    metadata: { source: 'tcdynamics' },
  })

  return res.status(200).json({
    success: true,
    message: 'Abonnement créé',
    subscriptionId: subscription.id,
  })
}

