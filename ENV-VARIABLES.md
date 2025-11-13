# TCDynamics Environment Variables

Complete reference for all environment variables required for production deployment.

## Quick Reference

### Required for Production

| Variable | Service | Required | Purpose |
|----------|---------|----------|---------|
| `SUPABASE_URL` | Supabase | ✅ Yes | Database connection |
| `SUPABASE_SERVICE_KEY` | Supabase | ✅ Yes | Database admin access |
| `RESEND_API_KEY` | Resend | ✅ Yes | Email sending |
| `CONTACT_EMAIL` | Email | ✅ Yes | Contact form recipient |
| `DEMO_EMAIL` | Email | ✅ Yes | Demo form recipient |
| `OPENAI_API_KEY` | OpenAI | ⚠️ If using chat | AI chat functionality |
| `STRIPE_SECRET_KEY` | Stripe | ⚠️ If using payments | Payment processing |
| `STRIPE_WEBHOOK_SECRET` | Stripe | ⚠️ If using payments | Webhook verification |

### Optional (Recommended)

| Variable | Service | Purpose |
|----------|---------|---------|
| `SENTRY_DSN` | Sentry | Error tracking |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe | Frontend checkout |

---

## Supabase Configuration

### SUPABASE_URL

**What it is**: Your Supabase project URL

**Where to find**:
1. Go to [app.supabase.com](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy **Project URL**

**Format**: `https://abcdefghijk.supabase.co`

**Used in**:
- `api/contactform.js`
- `api/demoform.js`
- `api/chat.js`
- `api/_lib/supabase.js`

---

### SUPABASE_SERVICE_KEY

**What it is**: Service role secret key (bypasses Row Level Security)

**Where to find**:
1. Go to [app.supabase.com](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Scroll to **Project API keys**
5. Copy **service_role** key (NOT the anon key!)

**Format**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (long JWT token)

**⚠️ Security Warning**:
- This is a SECRET key
- NEVER commit to git
- NEVER expose to frontend
- Only use server-side
- Bypasses all database security rules

**Used in**:
- `api/_lib/supabase.js` (singleton client)

---

## Resend Configuration

### RESEND_API_KEY

**What it is**: API key for sending emails via Resend

**Where to find**:
1. Go to [resend.com](https://resend.com)
2. Log in or create account
3. Go to **API Keys** in dashboard
4. Click **Create API Key**
5. Copy the key (you won't see it again!)

**Format**: `re_123abc456def...`

**Free tier**: 100 emails/day, 3,000 emails/month

**Used in**:
- `api/_lib/email.js`
- `api/contactform.js`
- `api/demoform.js`

---

### CONTACT_EMAIL

**What it is**: Email address to receive contact form submissions

**Format**: `contact@tcdynamics.fr` or any valid email

**Recommendation**: Use a dedicated email like:
- `contact@yourdomain.com`
- `hello@yourdomain.com`
- `info@yourdomain.com`

**Used in**:
- `api/_lib/email.js` (contact form notifications)

---

### DEMO_EMAIL

**What it is**: Email address to receive demo request submissions

**Format**: `demo@tcdynamics.fr` or any valid email

**Recommendation**: Can be same as CONTACT_EMAIL or separate:
- `demo@yourdomain.com`
- `sales@yourdomain.com`

**Used in**:
- `api/_lib/email.js` (demo form notifications)

---

## OpenAI Configuration

### OPENAI_API_KEY

**What it is**: API key for ChatGPT / GPT-3.5 Turbo

**Where to find**:
1. Go to [platform.openai.com](https://platform.openai.com)
2. Log in or create account
3. Go to **API keys** (click your profile icon)
4. Click **Create new secret key**
5. Copy the key (you won't see it again!)

**Format**: `sk-proj-123abc...` or `sk-123abc...`

**Required for**: AI chat functionality (`api/chat.js`)

**Cost**:
- GPT-3.5-turbo: ~$0.002 per 1K tokens
- For MVP: probably $5-20/month depending on usage

**⚠️ Note**: In Week 5-6, you'll migrate to Azure OpenAI, then this becomes optional.

**Used in**:
- `api/chat.js`

---

## Stripe Configuration

### STRIPE_SECRET_KEY

**What it is**: Secret key for Stripe payment processing

**Where to find**:
1. Go to [dashboard.stripe.com](https://dashboard.stripe.com)
2. Log in or create account
3. Go to **Developers** → **API keys**
4. Copy **Secret key** (for test mode or live mode)

**Format**:
- Test mode: `sk_test_...`
- Live mode: `sk_live_...`

**⚠️ Important**:
- Use **test mode** keys for testing
- Use **live mode** keys for production
- NEVER commit to git

**Used in**:
- `api/create-payment-intent.js`
- `api/create-subscription.js`
- `api/stripe/webhook.js`

---

### STRIPE_WEBHOOK_SECRET

**What it is**: Secret for verifying webhook signatures from Stripe

**Where to find**:
1. Go to [dashboard.stripe.com](https://dashboard.stripe.com)
2. Go to **Developers** → **Webhooks**
3. Click **Add endpoint** or select existing endpoint
4. Add endpoint URL: `https://yourdomain.com/api/stripe/webhook`
5. Select events to listen for (e.g., `checkout.session.completed`)
6. Click **Add endpoint**
7. Click **Reveal** next to **Signing secret**
8. Copy the secret

**Format**: `whsec_...`

**Used in**:
- `api/stripe/webhook.js` (signature verification)

**⚠️ Important**: Without this, webhook requests can't be verified and will be rejected.

---

### NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

**What it is**: Publishable key for Stripe (safe to expose to frontend)

**Where to find**:
1. Go to [dashboard.stripe.com](https://dashboard.stripe.com)
2. Go to **Developers** → **API keys**
3. Copy **Publishable key**

**Format**:
- Test mode: `pk_test_...`
- Live mode: `pk_live_...`

**Used in**:
- Frontend checkout components (if using Stripe Elements)

**Note**: This is PUBLIC and safe to expose (that's why it starts with `NEXT_PUBLIC_`)

---

## Sentry Configuration (Optional)

### SENTRY_DSN

**What it is**: Data Source Name for error tracking

**Where to find**:
1. Go to [sentry.io](https://sentry.io)
2. Create account and project (see SENTRY-SETUP.md)
3. After creating project, copy the DSN from setup instructions

**Format**: `https://abc123@o123456.ingest.sentry.io/789012`

**Required**: No (optional for error monitoring)

**Used in**:
- `api/_lib/sentry.js` (error tracking)

**Cost**: Free tier (5,000 errors/month)

---

## How to Set Environment Variables in Vercel

### Method 1: Via Vercel Dashboard (Recommended)

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your **TCDynamics** project
3. Go to **Settings** → **Environment Variables**
4. For each variable:
   - Click **Add New**
   - Enter **Name** (e.g., `SUPABASE_URL`)
   - Enter **Value** (paste the actual value)
   - Select **Environments**: Check **Production** (and Preview if needed)
   - Click **Save**

### Method 2: Via Vercel CLI

```bash
# Add a single variable
vercel env add SUPABASE_URL production

# It will prompt you to enter the value
# Paste the value and press Enter

# Repeat for each variable
```

### Method 3: Bulk Add (Local Testing)

Create a `.env` file locally (for testing, DON'T commit):

```bash
# .env (DO NOT COMMIT)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
RESEND_API_KEY=re_...
CONTACT_EMAIL=contact@tcdynamics.fr
DEMO_EMAIL=demo@tcdynamics.fr
OPENAI_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SENTRY_DSN=https://...@sentry.io/...
```

**⚠️ Important**: Add `.env` to `.gitignore` (already done in your project)

---

## Verifying Variables Are Set

### Via Vercel Dashboard

1. Go to **Settings** → **Environment Variables**
2. You should see all required variables listed
3. Values will be hidden (shown as `•••••`)
4. Check that each has **Production** environment enabled

### Via Vercel CLI

```bash
# List all environment variables
vercel env ls

# You should see:
# Production:
#   SUPABASE_URL
#   SUPABASE_SERVICE_KEY
#   RESEND_API_KEY
#   ...
```

### Via Health Check Endpoint

After deploying, visit: `https://yourdomain.com/api/health`

Should return:
```json
{
  "status": "ok",
  "timestamp": "2025-11-13T15:30:00.000Z",
  "environment": "production",
  "version": "1.0.0",
  "uptime": 123.45
}
```

If `environment` shows `"production"`, variables are being loaded correctly.

---

## Common Issues

### "SUPABASE_URL is not defined"

**Cause**: Environment variable not set or not deployed

**Fix**:
1. Verify variable is set in Vercel dashboard
2. Redeploy: `vercel --prod`
3. Check logs: `vercel logs`

### "Invalid API key" errors

**Cause**: Wrong key format or expired key

**Fix**:
1. Regenerate key from service dashboard
2. Update in Vercel
3. Redeploy

### Variables work locally but not in production

**Cause**: Forgot to deploy variables or selected wrong environment

**Fix**:
1. In Vercel dashboard, check **Production** is enabled for each variable
2. Redeploy after adding variables
3. Variables require a new deployment to take effect

### Webhook signature verification fails

**Cause**: `STRIPE_WEBHOOK_SECRET` doesn't match endpoint

**Fix**:
1. In Stripe dashboard, create endpoint: `https://yourdomain.com/api/stripe/webhook`
2. Copy the **exact** signing secret
3. Update `STRIPE_WEBHOOK_SECRET` in Vercel
4. Redeploy

---

## Environment Variable Checklist

Before launching, verify you have:

### Database (Required)
- [ ] `SUPABASE_URL` - Set in Vercel Production
- [ ] `SUPABASE_SERVICE_KEY` - Set in Vercel Production

### Email (Required)
- [ ] `RESEND_API_KEY` - Set in Vercel Production
- [ ] `CONTACT_EMAIL` - Set in Vercel Production
- [ ] `DEMO_EMAIL` - Set in Vercel Production
- [ ] Domain verified in Resend (if using custom domain)

### AI Chat (If Using)
- [ ] `OPENAI_API_KEY` - Set in Vercel Production
- [ ] OpenAI account has billing enabled
- [ ] API key has sufficient quota

### Payments (If Using)
- [ ] `STRIPE_SECRET_KEY` - Set in Vercel Production
- [ ] `STRIPE_WEBHOOK_SECRET` - Set in Vercel Production
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Set in Vercel Production
- [ ] Webhook endpoint configured in Stripe dashboard
- [ ] Using correct mode (test vs live)

### Monitoring (Optional)
- [ ] `SENTRY_DSN` - Set in Vercel Production (if using Sentry)

### Verification
- [ ] All variables show up in `vercel env ls`
- [ ] Redeployed after adding variables
- [ ] Health check endpoint responds
- [ ] Test forms submit successfully

---

## Security Best Practices

### ✅ DO:
- Use service role key server-side only
- Add `.env` to `.gitignore`
- Rotate keys if compromised
- Use test mode keys for testing
- Set variables in Vercel dashboard
- Use environment-specific keys

### ❌ DON'T:
- Commit `.env` files to git
- Share secret keys publicly
- Use production keys in development
- Hardcode keys in source code
- Expose service keys to frontend
- Use same keys across projects

---

## Quick Setup Script

Here's the order to set things up:

1. **Supabase** (5 min)
   - Get URL and service key
   - Add to Vercel

2. **Resend** (5 min)
   - Create API key
   - Set CONTACT_EMAIL and DEMO_EMAIL
   - Add to Vercel

3. **OpenAI** (5 min) - If using chat
   - Get API key
   - Add billing info
   - Add to Vercel

4. **Stripe** (10 min) - If using payments
   - Get secret key
   - Create webhook endpoint
   - Get webhook secret
   - Add all to Vercel

5. **Sentry** (5 min) - Optional
   - Create project
   - Get DSN
   - Add to Vercel

6. **Deploy**
   ```bash
   vercel --prod
   ```

7. **Verify**
   - Run through PRE-LAUNCH-CHECKLIST.md

---

**Total Setup Time**: 20-30 minutes

**Last Updated**: 2025-11-13
