# Stripe Configuration Guide

This guide will help you configure Stripe payment integration for WorkFlowAI.

## Prerequisites

1. Create a Stripe account at [https://stripe.com](https://stripe.com)
2. Complete account verification
3. Access your Stripe Dashboard

## Step 1: Get Your API Keys

### Test Mode (Development)

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/dashboard)
2. Click on **Developers** → **API keys**
3. Copy your **Publishable key** (starts with `pk_test_`)
4. Click **Reveal test key** and copy your **Secret key** (starts with `sk_test_`)

### Live Mode (Production)

⚠️ Only use live keys in production after thorough testing!

1. Toggle to **Live mode** in your dashboard
2. Get your live **Publishable key** (`pk_live_`)
3. Get your live **Secret key** (`sk_live_`)

## Step 2: Create Products and Prices

### Create Starter Plan

1. Go to **Products** in Stripe Dashboard
2. Click **+ Add product**
3. Fill in details:
   - **Name**: WorkFlowAI Starter
   - **Description**: Perfect for small businesses starting their digitalization
   - **Pricing**: Recurring
   - **Price**: €29.00 EUR
   - **Billing period**: Monthly
4. Click **Save product**
5. **Copy the Price ID** (starts with `price_`) - you'll need this!

### Create Professional Plan

1. Click **+ Add product** again
2. Fill in details:
   - **Name**: WorkFlowAI Professional
   - **Description**: Ideal for SMEs automating their business processes
   - **Pricing**: Recurring
   - **Price**: €79.00 EUR
   - **Billing period**: Monthly
3. Click **Save product**
4. **Copy the Price ID** (starts with `price_`)

## Step 3: Configure Environment Variables

### Frontend (.env.local)

Create a `.env.local` file in the project root:

```env
# API URL
VITE_API_URL=http://localhost:8080

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
VITE_STRIPE_PRICE_STARTER=price_YOUR_STARTER_PRICE_ID_HERE
VITE_STRIPE_PRICE_PROFESSIONAL=price_YOUR_PROFESSIONAL_PRICE_ID_HERE
```

### Backend (backend/.env)

Create a `backend/.env` file:

```env
# Server Configuration
NODE_ENV=development
PORT=8080
FRONTEND_URL=http://localhost:8080

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE

# Email Configuration (for notifications)
EMAIL_HOST=smtp.zoho.eu
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=your-email@domain.com
EMAIL_PASSWORD=your-password
EMAIL_FROM=noreply@workflowai.fr
EMAIL_TO=contact@workflowai.fr

# Security
SESSION_SECRET=your-random-session-secret-min-32-chars
CSRF_SECRET=your-random-csrf-secret-min-32-chars
```

## Step 4: Set Up Webhooks (Optional but Recommended)

Webhooks allow your app to receive real-time updates about payments.

### Using Stripe CLI (Development)

1. Install [Stripe CLI](https://stripe.com/docs/stripe-cli)
2. Run: `stripe login`
3. Run: `stripe listen --forward-to localhost:8080/api/stripe/webhook`
4. Copy the webhook signing secret (starts with `whsec_`)
5. Add it to your `backend/.env` as `STRIPE_WEBHOOK_SECRET`

### Production Webhooks

1. Go to **Developers** → **Webhooks** in Stripe Dashboard
2. Click **+ Add endpoint**
3. Enter your endpoint URL: `https://yourdomain.com/api/stripe/webhook`
4. Select events to listen to:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click **Add endpoint**
6. Copy the **Signing secret** and add it to your production environment

## Step 5: Test the Integration

### Test Cards

Use these test card numbers in Stripe Checkout:

| Card Type | Number                | Result                  |
| --------- | --------------------- | ----------------------- |
| Success   | `4242 4242 4242 4242` | Payment succeeds        |
| Decline   | `4000 0000 0000 0002` | Payment is declined     |
| 3D Secure | `4000 0025 0000 3155` | Requires authentication |

- **Expiry**: Any future date (e.g., 12/34)
- **CVC**: Any 3 digits (e.g., 123)
- **ZIP**: Any 5 digits (e.g., 12345)

### Testing Flow

1. Start your backend: `cd backend && npm run dev`
2. Start your frontend: `npm run dev`
3. Navigate to `http://localhost:8080`
4. Click on a pricing plan button
5. You should be redirected to the Checkout page
6. Click "Procéder au paiement sécurisé"
7. You'll be redirected to Stripe Checkout
8. Use test card `4242 4242 4242 4242`
9. Complete the payment
10. You should be redirected back to the success page

## Step 6: Production Deployment

### Before Going Live

- [ ] Test all payment flows thoroughly
- [ ] Set up production webhooks
- [ ] Replace test keys with live keys
- [ ] Test with real cards (small amounts)
- [ ] Verify email notifications work
- [ ] Set up proper error logging
- [ ] Configure Stripe Tax (if applicable)
- [ ] Review Stripe Dashboard settings

### Environment Variables for Production

Update your production environment (Azure, Vercel, etc.) with:

- `VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...`
- `STRIPE_SECRET_KEY=sk_live_...`
- `STRIPE_WEBHOOK_SECRET=whsec_...`
- `VITE_STRIPE_PRICE_STARTER=price_...` (live price ID)
- `VITE_STRIPE_PRICE_PROFESSIONAL=price_...` (live price ID)

## Troubleshooting

### "Invalid API Key"

- Check that your API keys are correct
- Ensure no extra spaces in environment variables
- Verify you're using test keys in development

### Webhook Not Receiving Events

- Check that the webhook URL is publicly accessible
- Verify the webhook secret is correct
- Check Stripe Dashboard → Webhooks → Event Log

### Checkout Session Creation Fails

- Ensure backend server is running
- Check browser console for errors
- Verify CORS is configured correctly
- Check backend logs for detailed errors

## Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for all sensitive data
3. **Validate webhook signatures** to prevent fraud
4. **Use HTTPS** in production
5. **Implement rate limiting** on payment endpoints
6. **Log all payment attempts** for audit trails
7. **Test thoroughly** before going live

## Support

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Stripe Checkout Guide](https://stripe.com/docs/payments/checkout)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)

## Next Steps

After configuration:

1. Test payment flow end-to-end
2. Set up subscription management
3. Implement customer portal
4. Add analytics tracking
5. Configure email receipts
6. Set up tax calculations (if needed)
