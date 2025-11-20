# Week 5-6 Deployment Checklist

## Status: Ready to Deploy
**Branch:** test-mvp-deploy
**Infrastructure:** 100% Complete
**Last Updated:** 2025-11-17

---

## 📋 Pre-Deployment Checklist

### ✅ Completed
- [x] Chatbot disabled
- [x] Vercel Analytics integrated (@vercel/analytics installed)
- [x] Core analytics events (form_submitted, form_error, feedback_submitted)
- [x] Optional analytics events (form_started, form_abandoned)
- [x] Post-submission feedback UI component
- [x] Feedback backend API endpoint
- [x] TypeScript checks passed

### ⏳ Pending (Required Before Launch)

#### 1. Enable Vercel Analytics Dashboard (5 min)
**Action:** Manual configuration in Vercel dashboard

**Steps:**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (WorkFlowAI)
3. Navigate to: **Analytics** tab
4. Click **Enable Web Analytics**
5. Verify analytics package is detected
6. Wait 2-3 minutes for activation

**Verification:**
- Dashboard shows "Analytics Active"
- Real-time visitors counter appears
- Events tab is visible

---

#### 2. Create Supabase Feedback Table (5 min)
**Action:** Run SQL in Supabase

**Steps:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to: **SQL Editor**
4. Open file: `docs/SUPABASE_FEEDBACK_TABLE.sql`
5. Copy entire SQL content
6. Paste into SQL Editor
7. Click **Run** button

**Verification:**
```sql
-- Run this to verify table was created
SELECT * FROM feedback LIMIT 1;
```

**Expected:** Empty result (no errors)

---

#### 3. Deploy to Production (10 min)
**Action:** Deploy test-mvp-deploy branch

**Option A: Via Vercel Dashboard**
1. Go to Vercel Dashboard → Deployments
2. Find "test-mvp-deploy" branch
3. Click **Deploy** button
4. Wait for build to complete (~3-5 min)
5. Visit production URL

**Option B: Via Git (Recommended)**
```bash
# Merge to main and push
git checkout main
git merge test-mvp-deploy --no-ff -m "Deploy Week 5-6: Customer validation & analytics"
git push origin main

# Vercel will auto-deploy main branch
```

**Verification:**
- Deployment status: "Ready"
- No build errors
- Visit site and check forms render

---

#### 4. End-to-End Testing (15 min)
**Action:** Test full feedback flow

**Demo Form Test:**
1. Visit production site
2. Navigate to Contact section
3. Start filling demo form (should track `demo_form_started`)
4. Fill all required fields:
   - First Name: "Test"
   - Last Name: "User"
   - Email: "test@example.com"
   - Company: "Test Corp"
   - Needs: "Testing feedback flow for analytics"
5. Submit form
6. Verify success message appears
7. **Feedback popup should appear**
8. Select rating (1-5 stars)
9. Add optional text: "Testing feedback collection"
10. Check "Yes, you can follow up"
11. Submit feedback

**Expected Results:**
- Form submits successfully
- Email received (if email integration works)
- Feedback popup appears
- Feedback submits without errors

**Verify in Supabase:**
```sql
SELECT * FROM feedback ORDER BY created_at DESC LIMIT 5;
```
Should show your test feedback entry.

**Verify in Vercel Analytics:**
1. Go to Vercel Dashboard → Analytics → Events
2. Look for recent events:
   - `demo_form_started`
   - `form_submitted`
   - `feedback_submitted`

**Contact Form Test:**
Repeat same process for contact form.

---

## 🚨 Troubleshooting

### Feedback Not Saving to Supabase
**Symptoms:** Feedback submits but not in database

**Check:**
1. Verify table exists: `SELECT * FROM feedback`
2. Check RLS policies are correct
3. Verify Supabase env vars in Vercel:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`

**Fix:** Re-run `SUPABASE_FEEDBACK_TABLE.sql`

---

### Analytics Events Not Showing
**Symptoms:** Events not appearing in Vercel dashboard

**Check:**
1. Verify Analytics is enabled in Vercel
2. Wait 5-10 minutes for events to propagate
3. Check browser console for errors
4. Verify @vercel/analytics package is installed

**Fix:**
```bash
cd apps/frontend
npm install @vercel/analytics
```

---

### Forms Not Submitting
**Symptoms:** Form shows loading but never completes

**Check:**
1. Browser console for errors
2. Network tab for failed requests
3. Vercel function logs

**Fix:** Check API endpoints are deployed correctly

---

## 📊 Post-Deployment Monitoring

### Daily Checks (Week 5-6)
- [ ] Check Vercel Analytics for traffic
- [ ] Review feedback submissions in Supabase
- [ ] Monitor form submission rate
- [ ] Check for error events

### Weekly Review
- [ ] Update `docs/WEEK_5-6_LEARNINGS.md`
- [ ] Analyze feedback patterns
- [ ] Calculate metrics:
  - Total submissions
  - Average rating
  - Form abandonment rate
  - Most common feedback themes

---

## 📈 Success Metrics

**Target Metrics (From Original Plan):**
- 20+ form submissions
- 10+ feedback responses
- 2-3 feedback patterns identified
- 1-2 quick wins implemented

**How to Track:**
```sql
-- Total feedback count
SELECT COUNT(*) FROM feedback;

-- Average rating by form type
SELECT
  form_type,
  AVG(rating) as avg_rating,
  COUNT(*) as total_responses
FROM feedback
GROUP BY form_type;

-- Feedback with comments
SELECT COUNT(*)
FROM feedback
WHERE feedback_text IS NOT NULL AND feedback_text != '';

-- Users willing to follow up
SELECT COUNT(*)
FROM feedback
WHERE allow_followup = true;
```

---

## 🎯 Next Steps After Deployment

1. **Drive Traffic** (Ongoing)
   - Share site with target audience
   - Reach out to potential customers
   - Post on relevant forums/communities

2. **Monitor & Document** (Daily)
   - Check analytics daily
   - Document feedback in WEEK_5-6_LEARNINGS.md
   - Look for patterns

3. **Identify Quick Wins** (After ~20 submissions)
   - Review all feedback
   - Create decision matrix
   - Choose 1-2 quick wins

4. **Implement Quick Wins** (3-5 hours)
   - Make improvements
   - Deploy updates
   - Measure impact

---

## 📝 Notes

**Analytics Events Tracking:**
- ✅ `demo_form_started` - User focuses on first field
- ✅ `contact_form_started` - User focuses on first field
- ✅ `demo_form_abandoned` - User leaves after starting
- ✅ `contact_form_abandoned` - User leaves after starting
- ✅ `form_submitted` - Form successfully submitted
- ✅ `form_error` - Form submission error
- ✅ `feedback_submitted` - Feedback successfully submitted
- ✅ `feedback_error` - Feedback submission error

**Optional Events (Not Implemented):**
- ❌ `feature_interest` - Specific feature tracking
- ❌ `page_time_spent` - Time spent on page

These can be added later if needed.

---

## 🔗 Quick Links

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Week 5-6 Learnings](./WEEK_5-6_LEARNINGS.md)
- [Feedback Table SQL](./SUPABASE_FEEDBACK_TABLE.sql)

---

**Ready to Deploy!** 🚀
