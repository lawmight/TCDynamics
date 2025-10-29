# 💳 Stripe Integration Documentation

**Status**: ✅ **FULLY IMPLEMENTED AND WORKING LOCALLY** | ⚠️ **NEEDS PRODUCTION CONFIGURATION**

This document consolidates all Stripe integration information for TCDynamics WorkFlowAI.

---

> **Note**: Original setup guides archived in `archive/stripe-setup-guides/`

---

## 🎯 Current Status

### Implementation Status:
- ✅ **Backend Integration**: Complete Stripe API routes implemented
- ✅ **Frontend Integration**: Stripe utilities and checkout flow working
- ✅ **Database Integration**: Session tracking and user management
- ✅ **Security**: Webhook signature verification, CSRF protection
- ✅ **Local Testing**: All functionality tested and working locally
- ⚠️ **Production Setup**: Environment variables and webhooks need configuration

### What's Working Locally:
- Complete checkout flow with test cards
- Subscription creation and management
- Webhook event processing
- Session management and verification
- Error handling and user feedback

---

## 🔧 Configuration Setup

### Prerequisites

1. Create a Stripe account at [https://stripe.com](https://stripe.com)
2. Complete account verification
3. Access your Stripe Dashboard

### API Keys Setup

#### Test Mode (Development)

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/dashboard)
2. Click on **Developers** → **API keys**
3. Copy your **Publishable key** (starts with `pk_test_`)
4. Click **Reveal test key** and copy your **Secret key** (starts with `sk_test_`)

#### Live Mode (Production)

⚠️ **Only use live keys in production after thorough testing!**

1. Toggle to **Live mode** in your dashboard
2. Get your live **Publishable key** (`pk_live_`)
3. Get your live **Secret key** (`sk_live_`)

### Environment Variables

#### Backend Environment Variables (`backend/.env`)

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# API Configuration
FRONTEND_URL=http://localhost:8080
NODE_ENV=development
```

#### Frontend Environment Variables (`.env`)

```env
# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# API Configuration
VITE_API_URL=http://localhost:8080
```

---

## 🛍️ Product & Pricing Setup

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

---

## 🔗 Webhook Configuration

### Local Development (Stripe CLI)

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

---

## 🧪 Testing Your Integration

### Test Cards

Use these test card numbers in Stripe Checkout:

| Card Type | Number | Result |
|-----------|--------|---------|
| Success | `4242 4242 4242 4242` | Payment succeeds |
| Decline | `4000 0000 0000 0002` | Payment is declined |
| 3D Secure | `4000 0025 0000 3155` | Requires authentication |

- **Expiry**: Any future date (e.g., 12/34)
- **CVC**: Any 3 digits (e.g., 123)
- **ZIP**: Any 5 digits (e.g., 12345)

### Testing Flow

1. Start your backend: `cd backend && npm run dev`
2. Start your frontend: `npm run dev`
3. Navigate to `http://localhost:8080`
4. Click on a pricing plan button
5. You should be redirected to `/checkout?plan=starter` or `/checkout?plan=professional`
6. Review plan details
7. Click "Procéder au paiement sécurisé"
8. You'll be redirected to Stripe Checkout
9. Use test card `4242 4242 4242 4242`
10. Complete the payment
11. You should be redirected back to the success page

---

## 🚀 Production Deployment Checklist

Before going live with Stripe payments:

- [ ] Test all payment flows thoroughly with test cards
- [ ] Set up production webhooks with correct endpoint URL
- [ ] Replace test keys with live keys in production environment
- [ ] Test with real cards (small amounts) in live mode
- [ ] Verify email notifications work in production
- [ ] Set up proper error logging and monitoring
- [ ] Configure Stripe Tax (if applicable for EU)
- [ ] Review Stripe Dashboard settings for live mode

### Production Environment Variables

Update your production environment with:

```env
# Live Stripe keys (replace test keys)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...  # From production webhook endpoint

# Live price IDs
VITE_STRIPE_PRICE_STARTER=price_live_starter_id
VITE_STRIPE_PRICE_PROFESSIONAL=price_live_professional_id
```

---

## 🔒 Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for all sensitive data
3. **Validate webhook signatures** to prevent fraud
4. **Use HTTPS** in production
5. **Implement rate limiting** on payment endpoints
6. **Log all payment attempts** for audit trails
7. **Test thoroughly** before going live

---

## 🆘 Troubleshooting

### "Invalid API Key" Error
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

### Form Submission Fails
- Check backend logs
- Verify API endpoint is correct
- Check network tab for request/response
- Ensure environment variables are loaded

---

## 📚 Technical Implementation Details

### Backend API Endpoints

- **POST `/api/stripe/create-checkout-session`** - Creates checkout sessions
- **GET `/api/stripe/session/:sessionId`** - Retrieves session details
- **POST `/api/stripe/webhook`** - Handles webhook events

### Frontend Components

- **Checkout Page** (`/src/pages/Checkout.tsx`) - Payment interface
- **Demo Page** (`/src/pages/Demo.tsx`) - Demo request with payment flow
- **Get Started Page** (`/src/pages/GetStarted.tsx`) - Trial signup
- **Stripe Utilities** (`/src/utils/stripe.ts`) - Payment helpers

### Key Features

- **Subscription Management**: Monthly recurring payments
- **Trial Support**: 14-day free trial periods
- **Multi-tier Pricing**: Starter (€29) and Professional (€79) plans
- **Webhook Integration**: Real-time payment status updates
- **Error Handling**: Comprehensive error states and recovery

---

## 🎯 Next Steps

1. **Complete Production Setup**:
   - Configure production environment variables
   - Set up production webhooks
   - Test live payment flow

2. **Monitor and Optimize**:
   - Track conversion rates
   - Monitor payment success rates
   - Optimize checkout flow

3. **Advanced Features** (Future):
   - Customer portal for subscription management
   - Dunning management for failed payments
   - Tax calculation and compliance
   - Multi-currency support

---

## 📞 Support Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Stripe Checkout Guide](https://stripe.com/docs/payments/checkout)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe Pricing](https://stripe.com/pricing)

---

**Status**: ✅ **Local Implementation Complete** | ⚠️ **Production Setup Pending**

*For the most current project status, see [PROJECT_MASTER.md](../PROJECT_MASTER.md)*
