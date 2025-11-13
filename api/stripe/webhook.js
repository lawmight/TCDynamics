const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  let event;

  try {
    // Get the raw body for signature verification
    const body = await getRawBody(req);

    // Verify webhook signature
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  // Handle the event
  console.log(`Received webhook event: ${event.type}`);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log('Checkout session completed:', session.id);
        console.log('Customer email:', session.customer_email);
        console.log('Payment status:', session.payment_status);

        // TODO: Fulfill the order, send confirmation email, etc.
        // You can:
        // - Save to database
        // - Send confirmation email
        // - Update customer record
        // - Provision access to services

        break;
      }

      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object;
        console.log('Async payment succeeded:', session.id);

        // Fulfill the order for async payments
        break;
      }

      case 'checkout.session.async_payment_failed': {
        const session = event.data.object;
        console.log('Async payment failed:', session.id);

        // Handle failed payment
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        console.log('Subscription event:', event.type, subscription.id);
        console.log('Status:', subscription.status);

        // Handle subscription changes
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        console.log('Subscription cancelled:', subscription.id);

        // Handle cancellation
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        console.log('Invoice payment succeeded:', invoice.id);

        // Handle successful recurring payment
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        console.log('Invoice payment failed:', invoice.id);

        // Handle failed payment - send email notification
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Return a response to acknowledge receipt of the event
    res.json({ received: true, type: event.type });

  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}

// Helper function to get raw body (needed for signature verification)
async function getRawBody(req) {
  if (req.body && typeof req.body === 'string') {
    return req.body;
  }

  return new Promise((resolve, reject) => {
    let data = '';
    req.setEncoding('utf8');
    req.on('data', chunk => {
      data += chunk;
    });
    req.on('end', () => {
      resolve(data);
    });
    req.on('error', reject);
  });
}

// Configure to receive raw body for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};
