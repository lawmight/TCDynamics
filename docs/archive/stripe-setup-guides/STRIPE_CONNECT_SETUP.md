# Stripe Connect Integration Setup Guide

This guide explains how to set up and configure the Stripe Connect integration for your TCDynamics application.

## Environment Variables Required

Add the following environment variables to your `.env` files:

### Backend Environment Variables (`.env` in backend folder)

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# API Configuration
FRONTEND_URL=http://localhost:8080
NODE_ENV=development
```

### Frontend Environment Variables (`.env` in root folder)

```bash
# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# API Configuration
VITE_API_URL=http://localhost:8080
```

## Stripe Dashboard Configuration

### 1. Create Stripe Account

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Create a new account or sign in to existing account
3. Get your API keys from the "Developers" > "API Keys" section

### 2. Configure Webhooks

1. Go to "Developers" > "Webhooks" in your Stripe Dashboard
2. Click "Add endpoint"
3. Set endpoint URL to: `https://yourdomain.com/api/stripe/webhook`
4. Select the following events:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### 3. Enable Stripe Connect

1. Go to "Connect" in your Stripe Dashboard
2. Click "Get started" to enable Connect
3. Configure your platform settings:
   - Platform name: "TCDynamics"
   - Platform website: Your website URL
   - Support email: Your support email

## API Endpoints

The integration provides the following API endpoints:

### Connected Account Management

- `POST /api/stripe-connect/create-account` - Create new connected account
- `GET /api/stripe-connect/account/:accountId` - Get account details
- `POST /api/stripe-connect/create-account-link` - Create onboarding link

### Product Management

- `GET /api/stripe-connect/products` - List products for account
- `POST /api/stripe-connect/products` - Create product for account

### Checkout

- `POST /api/stripe-connect/create-checkout-session` - Create checkout session

## Frontend Routes

The integration adds the following routes to your application:

- `/connect/dashboard` - Main Connect dashboard
- `/connect/products/:accountId` - Product management for account
- `/connect/store/:accountId` - Storefront for account
- `/connect/store/:accountId/success` - Checkout success page

## Key Features

### 1. Connected Account Creation

- Uses controller pattern for fee collection
- Platform controls fee collection (connected account pays fees)
- Stripe handles payment disputes and losses
- Connected account gets full dashboard access

### 2. Account Onboarding

- Uses Stripe Account Links for onboarding
- Supports refresh and return URLs
- Real-time account status checking

### 3. Product Management

- Products created on connected accounts (not platform)
- Uses Stripe-Account header for proper isolation
- Supports pricing, images, and metadata

### 4. Storefront

- Displays products from connected accounts
- Shopping cart functionality
- Direct Charge with application fees
- Hosted checkout for simplicity

### 5. Payment Processing

- Uses Direct Charge model
- Platform earns revenue through application fees
- Secure payment processing by Stripe

## Testing

### Test Mode

1. Use test API keys (starting with `sk_test_` and `pk_test_`)
2. Test accounts will be created in Stripe's test mode
3. Use test card numbers from [Stripe's testing guide](https://stripe.com/docs/testing)

### Test Card Numbers

- `4242424242424242` - Visa (successful)
- `4000000000000002` - Visa (declined)
- `4000000000000069` - Visa (expired)

## Production Deployment

### 1. Switch to Live Mode

1. Replace test API keys with live keys
2. Update webhook endpoints to production URLs
3. Test thoroughly with small amounts

### 2. Security Considerations

1. Never expose secret keys in frontend code
2. Use HTTPS for all webhook endpoints
3. Validate webhook signatures
4. Implement rate limiting

### 3. Monitoring

1. Set up monitoring for failed payments
2. Monitor webhook delivery
3. Track application fee revenue
4. Monitor account onboarding completion rates

## Troubleshooting

### Common Issues

1. **Webhook Signature Verification Failed**
   - Check that `STRIPE_WEBHOOK_SECRET` is correct
   - Ensure webhook endpoint is accessible via HTTPS

2. **Account Creation Fails**
   - Verify `STRIPE_SECRET_KEY` is correct
   - Check that Connect is enabled in your Stripe dashboard

3. **Products Not Loading**
   - Ensure account ID is valid
   - Check that products exist on the connected account
   - Verify Stripe-Account header is being sent

4. **Checkout Session Creation Fails**
   - Verify all required parameters are provided
   - Check that line items are properly formatted
   - Ensure connected account can accept payments

### Support Resources

- [Stripe Connect Documentation](https://stripe.com/docs/connect)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Stripe Testing Guide](https://stripe.com/docs/testing)

## API Version

This integration uses Stripe API version `2025-09-30.clover` as requested.

## Notes

- The integration uses demo data when API calls fail for development purposes
- In production, implement proper error handling and logging
- Consider implementing database storage for account and product data
- The current implementation uses account IDs in URLs; consider using more user-friendly identifiers in production
