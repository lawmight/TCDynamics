# COEP Header Fix: Third-Party Resource Loading

## Problem

The `Cross-Origin-Embedder-Policy: require-corp` header in `vercel.json` (lines 26-31) was blocking third-party resources that don't support Cross-Origin-Resource-Policy (CORP) headers:

- **Stripe**: Does NOT support CORP headers - would break
- **Sentry**: Does NOT support CORP headers - would break
- **Vercel Analytics**: ✅ DOES support CORP headers - works
- **Facebook SDK**: Does NOT support CORP headers - would break

## Solution

Changed `Cross-Origin-Embedder-Policy` from `require-corp` to `credentialless` in `vercel.json`.

### What Changed

```json
{
  "key": "Cross-Origin-Embedder-Policy",
  "value": "credentialless"  // Changed from "require-corp"
}
```

### Why `credentialless`?

- **Less strict than `require-corp`**: Allows cross-origin resources without requiring CORP headers
- **Still provides security**: Strips credentials (cookies, auth) from cross-origin requests
- **Better compatibility**: Works with most third-party services that don't support CORP

### Trade-offs

- **Credentialless mode**: Cookies and authentication are stripped from cross-origin requests
- **Impact**: May affect cookie-based features (Facebook tracking, Stripe session cookies)
- **If issues persist**: Consider removing COEP entirely and keeping only COOP: same-origin

## Testing

### 1. E2E Tests

Run the new E2E test suite to verify resource loading:

```bash
cd apps/frontend
npm run test:e2e -- tests/e2e/third-party-resources.spec.ts
```

The test verifies:
- ✅ Stripe.js loads without COEP errors
- ✅ Sentry SDK loads without COEP errors
- ✅ Vercel Analytics loads without COEP errors
- ✅ Facebook SDK loads without COEP errors
- ✅ No COEP-related console errors
- ✅ All third-party network requests succeed

### 2. Browser Console Check

On staging/production, open browser DevTools and run:

```javascript
// Copy and paste the script from apps/frontend/scripts/check-coep-resources.js
```

Or navigate to the script file and copy its contents into the console.

### 3. Manual Verification

1. **Deploy to staging** with the updated `vercel.json`
2. **Open browser DevTools** (F12)
3. **Check Console tab** for COEP-related errors
4. **Check Network tab** for failed third-party requests:
   - `https://js.stripe.com/*`
   - `https://*.sentry.io/*`
   - `https://cdn.vercel-insights.com/*`
   - `https://connect.facebook.net/*`
5. **Verify functionality**:
   - Stripe checkout page loads
   - Sentry error tracking works (if enabled)
   - Vercel Analytics loads
   - Facebook SDK initializes

## Rollback Plan

If `credentialless` still causes issues:

1. **Remove COEP entirely** (keep COOP: same-origin):
   ```json
   // Remove this header block:
   {
     "key": "Cross-Origin-Embedder-Policy",
     "value": "credentialless"
   }
   ```

2. **Keep COOP: same-origin** (less problematic):
   ```json
   {
     "key": "Cross-Origin-Opener-Policy",
     "value": "same-origin"
   }
   ```

3. **Test again** with the same E2E tests and browser checks

## References

- [MDN: Cross-Origin-Embedder-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Embedder-Policy)
- [MDN: IFrame credentialless](https://developer.mozilla.org/en-US/docs/Web/Security/IFrame_credentialless)
- [Stripe: Cross-origin isolation](https://docs.stripe.com/js/appendix/cross_origin_isolation)
- [Sentry Issue #41225](https://github.com/getsentry/sentry/issues/41225)

## Files Changed

- `vercel.json` - Updated COEP header value
- `tests/e2e/third-party-resources.spec.ts` - New E2E test suite
- `apps/frontend/scripts/check-coep-resources.js` - Browser console check script
- `docs/coep-header-fix.md` - This documentation
