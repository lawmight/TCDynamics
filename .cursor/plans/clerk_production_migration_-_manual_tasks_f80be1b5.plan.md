---
name: Clerk Production Migration - Manual Tasks
overview: Manual steps required to switch Clerk from test to production mode, including Clerk Dashboard configuration, Vercel environment variable updates, and manual testing.
todos:
  - id: manual-1
    content: Get production API keys from Clerk Dashboard (pk_live_, sk_live_)
    status: pending
  - id: manual-2
    content: Configure production webhook in Clerk Dashboard with correct endpoint URL and events
    status: pending
  - id: manual-3
    content: Copy webhook signing secret from Clerk Dashboard
    status: pending
  - id: manual-4
    content: Configure allowed origins in Clerk Dashboard
    status: pending
  - id: manual-5
    content: Update Vercel environment variables (VITE_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY, CLERK_WEBHOOK_SIGNING_SECRET)
    status: pending
  - id: manual-6
    content: Test sign-up, sign-in, and sign-out flows in production
    status: pending
  - id: manual-7
    content: Verify user sync to MongoDB after sign-up
    status: pending
  - id: manual-8
    content: Check webhook deliveries in Clerk Dashboard
    status: pending
  - id: manual-9
    content: Monitor Sentry for authentication errors
    status: pending
  - id: manual-10
    content: Verify protected API endpoints work correctly
    status: pending
isProject: false
---

# Clerk Production Migration - Manual Tasks

This plan covers all manual steps you need to perform in Clerk Dashboard, Vercel Dashboard, and manual testing.

## Prerequisites

- Access to Clerk Dashboard (production instance)
- Access to Vercel Dashboard (production environment)
- Access to MongoDB Atlas (production database)
- Production domain deployed and accessible

## Step 1: Clerk Dashboard Configuration

### 1.1 Get Production API Keys

1. Navigate to Clerk Dashboard → API Keys
2. Switch to **Production** instance (if using separate instances)
3. Copy the following keys:

- **Publishable Key** (starts with `pk_live_`)
- **Secret Key** (starts with `sk_live_`)
- **Note**: Save these securely - you'll need them for Step 2

### 1.2 Configure Production Webhook

1. Navigate to Clerk Dashboard → Webhooks
2. Create new webhook OR update existing webhook:

- **Endpoint URL**: `https://tcdynamics.fr/api/webhooks/clerk`
- Replace with your actual production domain
- **Events to subscribe**:
- `user.created`
- `user.updated`
- `user.deleted`

3. Copy the **Signing Secret** (starts with `whsec_`)

- Save this for Step 2

### 1.3 Configure Allowed Origins

1. Navigate to Clerk Dashboard → Settings → Domains
2. Add production domain: `https://tcdynamics.fr`
3. Remove test/localhost domains if not needed for production

### 1.4 Review Session Settings

1. Navigate to Clerk Dashboard → Settings → Sessions
2. Verify session lifetime settings are appropriate for production
3. Review MFA settings if enabled
4. Review social provider settings if using OAuth

**After completing Step 1, proceed to Step 2 in the AI Agent plan to update environment variables.**

## Step 2: Vercel Environment Variables

**Note**: After Step 1 from AI Agent plan (environment variable validation script), update these in Vercel Dashboard.

1. Navigate to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Select **Production** environment
3. Update/Add the following variables:

- `VITE_CLERK_PUBLISHABLE_KEY`
- Value: `pk_live_...` (from Step 1.1)
- Environment: Production

- `CLERK_SECRET_KEY`
- Value: `sk_live_...` (from Step 1.1)
- Environment: Production
- **Important**: Use `CLERK_SECRET_KEY`, not `CLERK_API_KEY`

- `CLERK_WEBHOOK_SIGNING_SECRET`
- Value: `whsec_...` (from Step 1.2)
- Environment: Production

4. Verify all three variables are set for Production environment
5. **Do NOT redeploy yet** - wait for AI Agent plan Step 3

**After completing Step 2, proceed to Step 3 in the AI Agent plan for code verification.**

## Step 3: Manual Testing (After AI Agent Plan Step 4)

**Note**: Perform this after AI Agent plan Step 4 (deployment) is complete.

### 3.1 Test Authentication Flow

1. Navigate to production site: `https://tcdynamics.fr`
2. Test **Sign Up**:

- Create a new account with a real email
- Verify email confirmation works
- Check that you can sign in after confirmation

3. Test **Sign In**:

- Sign in with existing account
- Verify redirect works correctly

4. Test **Sign Out**:

- Sign out and verify redirect to home page

### 3.2 Verify User Sync

1. Check Clerk Dashboard → Users:

- Verify new user appears after sign-up
- Verify user data is correct

2. Check MongoDB Atlas → Your Database → `users` collection:

- Verify user document was created with correct `clerkId`
- Verify email, firstName, lastName are synced correctly
- Check that `plan` field defaults to `'starter'`

### 3.3 Verify Webhook Delivery

1. Navigate to Clerk Dashboard → Webhooks → [Your Webhook] → Recent Deliveries
2. Check for successful deliveries:

- `user.created` event should show 200 status
- `user.updated` event should show 200 status (if you update profile)

3. If any failures:

- Check error messages
- Verify webhook endpoint URL is correct
- Verify `CLERK_WEBHOOK_SIGNING_SECRET` matches

### 3.4 Test Protected API Endpoints

1. Sign in to production site
2. Test API endpoints that require authentication:

- Check browser DevTools → Network tab
- Verify API calls include `Authorization: Bearer <token>` header
- Verify API responses are successful (not 401 Unauthorized)

### 3.5 Verify Theme Switching

1. Test light/dark theme toggle
2. Verify Clerk components (SignIn, SignUp, UserButton) respect theme
3. Check that Clerk modals/popovers match app theme

**After completing Step 3, proceed to Step 5 in the AI Agent plan for monitoring setup.**

## Step 4: Monitor and Validate (After AI Agent Plan Step 5)

### 4.1 Monitor Error Rates

1. Check Sentry Dashboard (if configured):

- Look for authentication-related errors
- Check for webhook verification failures
- Monitor for 401/403 errors

2. Check Vercel Dashboard → Functions:

- Monitor `/api/webhooks/clerk` function logs
- Check for errors or timeouts

### 4.2 Verify Production Metrics

1. Check Clerk Dashboard → Analytics:

- Verify user sign-ups are being tracked
- Check session metrics

2. Check Vercel Analytics (if enabled):

- Verify page views are tracking
- Check for any performance issues

### 4.3 Final Validation

1. Test with multiple user accounts (if possible)
2. Verify all authentication flows work end-to-end
3. Check that no test keys are being used (verify in browser DevTools → Application → Local Storage)
4. Confirm webhook deliveries are consistent

## Rollback Plan (If Needed)

If issues occur:

1. **Immediate**: Revert Vercel environment variables to test keys:

- `VITE_CLERK_PUBLISHABLE_KEY` → `pk_test_...`
- `CLERK_SECRET_KEY` → `sk_test_...`
- `CLERK_WEBHOOK_SIGNING_SECRET` → test webhook secret

2. **Redeploy**: Trigger new deployment in Vercel

3. **Verify**: Test that authentication works with test keys

4. **Investigate**: Review logs and errors before retrying production switch

## Success Criteria

- [ ] All environment variables updated in Vercel (Production)
- [ ] Webhook configured and delivering successfully
- [ ] Users can sign up and sign in
- [ ] User data syncs to MongoDB correctly
- [ ] No authentication errors in Sentry
- [ ] All protected API endpoints work
- [ ] Theme switching works with Clerk components

## Related Plan

See **AI Agent Plan** for automated tasks:

- Step 1: Environment variable validation
- Step 2: Code verification and improvements
- Step 3: Deployment preparation
- Step 4: Automated testing
- Step 5: Monitoring and logging enhancements
