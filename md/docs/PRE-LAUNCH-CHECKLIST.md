# TCDynamics MVP Pre-Launch Checklist

Use this checklist before deploying to production or after major changes.

## Quick Reference
- **Production URL**: https://tcdynamics.fr (or your Vercel URL)
- **Test Email**: Use your real email to receive notifications
- **Estimated Time**: 5-10 minutes

---

## 1. Contact Form Verification

### Steps:
1. [ ] Navigate to **Contact page** on production site
2. [ ] Fill out the form with test data:
   - **Name**: Test User
   - **Email**: your-email@example.com (use your real email!)
   - **Message**: "Test contact form submission - [Current Date/Time]"
   - **Phone** (optional): +33 1 23 45 67 89
   - **Company** (optional): Test Company
3. [ ] Submit the form
4. [ ] Verify success message appears in UI
5. [ ] Check your email inbox within 2-3 minutes
6. [ ] Confirm you received the contact notification email

### What to Check in Email:
- [ ] Email received from noreply@tcdynamics.fr
- [ ] Subject line correct
- [ ] All form data appears correctly formatted
- [ ] Email is in French (as configured)
- [ ] HTML formatting looks good

### If It Fails:
- Check Vercel logs for API errors
- Verify RESEND_API_KEY is set in Vercel environment
- Verify CONTACT_EMAIL is set correctly
- Check Supabase to see if contact was saved (may be email issue only)

---

## 2. Demo Request Form Verification

### Steps:
1. [ ] Navigate to **Demo page** (or wherever demo form is located)
2. [ ] Fill out the form with test data:
   - **Name**: Demo Test User
   - **Email**: your-email@example.com (use your real email!)
   - **Company**: Test Corporation
   - **Business Needs**: Test business needs description
   - **Phone** (optional): +33 1 23 45 67 89
   - **Job Title** (optional): CTO
   - **Company Size** (optional): 10-50
   - **Industry** (optional): Technology
   - **Use Case** (optional): Testing demo form
   - **Timeline** (optional): Q1 2025
   - **Message** (optional): Additional test message
   - **Preferred Date** (optional): 2025-12-01
3. [ ] Submit the form
4. [ ] Verify success message appears in UI
5. [ ] Check your email inbox within 2-3 minutes
6. [ ] Confirm you received the demo request notification email

### What to Check in Email:
- [ ] Email received from noreply@tcdynamics.fr
- [ ] Subject line indicates demo request
- [ ] All form data appears correctly
- [ ] Optional fields handled properly
- [ ] Email is in French (as configured)
- [ ] HTML formatting looks professional

### If It Fails:
- Check Vercel logs for API errors
- Verify RESEND_API_KEY is set
- Verify DEMO_EMAIL is set correctly
- Check Supabase to see if demo request was saved

---

## 3. AI Chat Verification (Optional but Recommended)

### Steps:
1. [ ] Navigate to chat interface on production site
2. [ ] Send a test message: "Bonjour, pouvez-vous me parler de TCDynamics?"
3. [ ] Verify you receive an AI response within 5-10 seconds
4. [ ] Send a follow-up message to test conversation continuity
5. [ ] Verify the AI remembers context from previous message

### What to Check:
- [ ] Response is relevant and coherent
- [ ] Response time is acceptable (< 10 seconds)
- [ ] No error messages displayed
- [ ] Conversation flows naturally

### If It Fails:
- Check Vercel logs for OpenAI API errors
- Verify OPENAI_API_KEY is set and valid
- Check if you've exceeded OpenAI API quota
- Verify Supabase is saving conversations

### Known Issue (2025-11-13):
⚠️ **Chatbot Currently Not Working**
- Missing `OPENAI_API_KEY` environment variable
- Azure account setup pending
- Error message shown: "Désolé, une erreur est survenue. Veuillez réessayer."
- **Status**: Known issue, not critical for MVP launch
- **Fix planned**: Week 5-6 (Azure OpenAI migration or alternative service)

**Note**: In Week 5-6 you'll migrate to Azure OpenAI or alternative, so this will change.

---

## 4. Stripe Payment Verification (If Applicable)

### Steps:
1. [ ] Navigate to pricing/checkout page
2. [ ] Click on a pricing tier to initiate checkout
3. [ ] Use Stripe test card: **4242 4242 4242 4242**
   - **Expiry**: Any future date (e.g., 12/25)
   - **CVC**: Any 3 digits (e.g., 123)
   - **ZIP**: Any 5 digits (e.g., 12345)
4. [ ] Complete the test payment
5. [ ] Verify redirect to success page
6. [ ] Check Stripe Dashboard to confirm test payment received
7. [ ] Verify webhook was triggered (if configured)

### What to Check in Stripe Dashboard:
- [ ] Payment appears in test mode payments
- [ ] Webhook events received (if configured)
- [ ] Customer created (if applicable)
- [ ] Subscription created (if applicable)

### If It Fails:
- Check Vercel logs for Stripe API errors
- Verify STRIPE_SECRET_KEY is set (test mode)
- Verify STRIPE_WEBHOOK_SECRET is configured
- Check that Stripe webhook endpoint is accessible

### Common Known Issues:

**Ad Blocker Blocking Stripe** 🚫
- **Symptoms**: Console errors like `net::ERR_BLOCKED_BY_CLIENT`, `FetchError`, or checkout not loading
- **Cause**: Browser extensions (uBlock Origin, AdBlock Plus, Privacy Badger, etc.) blocking `r.stripe.com` and `errors.stripe.com`
- **Fix**:
  1. Temporarily disable ad blocker for your site
  2. OR whitelist `*.stripe.com` in your ad blocker settings
  3. Test again
- **Note**: This is a client-side issue. End users may also experience this. Consider adding a notice on checkout page.

**429 Too Many Requests** ⏱️
- **Symptoms**: Console error `POST ... 429 (Too Many Requests)` when testing
- **Cause**: Testing Stripe checkout too quickly (rate limiting on verification endpoint)
- **Fix**:
  1. Wait 1-2 minutes before testing again
  2. Stripe has rate limits to prevent abuse
  3. Normal users won't hit this (only happens during rapid testing)
- **Note**: This is expected behavior, not a bug. Production users test once, not repeatedly.

**Important**: Use **test mode** keys for verification!

---

## 5. Database Verification (Supabase)

### Steps:
1. [ ] Log into Supabase Dashboard
2. [ ] Navigate to **Table Editor**
3. [ ] Check **contacts** table for your test submission
4. [ ] Check **demo_requests** table for your test submission
5. [ ] Check **conversations** table for chat messages (if tested)

### What to Check:
- [ ] Data saved correctly with all fields
- [ ] Timestamps are accurate
- [ ] No duplicate entries (unless you submitted twice)
- [ ] Foreign key relationships intact (if applicable)

### If Data Missing:
- Forms may be submitting but database save failing
- Check Vercel logs for Supabase errors
- Verify SUPABASE_URL and SUPABASE_SERVICE_KEY
- Check Supabase RLS policies (should be using service key)

---

## 6. Production Health Check

### Steps:
1. [ ] Visit `https://your-domain.com/api/health`
2. [ ] Verify you see a successful health check response
3. [ ] Check response time (should be < 1 second)

### Expected Response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-13T15:30:00.000Z"
}
```

### If It Fails:
- Vercel deployment may have issues
- Check Vercel deployment status
- Verify API routes are deployed correctly

---

## 7. Environment Variables Check

Before deploying, verify all required environment variables are set in Vercel:

### Supabase (Required)
- [ ] `SUPABASE_URL` - Your Supabase project URL
- [ ] `SUPABASE_SERVICE_KEY` - Service role key (not anon key!)

### Resend (Required)
- [ ] `RESEND_API_KEY` - Your Resend API key
- [ ] `CONTACT_EMAIL` - Email to receive contact form notifications
- [ ] `DEMO_EMAIL` - Email to receive demo request notifications

### OpenAI (Required for Chat)
- [ ] `OPENAI_API_KEY` - Your OpenAI API key

### Stripe (Required for Payments)
- [ ] `STRIPE_SECRET_KEY` - Stripe secret key (test or live)
- [ ] `STRIPE_WEBHOOK_SECRET` - Webhook signing secret
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Publishable key (if using frontend)

### How to Check in Vercel:
1. Go to Vercel Dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Verify all keys listed above are present
5. Make sure they're enabled for **Production** environment

---

## 8. Browser Console Check

### Steps:
1. [ ] Open production site in browser
2. [ ] Open Developer Tools (F12)
3. [ ] Check **Console** tab for errors
4. [ ] Navigate through critical pages
5. [ ] Submit a form and watch console

### What to Look For:
- [ ] No JavaScript errors
- [ ] No failed API requests (red in Network tab)
- [ ] No CORS errors
- [ ] No 404s for assets

### If Errors Appear:
- JavaScript errors may indicate build issues
- Failed API requests may indicate endpoint issues
- CORS errors may indicate configuration issues

---

## 9. Mobile Responsiveness Check (Quick)

### Steps:
1. [ ] Open production site on mobile device OR use browser responsive mode
2. [ ] Test contact form on mobile
3. [ ] Test demo form on mobile
4. [ ] Verify forms are usable (buttons not too small, inputs work)

### Quick Mobile Test:
- [ ] Forms are readable
- [ ] Buttons are tappable
- [ ] No horizontal scrolling
- [ ] Success messages visible

---

## 10. Final Smoke Test

### Do a quick end-to-end user journey:
1. [ ] Land on homepage
2. [ ] Navigate to services/features
3. [ ] Read about company
4. [ ] Submit contact form
5. [ ] Receive confirmation
6. [ ] Receive email

**Time to Complete**: 2-3 minutes

---

## Post-Deploy Monitoring

After deploying:

### First 24 Hours:
- [ ] Check Vercel analytics for traffic
- [ ] Monitor Vercel logs for errors
- [ ] Watch Resend dashboard for email deliveries
- [ ] Check Supabase for new submissions
- [ ] Monitor Stripe for test/real payments

### First Week:
- [ ] Review error rates in logs
- [ ] Check email delivery rates
- [ ] Verify no spam complaints
- [ ] Monitor API response times

### If Issues Occur:
1. **Check Vercel Logs First** - Most issues show up here
2. **Check Email Service** - Verify Resend sending successfully
3. **Check Database** - Verify Supabase accepting writes
4. **Check External APIs** - OpenAI, Stripe status pages

---

## Emergency Rollback

If something breaks badly:

### Via Vercel Dashboard:
1. Go to **Deployments** tab
2. Find last working deployment
3. Click **•••** → **Promote to Production**
4. Confirm rollback

### Via CLI:
```bash
# List recent deployments
vercel ls

# Promote a previous deployment
vercel promote <deployment-url>
```

---

## Success Criteria

Your MVP is ready to launch when:

- ✅ Contact form works and emails arrive
- ✅ Demo form works and emails arrive
- ✅ All data saves to Supabase correctly
- ✅ No console errors on critical pages
- ✅ Mobile forms are usable
- ✅ Stripe test payment completes (if applicable)
- ✅ Chat responds (if using)

**That's it!** Everything else can be fixed post-launch.

---

## Notes for Solo Founder

- **Don't over-test**: You're launching an MVP, not aerospace software
- **Manual testing is fine**: 10 minutes before each deploy is enough
- **Monitor after launch**: Use Vercel logs + email notifications
- **Iterate quickly**: Fix issues as users report them
- **Focus on customer validation**: This is more important than tests

---

## Quick Commands

```bash
# Check Vercel deployment status
vercel ls

# View recent logs
vercel logs

# Redeploy current branch
vercel --prod

# Check environment variables
vercel env ls
```

---

**Last Updated**: 2025-11-13
**Version**: MVP Launch v1.0
**Next Review**: After first paying customer 🎉
