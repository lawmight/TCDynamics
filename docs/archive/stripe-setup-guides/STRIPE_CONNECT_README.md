# Stripe Connect Integration

A comprehensive Stripe Connect integration for TCDynamics that allows you to onboard connected accounts, manage products, and process payments with application fees.

## 🚀 Features

### Connected Account Management

- **Account Creation**: Create Stripe Connect accounts with controller settings
- **Onboarding**: Use Stripe Account Links for seamless onboarding
- **Status Monitoring**: Real-time account status and capability checking
- **Dashboard Access**: Connected accounts get full Stripe dashboard access

### Product Management

- **Product Creation**: Create products directly on connected accounts
- **Pricing Control**: Set prices, currencies, and product details
- **Image Support**: Add product images and descriptions
- **Account Isolation**: Products belong to connected accounts, not the platform

### Storefront & Checkout

- **Product Display**: Beautiful storefront for each connected account
- **Shopping Cart**: Full cart functionality with quantity management
- **Direct Charge**: Process payments with application fees
- **Hosted Checkout**: Secure Stripe Checkout integration

## 🛠️ Technical Implementation

### API Version

- Uses Stripe API version `2025-09-30.clover` as requested

### Controller Pattern

The integration uses Stripe's controller pattern for optimal platform control:

- **Fee Collection**: Platform controls fee collection (connected account pays fees)
- **Dispute Handling**: Stripe handles payment disputes and losses
- **Dashboard Access**: Connected accounts get full access to Stripe dashboard

### Account Creation

```javascript
stripe.accounts.create({
  controller: {
    fees: {
      payer: 'account', // Connected account pays fees
    },
    losses: {
      payments: 'stripe', // Stripe handles disputes
    },
    stripe_dashboard: {
      type: 'full', // Full dashboard access
    },
  },
})
```

### Product Management

Products are created on connected accounts using the Stripe-Account header:

```javascript
stripe.products.create(
  {
    name: 'Product Name',
    description: 'Product Description',
    default_price_data: {
      unit_amount: 2999, // $29.99
      currency: 'usd',
    },
  },
  {
    stripeAccount: 'acct_connected_account_id',
  }
)
```

### Payment Processing

Uses Direct Charge with application fees:

```javascript
stripe.checkout.sessions.create({
  line_items: [...],
  payment_intent_data: {
    application_fee_amount: 123 // Platform fee
  },
  mode: 'payment'
}, {
  stripeAccount: 'acct_connected_account_id'
});
```

## 📁 File Structure

```
backend/src/routes/
├── stripe-connect.js          # Backend API routes

src/
├── pages/
│   ├── ConnectDashboard.tsx   # Main Connect dashboard
│   ├── ConnectProducts.tsx    # Product management
│   ├── ConnectStorefront.tsx  # Customer storefront
│   └── ConnectCheckoutSuccess.tsx # Checkout success page
├── utils/
│   └── stripeConnect.ts       # Frontend utilities
└── components/
    └── SimpleNavigation.tsx   # Updated navigation
```

## 🔧 Setup Instructions

### 1. Environment Variables

**Backend (.env)**

```bash
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
FRONTEND_URL=http://localhost:8080
```

**Frontend (.env)**

```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
VITE_API_URL=http://localhost:8080
```

### 2. Stripe Dashboard Configuration

1. **Enable Connect**: Go to Connect in your Stripe Dashboard
2. **Configure Webhooks**: Set up webhook endpoints for Connect events
3. **Test Mode**: Use test API keys for development

### 3. Routes

The integration adds these routes:

- `/connect/dashboard` - Main dashboard
- `/connect/products/:accountId` - Product management
- `/connect/store/:accountId` - Storefront
- `/connect/store/:accountId/success` - Checkout success

## 🎯 Usage Flow

### 1. Create Connected Account

```javascript
const result = await createConnectedAccount({
  email: 'merchant@example.com',
  country: 'US',
})
```

### 2. Start Onboarding

```javascript
const linkResult = await createAccountLink({
  accountId: 'acct_123',
  refreshUrl: 'https://yourapp.com/connect/dashboard',
  returnUrl: 'https://yourapp.com/connect/dashboard',
})
// Redirect user to linkResult.url
```

### 3. Create Products

```javascript
const product = await createProduct({
  accountId: 'acct_123',
  name: 'Premium Widget',
  description: 'High-quality widget',
  priceInCents: 2999,
  currency: 'usd',
})
```

### 4. Process Payments

```javascript
await redirectToConnectCheckout({
  accountId: 'acct_123',
  lineItems: [
    {
      price_data: {
        unit_amount: 2999,
        currency: 'usd',
        product_data: {
          name: 'Premium Widget',
        },
      },
      quantity: 1,
    },
  ],
  successUrl: 'https://yourapp.com/success',
  applicationFeeAmount: 150, // 5% fee
})
```

## 🔒 Security Features

- **Webhook Verification**: All webhooks are signature verified
- **Account Isolation**: Products and payments are isolated by account
- **Secret Key Protection**: Secret keys never exposed to frontend
- **HTTPS Required**: All production endpoints use HTTPS

## 📊 Revenue Model

The platform earns revenue through application fees:

- **Direct Charge**: Platform collects fees on each transaction
- **Configurable Fees**: Set application fee amounts per transaction
- **Automatic Collection**: Fees are collected automatically by Stripe

## 🧪 Testing

### Test Cards

- `4242424242424242` - Successful payment
- `4000000000000002` - Declined payment
- `4000000000000069` - Expired card

### Test Flow

1. Create test connected accounts
2. Complete onboarding in test mode
3. Create test products
4. Process test payments

## 🚨 Production Considerations

### 1. Account Identifiers

Currently uses account IDs in URLs. For production, consider:

- Custom subdomains (`store.merchant.com`)
- Custom domains (`merchant.com`)
- User-friendly slugs

### 2. Error Handling

- Implement proper error logging
- Add retry mechanisms for API calls
- Handle webhook failures gracefully

### 3. Monitoring

- Monitor payment success rates
- Track application fee revenue
- Monitor account onboarding completion

### 4. Compliance

- Ensure PCI compliance
- Handle GDPR requirements
- Implement proper data retention

## 📚 Documentation

- [Stripe Connect Documentation](https://stripe.com/docs/connect)
- [API Reference](https://stripe.com/docs/api)
- [Testing Guide](https://stripe.com/docs/testing)

## 🤝 Support

For issues or questions:

1. Check the setup guide: `STRIPE_CONNECT_SETUP.md`
2. Review Stripe's documentation
3. Check the console for error messages
4. Verify environment variables are set correctly

## 📝 Notes

- The integration includes demo data for development
- All API calls include proper error handling
- The UI follows your application's existing design patterns
- Code includes comprehensive comments explaining each step
