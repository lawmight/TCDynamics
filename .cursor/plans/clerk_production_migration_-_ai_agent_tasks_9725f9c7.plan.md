---
name: Clerk Production Migration - AI Agent Tasks
overview: "Automated tasks for AI agent to perform: environment variable validation, code verification, testing utilities, deployment preparation, and monitoring enhancements."
todos:
  - id: ai-1
    content: Create environment variable validation script (scripts/validate-clerk-env.js)
    status: pending
  - id: ai-2
    content: Add pre-deployment validation to deploy scripts
    status: pending
  - id: ai-3
    content: Verify no hardcoded test keys in codebase
    status: pending
  - id: ai-4
    content: Improve error handling in api/_lib/auth.js and api/webhooks/clerk.js
    status: pending
  - id: ai-5
    content: Add runtime validation for Clerk keys in frontend config
    status: pending
  - id: ai-6
    content: Create pre-deployment checklist script
    status: pending
  - id: ai-7
    content: Update environment-setup.md with production migration docs
    status: pending
  - id: ai-8
    content: Create webhook testing utility
    status: pending
  - id: ai-9
    content: Create health check endpoint (api/health/clerk.js)
    status: pending
  - id: ai-10
    content: Enhance logging in webhook and auth handlers
    status: pending
  - id: ai-11
    content: Create monitoring documentation
    status: pending
  - id: ai-12
    content: Create rollback script and documentation
    status: pending
isProject: false
---

# Clerk Production Migration - AI Agent Tasks

This plan covers all automated tasks the AI agent will perform to support the Clerk production migration.

## Prerequisites

- Manual tasks from **Manual Plan Step 1** completed (Clerk Dashboard configuration)
- Production API keys available (from Manual Plan Step 1.1)

## Step 1: Environment Variable Validation

**Note**: Perform this before Manual Plan Step 2 (Vercel environment variable updates).

### 1.1 Create Validation Script

Create `scripts/validate-clerk-env.js`:

- Validates environment variables are set
- Checks key format (starts with `pk_live_`, `sk_live_`, `whsec_`)
- Verifies no test keys are present in production
- Provides clear error messages for missing/invalid keys
- Can be run locally or in CI/CD

**Output**: Script that can be run with `node scripts/validate-clerk-env.js`

### 1.2 Add Pre-deployment Check

Update deployment scripts to run validation:

- Add validation step to `scripts/deploy-vercel.ps1`
- Fail deployment if validation fails
- Provide helpful error messages

**After Step 1, user proceeds to Manual Plan Step 2 to update Vercel environment variables.**

## Step 2: Code Verification and Improvements

**Note**: Perform this after Manual Plan Step 2 (Vercel environment variables updated).

### 2.1 Verify No Hardcoded Keys

- Search codebase for hardcoded `pk_test_` or `sk_test_` strings
- Verify all Clerk keys come from environment variables
- Check `apps/frontend/src/App.tsx` uses `import.meta.env.VITE_CLERK_PUBLISHABLE_KEY`
- Check `api/_lib/auth.js` uses `process.env.CLERK_SECRET_KEY`
- Check `api/webhooks/clerk.js` uses `process.env.CLERK_WEBHOOK_SIGNING_SECRET`

### 2.2 Improve Error Handling for Production

Update `api/_lib/auth.js`:

- Ensure production errors are less verbose (already implemented, verify)
- Verify error messages don't leak sensitive information
- Add structured logging for authentication failures

Update `api/webhooks/clerk.js`:

- Improve error messages for webhook failures
- Add better logging for debugging (without exposing secrets)
- Verify signature verification errors are handled gracefully

### 2.3 Add Environment Variable Type Checking

Update `apps/frontend/src/utils/config.ts` (if exists) or create:

- Add runtime validation for `VITE_CLERK_PUBLISHABLE_KEY`
- Validate key format at app startup
- Show helpful error if key is missing or invalid

**After Step 2, proceed to Step 3.**

## Step 3: Deployment Preparation

**Note**: Perform this after Manual Plan Step 2 is complete and environment variables are set in Vercel.

### 3.1 Verify Vercel Configuration

Check `vercel.json`:

- Verify CSP headers include Clerk domains (already configured)
- Verify CORS settings for API routes
- Ensure no test-specific configurations

### 3.2 Create Deployment Checklist Script

Create `scripts/pre-deploy-clerk-check.js`:

- Validates all environment variables are set
- Checks key formats
- Verifies webhook endpoint URL matches production domain
- Provides deployment readiness report

### 3.3 Update Documentation

Update `docs/development/environment-setup.md`:

- Add production migration section
- Document the difference between test and live keys
- Add troubleshooting section for production issues

**After Step 3, user proceeds to Manual Plan Step 3 for manual testing.**

## Step 4: Automated Testing

**Note**: Perform this after Manual Plan Step 2 (environment variables set) but can run in parallel with Manual Plan Step 3.

### 4.1 Create Webhook Testing Utility

Create `scripts/test-clerk-webhook.js`:

- Simulates webhook events locally
- Tests webhook signature verification
- Validates user sync logic
- Can be run before production deployment

### 4.2 Add Integration Tests

Update or create tests in `tests/`:

- Test `api/_lib/auth.js` token verification with production-like tokens
- Test `api/webhooks/clerk.js` webhook handling
- Mock Clerk API responses for testing

### 4.3 Create Health Check Endpoint

Create `api/health/clerk.js`:

- Checks if Clerk keys are configured
- Validates key formats (without exposing keys)
- Returns health status for monitoring
- Can be used by monitoring tools

**After Step 4, user proceeds to Manual Plan Step 4 for monitoring.**

## Step 5: Monitoring and Logging Enhancements

**Note**: Perform this after Manual Plan Step 3 (manual testing complete).

### 5.1 Enhance Webhook Logging

Update `api/webhooks/clerk.js`:

- Add structured logging for webhook events
- Log event types and user IDs (hash PII if `PII_HASH_SALT` is set)
- Add metrics for webhook processing time
- Log failures with context (without exposing secrets)

### 5.2 Add Authentication Metrics

Update `api/_lib/auth.js`:

- Add logging for authentication attempts
- Track success/failure rates
- Log token verification errors (sanitized)
- Add performance metrics

### 5.3 Create Monitoring Dashboard Queries

Create `docs/monitoring/clerk-metrics.md`:

- Document key metrics to monitor
- Provide Sentry query examples
- Document webhook delivery monitoring
- Add alerting recommendations

### 5.4 Add Error Tracking

Ensure Sentry integration captures:

- Authentication failures
- Webhook verification failures
- Token expiration errors
- User sync failures

**After Step 5, user proceeds to Manual Plan Step 4 for final monitoring validation.**

## Step 6: Rollback Documentation

### 6.1 Create Rollback Script

Create `scripts/rollback-clerk-to-test.js`:

- Validates test keys are available
- Provides instructions for reverting environment variables
- Documents rollback steps
- Can be run if production issues occur

### 6.2 Update Runbooks

Create or update `docs/runbooks/clerk-rollback.md`:

- Step-by-step rollback procedure
- Troubleshooting common issues
- Contact information for Clerk support
- Recovery procedures

## Success Criteria

- [ ] Environment variable validation script created and tested
- [ ] No hardcoded test keys in codebase
- [ ] Error handling improved for production
- [ ] Deployment checklist script created
- [ ] Webhook testing utility created
- [ ] Health check endpoint created
- [ ] Monitoring enhancements implemented
- [ ] Rollback documentation complete

## Related Plan

See **Manual Plan** for steps you need to perform:

- Step 1: Clerk Dashboard configuration
- Step 2: Vercel environment variable updates (after this plan's Step 1)
- Step 3: Manual testing (after this plan's Step 4)
- Step 4: Monitoring validation (after this plan's Step 5)

## File Changes Summary

**New Files:**

- `scripts/validate-clerk-env.js` - Environment variable validation
- `scripts/pre-deploy-clerk-check.js` - Pre-deployment checklist
- `scripts/test-clerk-webhook.js` - Webhook testing utility
- `api/health/clerk.js` - Health check endpoint
- `docs/monitoring/clerk-metrics.md` - Monitoring documentation
- `docs/runbooks/clerk-rollback.md` - Rollback procedures
- `scripts/rollback-clerk-to-test.js` - Rollback script

**Modified Files:**

- `scripts/deploy-vercel.ps1` - Add validation step
- `api/_lib/auth.js` - Improve error handling
- `api/webhooks/clerk.js` - Enhance logging
- `apps/frontend/src/utils/config.ts` (or create) - Add validation
- `docs/development/environment-setup.md` - Add production migration section
