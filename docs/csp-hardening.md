# CSP Hardening: Removing unsafe-inline and unsafe-eval

## Overview

This document describes the Content Security Policy (CSP) hardening implemented to remove `'unsafe-inline'` and `'unsafe-eval'` tokens from the `script-src` directive, significantly improving XSS protection.

## Changes Made

### 1. Removed Unsafe Tokens from Production CSP

**Before:**
```
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://connect.facebook.net ...
```

**After:**
```
script-src 'self' 'sha256-B0YeSIgQkU25t8JsAxqLZDvivwg+N1UjPV6BiObAslw=' https://connect.facebook.net ...
```

### 2. Moved Inline Scripts to External Files

#### Theme Initialization Script
- **Location**: `apps/frontend/public/scripts/theme-init.js`
- **Purpose**: Prevents FOUC (Flash of Unstyled Content) by applying theme before page renders
- **Status**: Kept inline with CSP hash (required for synchronous execution in `<head>`)
- **Hash**: `sha256-B0YeSIgQkU25t8JsAxqLZDvivwg+N1UjPV6BiObAslw=`

#### Facebook SDK Script
- **Location**: `apps/frontend/public/scripts/facebook-sdk.js`
- **Purpose**: Initializes Facebook SDK asynchronously
- **Status**: Moved to external file, loaded with `defer` attribute
- **CSP**: Served from `'self'`, no hash needed

### 3. Updated Configuration Files

#### vercel.json (Production)
- Removed `'unsafe-inline'` and `'unsafe-eval'` from `script-src`
- Added CSP hash for theme initialization script
- Added `https://challenges.cloudflare.com` for Turnstile CAPTCHA

#### vercel.json.dev (Development)
- Created separate dev configuration with relaxed CSP
- Includes `'unsafe-inline'` and `'unsafe-eval'` for development convenience
- Allows localhost connections for local development

#### staticwebapp.config.json (Azure Static Web Apps)
- Updated to match production CSP settings
- Removed unsafe tokens
- Added CSP hash and third-party domains

### 4. Third-Party Script Integrations

All third-party scripts are now properly configured:

- **Stripe**: Loaded via `@stripe/stripe-js` package (bundled, served from `'self'`)
- **Sentry**: Loaded via `@sentry/browser` package (bundled, served from `'self'`)
- **Vercel Analytics**: Loaded via `@vercel/analytics` package (bundled, served from `'self'`)
- **Facebook SDK**: External script from `https://connect.facebook.net` (explicitly allowed)
- **Cloudflare Turnstile**: Dynamically loaded from `https://challenges.cloudflare.com` (explicitly allowed)

### 5. Dynamic Script Loading

The `Captcha` component dynamically loads the Turnstile script:
- Uses `document.createElement('script')` with proper attributes
- Sets `crossOrigin = 'anonymous'` for CSP compliance
- Script source is already whitelisted in CSP

## Security Benefits

1. **XSS Protection**: Prevents inline script injection attacks
2. **Eval Protection**: Blocks `eval()` and `new Function()` usage
3. **Strict CSP**: Enforces explicit allowlist for all scripts
4. **Hash-Based Validation**: Theme script validated via SHA-256 hash

## Development vs Production

### Production (vercel.json)
- Strict CSP without unsafe tokens
- Hash-based validation for inline scripts
- Explicit third-party domain allowlist

### Development (vercel.json.dev)
- Relaxed CSP with `'unsafe-inline'` and `'unsafe-eval'`
- Allows localhost connections
- Easier debugging and hot-reload support

## Verification

### Check CSP Headers
```bash
curl -I https://tcdynamics.fr | grep -i "content-security-policy"
```

### Browser Console
Open DevTools → Console and check for CSP violations:
- No errors about blocked inline scripts
- No errors about blocked eval usage
- All third-party scripts load successfully

### Testing Checklist
- [ ] Theme applies correctly (no FOUC)
- [ ] Facebook SDK initializes
- [ ] Stripe checkout works
- [ ] Sentry error tracking works
- [ ] Vercel Analytics loads
- [ ] Turnstile CAPTCHA renders
- [ ] No CSP violations in console

## Maintenance

### Adding New Inline Scripts

If you need to add a new inline script:

1. **Option 1: Move to External File** (Recommended)
   - Create file in `apps/frontend/public/scripts/`
   - Reference via `<script src="/scripts/your-script.js"></script>`
   - No CSP hash needed (served from `'self'`)

2. **Option 2: Use CSP Hash** (For critical inline scripts)
   - Compute SHA-256 hash:
     ```bash
     echo -n "script content" | openssl dgst -sha256 -binary | openssl base64
     ```
   - Add hash to CSP: `'sha256-<hash>'`
   - Keep script inline with hash attribute

### Adding New Third-Party Scripts

1. Add domain to `script-src` in `vercel.json`:
   ```
   script-src 'self' ... https://new-third-party.com
   ```

2. If script supports Subresource Integrity (SRI), add `integrity` attribute:
   ```html
   <script src="..." integrity="sha384-..." crossorigin="anonymous"></script>
   ```

3. Update this documentation with the new integration

## References

- [MDN: Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [CSP Hash Generator](https://cspscanner.com/)
- [OWASP: Content Security Policy Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)
