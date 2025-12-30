import { Polar } from '@polar-sh/sdk'

const polar = process.env.POLAR_ACCESS_TOKEN
  ? new Polar({
      accessToken: process.env.POLAR_ACCESS_TOKEN,
      server: process.env.POLAR_SERVER || 'production',
    })
  : null

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { checkoutId } = req.query

  if (!checkoutId) {
    return res
      .status(400)
      .json({ success: false, message: 'Checkout ID required' })
  }

  try {
    const checkout = await polar.checkouts.get(checkoutId)

    // NIA-verified: Use net_amount (not deprecated subtotal_amount)
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
    console.error('Failed to retrieve checkout:', error)
    return res
      .status(404)
      .json({ success: false, message: 'Checkout not found' })
  }
}
