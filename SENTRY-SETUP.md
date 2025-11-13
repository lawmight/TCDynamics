# Sentry Error Tracking Setup

Quick guide to set up production error monitoring for TCDynamics MVP.

## Why Sentry?

- **Free tier**: 5,000 errors/month (plenty for MVP)
- **Real-time alerts**: Know immediately when something breaks
- **Context**: See exactly what caused errors (request data, user info, etc.)
- **Zero performance impact**: Only 10% sampling for performance monitoring

## Setup Steps (5-10 minutes)

### 1. Create Sentry Account

1. Go to [sentry.io](https://sentry.io)
2. Sign up for free account (use your GitHub account for easy auth)
3. Confirm your email

### 2. Create a Project

1. Click **"Create Project"**
2. Select platform: **Node.js**
3. Set project name: **TCDynamics API** (or whatever you prefer)
4. Click **"Create Project"**

### 3. Get Your DSN

After creating the project, you'll see setup instructions. You need the **DSN** (Data Source Name).

It looks like this:
```
https://abc123def456@o123456.ingest.sentry.io/789012
```

**Copy this DSN** - you'll need it in the next step.

### 4. Add DSN to Vercel Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **TCDynamics project**
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Enter:
   - **Name**: `SENTRY_DSN`
   - **Value**: Your DSN from step 3
   - **Environment**: Select **Production** (and Preview if you want)
6. Click **Save**

### 5. Install Dependencies

The dependency is already added to `api/package.json`. Just run:

```bash
cd api
npm install
```

### 6. Redeploy

Vercel will automatically redeploy when you push, or manually trigger:

```bash
vercel --prod
```

## That's It!

Sentry is now configured. Errors in production will automatically be captured and sent to Sentry.

---

## Testing Sentry (Optional)

Want to verify it's working? Create a test endpoint:

**api/test-sentry.js**:
```javascript
import { captureException } from './_lib/sentry.js';

export default function handler(req, res) {
  try {
    // Intentionally throw an error
    throw new Error('Test error from Sentry setup');
  } catch (error) {
    captureException(error, {
      test: true,
      timestamp: new Date().toISOString(),
    });

    return res.status(500).json({
      message: 'Error captured and sent to Sentry',
    });
  }
}
```

Then visit: `https://your-domain.com/api/test-sentry`

Check Sentry dashboard - you should see the error appear within seconds!

**Don't forget to delete this test endpoint** after verifying.

---

## How to Use in Your API Endpoints

### Option 1: Simple Error Capture

Just import and use when catching errors:

```javascript
import { captureException } from './_lib/sentry.js';

export default async function handler(req, res) {
  try {
    // Your code here
  } catch (error) {
    captureException(error, {
      endpoint: 'contactform',
      userData: req.body,
    });

    return res.status(500).json({
      error: 'Something went wrong',
    });
  }
}
```

### Option 2: Wrap Handler (Automatic)

Wrap your entire handler to automatically catch errors:

```javascript
import { withSentry } from './_lib/sentry.js';

async function contactFormHandler(req, res) {
  // Your code here
  // Any uncaught error will be automatically sent to Sentry
}

export default withSentry(contactFormHandler);
```

---

## Adding Sentry to Existing Endpoints (OPTIONAL)

You don't need to update existing endpoints immediately. Sentry will still work via the wrapper pattern.

But if you want to add it to critical endpoints for better error tracking:

### Update contactform.js

At the top:
```javascript
import { captureException } from './_lib/sentry.js';
```

In the catch blocks:
```javascript
} catch (error) {
  console.error('Contact form error:', error);
  captureException(error, {
    endpoint: 'contactform',
    contactData: body,
  });
  // ... rest of your error handling
}
```

### Update demoform.js

Same pattern as contactform.js

### Update chat.js

```javascript
import { captureException } from './_lib/sentry.js';

// In catch block
} catch (error) {
  console.error('Chat error:', error);
  captureException(error, {
    endpoint: 'chat',
    message: body.message,
    sessionId: body.sessionId,
  });
  // ... rest of error handling
}
```

**But honestly?** For MVP, just having Sentry configured is enough. You'll see errors in the dashboard even without manual integration.

---

## Monitoring After Launch

### Check Sentry Dashboard Daily (First Week)

1. Log into [sentry.io](https://sentry.io)
2. Select your **TCDynamics API** project
3. Look for:
   - **Issues** tab: See all errors
   - **Performance** tab: See slow endpoints
   - **Releases** tab: Track deployment issues

### Set Up Alerts

1. Go to **Settings** → **Alerts**
2. Create an alert rule:
   - **When**: An error occurs
   - **Then**: Send email notification
   - **Filter**: All errors (or specific ones)

Now you'll get emails when errors happen!

### What to Look For

**Critical Errors** (fix immediately):
- Database connection failures
- Email sending failures
- Payment processing errors

**Non-Critical Errors** (fix when you have time):
- Validation errors (user submitted bad data)
- Rate limiting errors
- API quota exceeded

---

## Cost Management

Sentry's free tier is generous:
- **5,000 errors/month**
- **10,000 performance transactions/month**
- **Unlimited team members**

For MVP, this is more than enough. If you exceed limits:
1. Sentry will send you an email
2. They'll stop accepting new errors (gracefully)
3. Your site keeps working (Sentry failure doesn't break your app)

To stay within limits:
- ✅ Already configured: 10% performance sampling
- ✅ Already configured: Production-only error tracking
- ✅ Don't send validation errors (they're not bugs)

---

## When NOT to Use Sentry

Don't send these to Sentry:
- **User validation errors** (expected behavior)
- **404 errors** (user typed wrong URL)
- **Rate limiting** (expected protection)
- **Auth failures** (user typed wrong password)

Only send **unexpected errors** that indicate bugs or infrastructure issues.

---

## Alternative: Skip Sentry for Now

If you want to launch even faster, you can skip Sentry and just:

1. Monitor **Vercel logs** manually after deploys
2. Watch your **email inbox** for user complaints
3. Check **Supabase logs** for database issues

You can always add Sentry later (takes 5 minutes).

---

## Quick Reference

### Environment Variables
```bash
# Add to Vercel
SENTRY_DSN=https://your-dsn@sentry.io/project-id
```

### Import Sentry
```javascript
import { captureException, captureMessage } from './_lib/sentry.js';
```

### Capture Error
```javascript
captureException(error, { context: 'additional info' });
```

### Capture Message
```javascript
captureMessage('Something unusual happened', 'warning', { userId: 123 });
```

---

## Troubleshooting

### Not seeing errors in Sentry?

1. **Check DSN is set**: `vercel env ls` → look for SENTRY_DSN
2. **Check environment**: Sentry only sends in production (`VERCEL_ENV=production`)
3. **Check Sentry project**: Make sure you're looking at correct project
4. **Check error rate**: Errors might be filtered out by sampling

### Sentry initialization errors?

- Verify DSN format is correct
- Check Sentry project status (not disabled)
- Look at Vercel deployment logs

### Performance impact?

- Sentry adds < 10ms overhead
- Only 10% of requests are traced
- No impact on user experience

---

**Last Updated**: 2025-11-13
**Time to Setup**: 5-10 minutes
**Cost**: Free (5K errors/month)
**Required**: No (nice to have for peace of mind)
