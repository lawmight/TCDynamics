import Stripe from 'stripe'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email, priceId } = req.body

    if (!email || !priceId) {
      return res.status(400).json({
        error: 'Email et priceId requis',
        required: ['email', 'priceId'],
      })
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return res
        .status(503)
        .json({ error: 'Service de paiement non configuré' })
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

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

    res.status(200).json({
      success: true,
      message: 'Abonnement créé',
      subscriptionId: subscription.id,
    })
  } catch (error) {
    console.error('Subscription error:', error)
    res.status(500).json({
      error: "Erreur d'abonnement",
      message: error.message,
    })
  }
}
