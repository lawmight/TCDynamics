# Phase 2 Setup Guide - Supabase & Resend Integration

This guide will walk you through completing Phase 2 of the Azure-to-Vercel migration.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Step 1: Set up Supabase Database](#step-1-set-up-supabase-database)
3. [Step 2: Set up Resend Account](#step-2-set-up-resend-account)
4. [Step 3: Configure Vercel Environment Variables](#step-3-configure-vercel-environment-variables)
5. [Step 4: Deploy and Test](#step-4-deploy-and-test)
6. [Verification](#verification)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- ✅ Phase 1 completed (Azure fallback removed)
- ✅ Supabase account created
- ✅ Access to Vercel project (tc-dynamics)
- ✅ Node packages installed (`@supabase/supabase-js` and `resend`)

---

## Step 1: Set up Supabase Database

### 1.1 Run Database Schema

1. Open your Supabase project: https://anrouunclxibnyyisztz.supabase.co
2. Navigate to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy the entire contents of `supabase-schema.sql` and paste it into the editor
5. Click **Run** to execute the SQL

This will create:

- `contacts` table (for contact form submissions)
- `demo_requests` table (for demo request submissions)
- `chat_conversations` table (for chat logs)
- Row Level Security (RLS) policies
- Indexes for performance
- Auto-update triggers

### 1.2 Verify Tables Created

After running the SQL, verify the tables:

```sql
-- Run this in the SQL Editor to verify
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('contacts', 'demo_requests', 'chat_conversations');
```

You should see all three tables listed.

### 1.3 Get Service Role Key

1. In Supabase, go to **Settings** > **API**
2. Find the **service_role** key (under "Project API keys")
3. Copy this key - you'll need it for Vercel environment variables

**Important**: Keep this key secret! It bypasses Row Level Security.

---

## Step 2: Set up Resend Account

### 2.1 Create Resend Account

1. Go to https://resend.com
2. Sign up for a free account
3. Verify your email address

### 2.2 Verify Your Domain

For production email sending, you need to verify your domain (tcdynamics.fr):

1. In Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter `tcdynamics.fr`
4. Follow the instructions to add DNS records:
   - Add the provided TXT, MX, and CNAME records to your domain DNS
   - Wait for verification (can take up to 48 hours, usually much faster)

**Note**: For testing, you can use Resend's sandbox mode which allows sending to your own email without domain verification.

### 2.3 Get API Key

1. In Resend dashboard, go to **API Keys**
2. Click **Create API Key**
3. Give it a name: `TC Dynamics Production`
4. Select **Full Access** permission
5. Copy the API key (starts with `re_`)
6. **Important**: Save this key immediately - you won't be able to see it again!

---

## Step 3: Configure Vercel Environment Variables

You have your Supabase credentials:

- **SUPABASE_URL**: `https://anrouunclxibnyyisztz.supabase.co`
- **SUPABASE_ANON_KEY**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **SUPABASE_SERVICE_KEY**: (get from Supabase Settings > API)

### Option A: Using Vercel CLI (Recommended)

Run these commands in your terminal:

```bash
cd /mnt/c/Users/Tomco/OneDrive/Documents/Projects/apps/frontend

# Add Supabase environment variables
vercel env add SUPABASE_URL production
# When prompted, enter: https://anrouunclxibnyyisztz.supabase.co

vercel env add SUPABASE_ANON_KEY production
# When prompted, paste your anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

vercel env add SUPABASE_SERVICE_KEY production
# When prompted, paste your service role key from Supabase Settings > API

# Add Resend environment variables
vercel env add RESEND_API_KEY production
# When prompted, paste your Resend API key: re_...

vercel env add CONTACT_EMAIL production
# When prompted, enter: tom.coustols@tcdynamics.fr

vercel env add DEMO_EMAIL production
# When prompted, enter: tom.coustols@tcdynamics.fr
```

### Option B: Using Vercel Dashboard

1. Go to https://vercel.com/tcd-ynamics/tc-dynamics/settings/environment-variables
2. Add each environment variable:

| Variable Name          | Value                                      | Environment                      |
| ---------------------- | ------------------------------------------ | -------------------------------- |
| `SUPABASE_URL`         | `https://anrouunclxibnyyisztz.supabase.co` | Production, Preview, Development |
| `SUPABASE_ANON_KEY`    | Your anon key                              | Production, Preview, Development |
| `SUPABASE_SERVICE_KEY` | Your service role key                      | Production, Preview, Development |
| `RESEND_API_KEY`       | Your Resend API key                        | Production, Preview, Development |
| `CONTACT_EMAIL`        | `tom.coustols@tcdynamics.fr`               | Production, Preview, Development |
| `DEMO_EMAIL`           | `tom.coustols@tcdynamics.fr`               | Production, Preview, Development |

**Important**: Select all three environments (Production, Preview, Development) for each variable.

---

## Step 4: Deploy and Test

### 4.1 Commit Changes

```bash
cd /mnt/c/Users/Tomco/OneDrive/Documents/Projects/apps/frontend

# Check what files changed
git status

# Stage the changes
git add api/ supabase-schema.sql .env.example PHASE_2_SETUP.md package.json package-lock.json

# Create commit
git commit -m "feat: Phase 2 - Add Supabase & Resend integration

- Add Supabase database integration (contacts, demo_requests, chat_conversations)
- Add Resend email notification service
- Create API endpoints: /api/contactform.js, /api/demoform.js, /api/chat.js
- Add utility files for Supabase and Resend
- Update environment variable configuration

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

### 4.2 Push to Remote

```bash
git push origin test-mvp-deploy
```

### 4.3 Deploy to Vercel

Vercel will automatically deploy when you push, or you can trigger manually:

```bash
# Deploy to preview
vercel

# Or deploy directly to production
vercel --prod
```

---

## Verification

### Test Contact Form Endpoint

```bash
curl -X POST https://tc-dynamics.vercel.app/api/contactform \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "company": "Test Company",
    "message": "This is a test message from Phase 2 setup"
  }'
```

Expected response:

```json
{
  "success": true,
  "message": "Contact form submitted successfully",
  "contactId": "uuid-here",
  "emailSent": true
}
```

### Test Demo Request Endpoint

```bash
curl -X POST https://tc-dynamics.vercel.app/api/demoform \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "company": "Test Company",
    "jobTitle": "Developer",
    "useCase": "Testing the demo request form"
  }'
```

Expected response:

```json
{
  "success": true,
  "message": "Demo request submitted successfully",
  "requestId": "uuid-here",
  "emailSent": true
}
```

### Verify in Supabase

1. Go to Supabase dashboard: https://anrouunclxibnyyisztz.supabase.co
2. Navigate to **Table Editor**
3. Check the `contacts` and `demo_requests` tables
4. You should see your test entries

### Verify Email Delivery

1. Check your email inbox (tom.coustols@tcdynamics.fr)
2. You should have received notification emails for both test submissions
3. If domain is not verified yet, emails might go to spam or you might need to use Resend sandbox

---

## Troubleshooting

### Issue: "SUPABASE_URL environment variable is not set"

**Solution**: Make sure you added the environment variables to Vercel and redeployed:

```bash
vercel env pull  # Pull env vars locally for testing
vercel --prod    # Redeploy to production
```

### Issue: "Failed to insert contact: permission denied"

**Solution**: Verify Row Level Security policies are set up correctly:

1. Go to Supabase > Authentication > Policies
2. Ensure "Allow anonymous inserts" policies exist for all three tables

### Issue: "Failed to send email"

**Solution**:

1. Verify Resend API key is correct
2. If domain not verified, you can only send to your own email
3. Check Resend dashboard > Logs for error details

### Issue: "Network error" when testing

**Solution**:

1. Verify CORS headers are set correctly in API endpoints
2. Check browser console for specific error
3. Try testing with curl instead of browser

### Issue: Email goes to spam

**Solution**:

1. Verify your domain in Resend (tcdynamics.fr)
2. Add SPF, DKIM, and DMARC records to your DNS
3. Send a few test emails to build reputation

---

## Next Steps

After completing Phase 2:

1. **Test thoroughly**: Submit real forms from your website
2. **Monitor logs**: Check Vercel function logs for errors
3. **Check Supabase**: Verify data is being stored correctly
4. **Verify emails**: Make sure notifications are being sent
5. **Update frontend**: Ensure frontend is calling the correct API endpoints
6. **Deploy to production**: Once everything works, deploy with `vercel --prod`

Then you can proceed to:

- **Phase 3**: Azure cleanup (remove Azure Functions code)
- **Phase 4**: Production deployment and final testing

---

## Summary

**What Phase 2 Accomplished:**

✅ Database persistence for all forms (Supabase)
✅ Email notifications for contact and demo requests (Resend)
✅ Chat conversation logging (Supabase)
✅ Three working API endpoints:

- `/api/contactform` - Contact form submissions
- `/api/demoform` - Demo request submissions
- `/api/chat` - Chat with logging

✅ Complete backend functionality on Vercel platform
✅ No more Azure dependencies
✅ Better monitoring and analytics capabilities

**Architecture:**

```
Frontend (Vercel)
  ↓
Vercel Serverless Functions (/api)
  ↓
Supabase (Database) + Resend (Email)
```

---

## Need Help?

If you encounter any issues:

1. Check Vercel function logs: https://vercel.com/tcd-ynamics/tc-dynamics/logs
2. Check Supabase logs: Supabase Dashboard > Logs
3. Check Resend logs: Resend Dashboard > Logs
4. Review the troubleshooting section above

---

**Phase 2 Setup Complete!** 🎉

Once you've completed all steps and verified everything works, you're ready for Phase 3 (Azure cleanup).
