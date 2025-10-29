# Testing Guide: Button Flows & Stripe Integration

This guide will help you test all the implemented button functionalities and Stripe checkout integration.

## Prerequisites

Before testing, ensure you have:

- [ ] Completed Stripe configuration (see `STRIPE_CONFIGURATION.md`)
- [ ] Set up environment variables for both frontend and backend
- [ ] Backend server running (`cd backend && npm run dev`)
- [ ] Frontend server running (`npm run dev`)
- [ ] Stripe test keys configured (not live keys!)

## Test Checklist

### 1. Hero Section Buttons

#### Test: "GET COMPUTE" Button

- [ ] Navigate to homepage (`http://localhost:8080/`)
- [ ] Scroll to Hero section (top of page)
- [ ] Click **"GET COMPUTE"** button
- [ ] ✅ Should navigate to `/get-started` page
- [ ] ✅ Page should load without errors
- [ ] ✅ Plan tabs should be visible

#### Test: "VOIR LA DÉMO" Button

- [ ] Navigate to homepage
- [ ] Click **"VOIR LA DÉMO"** button in Hero section
- [ ] ✅ Should navigate to `/demo` page
- [ ] ✅ Demo form should be visible
- [ ] ✅ Video placeholder should be present

---

### 2. Pricing Section Buttons

#### Test: Starter Plan Button

- [ ] Navigate to homepage
- [ ] Scroll to Pricing section
- [ ] Click **"S'abonner - 29€"** on Starter plan
- [ ] ✅ Should navigate to `/checkout?plan=starter`
- [ ] ✅ Plan details should show "Starter"
- [ ] ✅ Price should show "29€"
- [ ] ✅ Features list should match Starter plan

#### Test: Professional Plan Button

- [ ] Click **"S'abonner - 79€"** on Professional plan
- [ ] ✅ Should navigate to `/checkout?plan=professional`
- [ ] ✅ Plan details should show "Professional"
- [ ] ✅ Price should show "79€"
- [ ] ✅ Features list should match Professional plan

#### Test: Enterprise Plan Button

- [ ] Click **"Contactez-nous"** on Enterprise plan
- [ ] ✅ Should navigate to contact section
- [ ] ⚠️ Note: Enterprise redirects to contact, not checkout

#### Test: "Planifier une démo" Button

- [ ] Scroll to bottom of Pricing section
- [ ] Click **"Planifier une démo"** button
- [ ] ✅ Should navigate to `/demo` page

---

### 3. Features Section Buttons

#### Test: "DÉMARRER L'ESSAI" Button

- [ ] Navigate to homepage
- [ ] Scroll to Features section (bottom CTA)
- [ ] Click **"DÉMARRER L'ESSAI"** button
- [ ] ✅ Should navigate to `/get-started` page

#### Test: "PARLER À UN EXPERT" Button

- [ ] Click **"PARLER À UN EXPERT"** button
- [ ] ✅ Should smooth scroll to Contact section
- [ ] ✅ Contact form should be visible

---

### 4. AI Demo Section Buttons

#### Test: "Tester le Chatbot" Button

- [ ] Navigate to homepage
- [ ] Scroll to AI Demo section (if exists on homepage)
- [ ] Click **"Tester le Chatbot"** button
- [ ] ✅ Should trigger chatbot to open
- [ ] ⚠️ Note: Chatbot functionality depends on LazyAIChatbot component

#### Test: "Démarrer l'Essai Gratuit" Button

- [ ] Click **"Démarrer l'Essai Gratuit"** in AI Demo
- [ ] ✅ Should navigate to `/get-started` page

#### Test: "Planifier une Démo" Button

- [ ] Click **"Planifier une Démo"** in AI Demo
- [ ] ✅ Should navigate to `/demo` page

---

### 5. Get Started Page Flow

#### Test: Plan Selection

- [ ] Navigate to `/get-started`
- [ ] Click **Starter** tab
- [ ] ✅ Plan details should update to Starter
- [ ] Click **Professional** tab
- [ ] ✅ Plan details should update to Professional

#### Test: Form Submission

- [ ] Fill out the signup form:
  - First Name: `Jean`
  - Last Name: `Dupont`
  - Email: `jean.dupont@test.fr`
  - Company: `Test Company`
  - Phone: `0123456789` (optional)
- [ ] Click **"Démarrer l'essai gratuit"** button
- [ ] ✅ Should show loading state
- [ ] ✅ After ~1.5s, should navigate to `/checkout?plan=starter` (or professional)

---

### 6. Checkout Page Flow

#### Test: Page Load

- [ ] Navigate to `/checkout?plan=starter`
- [ ] ✅ Page should load correctly
- [ ] ✅ Plan summary should show Starter details
- [ ] ✅ Price should show 29€
- [ ] ✅ Features list should be visible
- [ ] ✅ "À payer aujourd'hui: 0€" should be shown

#### Test: Back Button

- [ ] Click **"Retour aux tarifs"** button
- [ ] ✅ Should navigate back to `/pricing`

#### Test: Stripe Checkout Redirect

- [ ] Navigate back to checkout page
- [ ] Click **"Procéder au paiement sécurisé"** button
- [ ] ✅ Should show loading state
- [ ] ✅ Should redirect to Stripe Checkout (stripe.com)
- [ ] ✅ URL should start with `https://checkout.stripe.com/`

---

### 7. Stripe Checkout Testing

⚠️ **IMPORTANT**: Use Stripe test cards only!

#### Test: Successful Payment

1. On Stripe Checkout page:
   - [ ] Email: `test@test.com`
   - [ ] Card number: `4242 4242 4242 4242`
   - [ ] Expiry: `12/34` (any future date)
   - [ ] CVC: `123`
   - [ ] Name: `Test User`
   - [ ] Billing address: Fill with any test data
2. Click **Subscribe** button
3. ✅ Should redirect back to `/checkout-success?session_id=...`
4. ✅ Success page should show:
   - Confetti animation
   - Success message
   - Session ID
   - Next steps
   - Support options

#### Test: Declined Payment

1. Start checkout flow again
2. Use declined card: `4000 0000 0000 0002`
3. ✅ Should show "Your card was declined" error
4. ✅ Should stay on Stripe Checkout page
5. ✅ User can try again with different card

#### Test: 3D Secure Authentication

1. Start checkout flow again
2. Use 3D Secure card: `4000 0025 0000 3155`
3. ✅ Should trigger authentication modal
4. Click **Authorize Test Payment**
5. ✅ Should complete payment
6. ✅ Should redirect to success page

---

### 8. Demo Page Flow

#### Test: Video Section

- [ ] Navigate to `/demo`
- [ ] Click **"Voir la vidéo de démo"** button
- [ ] ✅ Should scroll to video section
- [ ] ✅ Placeholder should be visible with message

#### Test: Demo Form Submission

- [ ] Scroll to demo request form
- [ ] Fill out form:
  - First Name: `Marie`
  - Last Name: `Martin`
  - Email: `marie.martin@test.fr`
  - Phone: `0123456789`
  - Employees: `25`
  - Company: `Test Corp`
  - Needs: `Test automation needs`
- [ ] Click **"Réserver ma démo gratuite"** button
- [ ] ✅ Should show loading state
- [ ] ✅ Should submit to backend API
- [ ] ✅ Should show success/error message
- [ ] ✅ Form should clear on success

---

### 9. Navigation & Links

#### Test: Simple Navigation Menu

- [ ] Navigate to any page
- [ ] Click **"WorkFlowAI"** logo
- [ ] ✅ Should navigate to homepage
- [ ] Click each menu item:
  - [ ] **Accueil** → Homepage
  - [ ] **Fonctionnalités** → Features section
  - [ ] **Comment ça marche** → How It Works section
  - [ ] **Tarifs** → Pricing section
  - [ ] **Contact** → Contact section

#### Test: Mobile Navigation

- [ ] Resize browser to mobile width (<768px)
- [ ] Click hamburger menu icon
- [ ] ✅ Mobile menu should open
- [ ] Click each menu item
- [ ] ✅ Menu should close after selection
- [ ] ✅ Should navigate/scroll to correct section

---

### 10. Error Handling

#### Test: Invalid Plan Parameter

- [ ] Navigate to `/checkout?plan=invalid`
- [ ] ✅ Should default to "Starter" plan
- [ ] ✅ No errors in console

#### Test: Missing Plan Parameter

- [ ] Navigate to `/checkout` (no query param)
- [ ] ✅ Should default to "Starter" plan

#### Test: Backend API Errors

- [ ] Stop backend server
- [ ] Try to submit demo form
- [ ] ✅ Should show error message
- [ ] ✅ Should not crash the app
- [ ] Restart backend server
- [ ] Try again
- [ ] ✅ Should work normally

---

## Browser Compatibility Testing

Test in the following browsers:

### Desktop

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile

- [ ] iOS Safari
- [ ] Android Chrome
- [ ] Android Firefox

---

## Performance Testing

### Lighthouse Scores

- [ ] Run Lighthouse audit (`npm run lighthouse`)
- [ ] Performance: Should be > 80
- [ ] Accessibility: Should be > 90
- [ ] Best Practices: Should be > 90
- [ ] SEO: Should be > 80

### Page Load Times

- [ ] Homepage: < 2s
- [ ] Checkout page: < 2s
- [ ] Demo page: < 2s
- [ ] Get Started page: < 2s

---

## Security Testing

### Environment Variables

- [ ] API keys are NOT in source code
- [ ] `.env` files are in `.gitignore`
- [ ] Only publishable key is exposed to frontend
- [ ] Secret key is only in backend

### Stripe Integration

- [ ] Webhook signature verification is enabled
- [ ] Using HTTPS in production (localhost HTTP is OK for dev)
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled

---

## Common Issues & Solutions

### Issue: "Invalid API Key"

**Solution**: Check environment variables are set correctly

### Issue: Buttons don't navigate

**Solution**: Check browser console for errors, ensure React Router is working

### Issue: Stripe Checkout doesn't open

**Solution**:

1. Check backend is running
2. Verify Stripe API keys are set
3. Check browser console for errors
4. Verify CORS is configured

### Issue: Form submission fails

**Solution**:

1. Check backend logs
2. Verify API endpoint is correct
3. Check network tab for request/response

---

## Reporting Issues

If you find any issues during testing:

1. **Note the following**:
   - What page you were on
   - What button you clicked
   - Expected behavior
   - Actual behavior
   - Browser console errors
   - Network tab errors

2. **Check**:
   - Are environment variables set?
   - Is backend server running?
   - Are there any console errors?
   - Is the network request successful?

3. **Document**:
   - Take screenshots if helpful
   - Copy any error messages
   - Note browser and device used

---

## Success Criteria

All tests pass when:

- ✅ All buttons navigate correctly
- ✅ All forms submit successfully
- ✅ Stripe checkout works with test cards
- ✅ Success page shows after payment
- ✅ Error handling works gracefully
- ✅ Mobile navigation works
- ✅ No console errors
- ✅ Pages load quickly
- ✅ Responsive on all devices

---

## Next Steps After Testing

Once all tests pass:

1. Fix any bugs found
2. Optimize performance if needed
3. Add analytics tracking
4. Prepare for production deployment
5. Switch to Stripe live mode
6. Set up production webhooks
7. Monitor real payments

---

## Test Results Template

Use this template to record your test results:

```markdown
## Test Results - [Date]

### Environment

- Frontend: http://localhost:8080
- Backend: http://localhost:8080
- Stripe Mode: Test
- Browser: [Browser Name & Version]

### Hero Section

- [x] GET COMPUTE → /get-started: PASS
- [x] VOIR LA DÉMO → /demo: PASS

### Pricing Section

- [x] Starter plan → /checkout: PASS
- [x] Professional plan → /checkout: PASS
- [x] Enterprise plan → contact: PASS
- [x] Planifier démo → /demo: PASS

[Continue for all tests...]

### Issues Found

1. [Description of issue]
2. [Description of issue]

### Notes

- [Any additional observations]
```
