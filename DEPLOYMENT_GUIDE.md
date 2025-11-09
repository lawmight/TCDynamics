# Quick MVP Deployment Guide

## 🚀 Deploy to Vercel in 5 Minutes

### Prerequisites
- GitHub repository connected to Vercel
- Stripe account with test keys

### Step 1: Add Environment Variables to Vercel

Go to your Vercel project settings → Environment Variables and add:

```bash
# Required for MVP
VITE_API_URL=/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx  # From Stripe Dashboard
STRIPE_SECRET_KEY=sk_test_xxx           # From Stripe Dashboard

# Feature Flags (disable complex features)
VITE_FEATURE_ENABLE_CONTACT_FORM=true
VITE_FEATURE_ENABLE_DEMO_FORM=true
VITE_FEATURE_ENABLE_AI_CHAT=false
VITE_FEATURE_ENABLE_AI_VISION=false
VITE_FEATURE_ENABLE_AZURE_FUNCTIONS=false

# Basic Settings
VITE_NODE_ENV=production
VITE_APP_VERSION=1.0.0
VITE_FEATURE_ENABLE_CACHE=true
VITE_FEATURE_ENABLE_ANALYTICS=false
VITE_FEATURE_ENABLE_DEBUG_LOGGING=false
```

### Step 2: Push to GitHub

```bash
git add .
git commit -m "feat: configure MVP deployment with Stripe support"
git push origin main
```

Vercel will automatically:
1. Detect the push to main branch
2. Run the GitHub Actions workflow
3. Build the frontend
4. Deploy to production

### Step 3: Verify Deployment

Check these endpoints:
- Main site: `https://your-app.vercel.app`
- Stripe API: `https://your-app.vercel.app/api/stripe/create-checkout-session`

## 📋 What's Working

✅ **Working Features:**
- Landing page and navigation
- Pricing page with plans
- Stripe checkout (with test mode)
- Static content pages
- Basic forms (contact, demo)

⏸️ **Deferred Features** (disabled via flags):
- AI Chatbot (needs Azure OpenAI)
- AI Vision (needs Azure Vision)
- Backend API (using Vercel functions instead)
- Complex integrations

## 🔧 Troubleshooting

### If deployment fails:

1. **Check GitHub Actions logs:**
   - Go to GitHub → Actions tab
   - Look for red X marks
   - Common issues:
     - Missing environment variables
     - Lint errors (non-blocking now)
     - Build errors

2. **Check Vercel logs:**
   - Go to Vercel dashboard → Functions tab
   - Check for errors in serverless functions

3. **Test locally first:**
   ```bash
   cd apps/frontend
   npm install
   npm run build
   npm run preview
   ```

## 🎯 Next Steps After MVP

1. **Enable Contact Forms:**
   - Forms already work with Vercel functions
   - Just need to add email service (SendGrid/Resend)

2. **Add AI Features:**
   - Set `VITE_FEATURE_ENABLE_AI_CHAT=true`
   - Add Azure OpenAI keys
   - Deploy Azure Functions separately

3. **Full Backend:**
   - Deploy backend to Render/Railway
   - Update `VITE_API_URL` to backend URL
   - Remove Vercel API functions

## 📝 Quick Commands

```bash
# Test build locally
cd apps/frontend && npm run build

# Check for issues
npm run lint

# Run tests (optional for MVP)
npm run test -- --run

# Deploy manually to Vercel
vercel --prod
```

## 🔗 Useful Links

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Stripe Dashboard](https://dashboard.stripe.com/test/dashboard)
- [GitHub Actions](https://github.com/your-username/your-repo/actions)

---

**Remember:** This is an MVP deployment. Focus on getting live first, then iterate!