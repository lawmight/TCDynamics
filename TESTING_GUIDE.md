# Testing Guide - API Keys Feature Fixes

This guide helps you test all the fixes implemented from the code review plan.

## Prerequisites

1. **Environment Variables**: Ensure you have a `.env` file in the root with:
   - `MONGODB_URI` - MongoDB connection string
   - `CLERK_SECRET_KEY` - Clerk secret key for authentication
   - `PII_HASH_SALT` (optional) - Salt for PII hashing
   - `NODE_ENV=development` - For detailed error messages

2. **MongoDB**: Ensure MongoDB is accessible and running

3. **Clerk Authentication**: You'll need a valid Clerk JWT token for testing

## Starting the Development Servers

### Option 1: Run Both Servers (Recommended)

**Terminal 1 - Vercel Dev Server (API Functions):**
```bash
cd C:\Users\Tomco\OneDrive\Documents\Projects
vercel dev --listen 3001
```

**Terminal 2 - Frontend Dev Server:**
```bash
cd C:\Users\Tomco\OneDrive\Documents\Projects
npm run dev:frontend
```

### Option 2: Use npm dev (Frontend + Backend Express)

```bash
npm run dev
```

**Note**: The frontend proxies `/api` requests to `http://localhost:3001`, so you need Vercel dev running on port 3001 for the API functions to work.

## Testing Checklist

### Phase 1: Security Fixes

#### ✅ Test 1.1: PII Hashing Utility
- [ ] **Location**: `api/_lib/pii-hash.js`
- [ ] **Test**: Check that PII values are hashed correctly
- [ ] **Method**:
  - Create an API key via the frontend
  - Check server logs (should see hashed `clerkId`, not plain text)
  - Verify hash is consistent (same input = same hash)

#### ✅ Test 1.2: Logger Utility
- [ ] **Location**: `api/_lib/logger.js`
- [ ] **Test**: Verify logger hashes PII before logging
- [ ] **Method**:
  - Make API calls to `/api/app/api-keys`
  - Check console output - `clerkId` should be hashed
  - Verify no sensitive data (passwords, tokens) in logs
  - Test in development mode (should see logs)
  - Test in production mode (should not see console logs)

#### ✅ Test 1.3: Console.log Replacement
- [ ] **Location**: `api/app/api-keys.js`, `api/_lib/api-key-auth.js`
- [ ] **Test**: All `console.log`/`console.error` replaced with logger
- [ ] **Method**:
  - Search codebase for `console.log` in API files (should be minimal)
  - Make API calls and verify logger is used
  - Check that PII is hashed in all log outputs

#### ✅ Test 1.4: Input Validation for API Key Names
- [ ] **Location**: `api/app/api-keys.js` (POST handler)
- [ ] **Test Cases**:
  - [ ] Valid name: "My API Key" (should succeed)
  - [ ] Valid name: "test-key_123" (should succeed)
  - [ ] Invalid: Empty string (should return 400)
  - [ ] Invalid: Too long (>100 chars) (should return 400)
  - [ ] Invalid: Special characters like `@#$%` (should return 400)
  - [ ] Invalid: Control characters (should return 400)
  - [ ] Valid: null/undefined (should succeed, name optional)

### Phase 2: Error Handling

#### ✅ Test 2.1: Error Response Helper
- [ ] **Location**: `api/_lib/error-handler.js`
- [ ] **Test**: Error messages are environment-aware
- [ ] **Method**:
  - **Development mode** (`NODE_ENV=development`):
    - Trigger an error (e.g., invalid request)
    - Response should include detailed error message
    - Response should include error details/stack
  - **Production mode** (`NODE_ENV=production`):
    - Trigger same error
    - Response should be generic: "An error occurred processing your request"
    - Detailed error should only be in server logs

#### ✅ Test 2.2: Error Responses in API Keys Endpoint
- [ ] **Location**: `api/app/api-keys.js`
- [ ] **Test**: All errors use `createErrorResponse()`
- [ ] **Method**:
  - Test authentication error (no token) - should return generic message in prod
  - Test database error (disconnect MongoDB) - should return generic message
  - Test validation error - should return appropriate 400 with message
  - Check server logs for detailed errors

### Phase 3: Code Quality

#### ✅ Test 3.1: Quote Consistency
- [ ] **Files**:
  - `apps/frontend/src/components/ui/button.tsx`
  - `apps/frontend/src/lib/utils.ts`
  - `apps/frontend/tailwind.config.ts`
- [ ] **Test**: All strings use single quotes
- [ ] **Method**:
  - Run `npm run lint:frontend`
  - Should pass without quote-related errors
  - Visually inspect files (no double quotes for strings)

#### ✅ Test 3.2: Tailwind Config
- [ ] **Location**: `apps/frontend/tailwind.config.ts`
- [ ] **Test**: No duplicate plugin, config builds correctly
- [ ] **Method**:
  - Run `npm run build:frontend`
  - Should build without errors
  - Check that `tailwindcssAnimate` is only included once

#### ✅ Test 3.3: Frontend Input Validation
- [ ] **Location**: `apps/frontend/src/components/app/ApiKeyCreateDialog.tsx`
- [ ] **Test**: Zod validation works for API key names
- [ ] **Test Cases**:
  - [ ] Valid name: "My API Key" (should allow)
  - [ ] Valid name: "test-key_123" (should allow)
  - [ ] Invalid: >100 characters (should show error)
  - [ ] Invalid: Special characters `@#$%` (should show error)
  - [ ] Empty string (should show error or prevent submission)
  - [ ] Error messages are user-friendly

### Phase 4: Performance

#### ✅ Test 4.1: API Key Verification Query
- [ ] **Location**: `api/_lib/api-key-auth.js`
- [ ] **Test**: Verification is optimized
- [ ] **Method**:
  - Create multiple API keys
  - Use an API key to make authenticated request
  - Check response time (should be reasonable)
  - Verify it still works correctly

#### ✅ Test 4.2: Database Index
- [ ] **Location**: `api/_lib/models/ApiKey.js`
- [ ] **Test**: Index exists for `{ revokedAt: 1, clerkId: 1 }`
- [ ] **Method**:
  - Check MongoDB indexes (via MongoDB Compass or CLI)
  - Verify compound index exists
  - Test query performance with many keys

### Phase 5: Security Verification

#### ✅ Test 5.1: API Key Format
- [ ] **Location**: `api/_lib/api-key-auth.js`
- [ ] **Test**: Key prefix check works correctly
- [ ] **Method**:
  - Create API key (should have `tc_live_` prefix)
  - Verify authentication works with `tc_live_` prefix
  - Test with invalid prefix (should fail)
  - Check comment explains the change

## Manual Testing Steps

### Step 1: Start Servers

1. **Terminal 1** - Start Vercel Dev:
```bash
vercel dev --listen 3001
```

2. **Terminal 2** - Start Frontend:
```bash
npm run dev:frontend
```

3. **Verify**:
   - Frontend: http://localhost:5173
   - API: http://localhost:3001/api/app/api-keys

### Step 2: Test API Key Creation (Frontend)

1. Navigate to the API Keys page in your app
2. Click "Create API Key"
3. **Test Valid Names**:
   - Enter "My Test Key" → Should succeed
   - Enter "test-key_123" → Should succeed
4. **Test Invalid Names**:
   - Enter a name >100 characters → Should show validation error
   - Enter "test@key" → Should show validation error
   - Try submitting empty → Should show error
5. **Verify**:
   - Key is created successfully
   - Key prefix is displayed (not full key)
   - Copy functionality works
   - Security warnings are shown

### Step 3: Test API Endpoints (Direct)

Use a tool like Postman, curl, or Thunder Client:

#### Test GET /api/app/api-keys

```bash
curl -X GET http://localhost:3001/api/app/api-keys \
  -H "Authorization: Bearer YOUR_CLERK_JWT_TOKEN"
```

**Expected**:
- Returns list of API keys (prefixes only)
- No full keys exposed
- `clerkId` in logs is hashed

#### Test POST /api/app/api-keys

```bash
curl -X POST http://localhost:3001/api/app/api-keys \
  -H "Authorization: Bearer YOUR_CLERK_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Key"}'
```

**Valid Cases**:
- `{"name": "Valid Key"}` → Should succeed
- `{"name": null}` → Should succeed (optional name)
- `{}` → Should succeed (no name)

**Invalid Cases**:
- `{"name": ""}` → Should return 400
- `{"name": 123}` → Should return 400 (not string)
- `{"name": "a".repeat(101)}` → Should return 400 (too long)
- `{"name": "test@key"}` → Should return 400 (invalid chars)

#### Test Error Handling

```bash
# No auth token
curl -X GET http://localhost:3001/api/app/api-keys

# Invalid name
curl -X POST http://localhost:3001/api/app/api-keys \
  -H "Authorization: Bearer YOUR_CLERK_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "test@invalid"}'
```

**Expected**:
- Development: Detailed error messages
- Production: Generic "An error occurred" message
- Server logs contain detailed errors

### Step 4: Verify Logging

1. **Check Console Output**:
   - All logs should use the logger utility
   - PII fields (`clerkId`, `userId`, `orgId`) should be hashed
   - No sensitive data (passwords, tokens) in logs
   - Logs formatted with timestamps

2. **Test PII Hashing**:
   - Create an API key
   - Check logs for `clerkId` - should be a hash, not plain text
   - Same `clerkId` should produce same hash

3. **Test Environment Modes**:
   - Development: Logs visible in console
   - Production: No console logs (or minimal)

### Step 5: Verify Code Quality

1. **Run Linter**:
```bash
npm run lint:frontend
npm run lint:backend
```

2. **Run Type Check**:
```bash
npm run type-check:frontend
```

3. **Build Test**:
```bash
npm run build:frontend
```

All should pass without errors.

## Quick Test Script

You can use this PowerShell script to quickly test the API:

```powershell
# Set your Clerk JWT token
$token = "YOUR_CLERK_JWT_TOKEN"
$baseUrl = "http://localhost:3001"

# Test GET
Write-Host "Testing GET /api/app/api-keys..."
Invoke-RestMethod -Uri "$baseUrl/api/app/api-keys" -Method GET -Headers @{"Authorization" = "Bearer $token"}

# Test POST with valid name
Write-Host "`nTesting POST with valid name..."
Invoke-RestMethod -Uri "$baseUrl/api/app/api-keys" -Method POST -Headers @{"Authorization" = "Bearer $token"; "Content-Type" = "application/json"} -Body '{"name": "Test Key"}'

# Test POST with invalid name
Write-Host "`nTesting POST with invalid name (should fail)..."
try {
    Invoke-RestMethod -Uri "$baseUrl/api/app/api-keys" -Method POST -Headers @{"Authorization" = "Bearer $token"; "Content-Type" = "application/json"} -Body '{"name": "test@invalid"}'
} catch {
    Write-Host "Expected error: $_"
}
```

## Success Criteria

All tests should pass:
- ✅ PII is hashed in all logs
- ✅ Input validation rejects invalid API key names
- ✅ Error messages are environment-aware
- ✅ No console.log/error in API code (using logger)
- ✅ Quote consistency (single quotes)
- ✅ Tailwind config builds without errors
- ✅ Frontend validation shows user-friendly errors
- ✅ API key verification works correctly
- ✅ All linter and type checks pass

## Troubleshooting

### Vercel Dev Not Starting
- Ensure you're in the project root
- Check if port 3001 is already in use
- Try: `vercel dev --listen 3001 --yes` (auto-confirm)

### Frontend Can't Connect to API
- Verify Vercel dev is running on port 3001
- Check `apps/frontend/vite.config.ts` proxy configuration
- Verify CORS headers are set correctly

### MongoDB Connection Issues
- Check `MONGODB_URI` in `.env`
- Verify MongoDB is accessible
- Check network/firewall settings

### Authentication Errors
- Verify `CLERK_SECRET_KEY` is set
- Check JWT token is valid and not expired
- Ensure token format: `Bearer <token>`

## Next Steps

After successful testing:
1. Run full test suite: `npm run test`
2. Run E2E tests: `npm run test:e2e`
3. Check code coverage: `npm run test:coverage`
4. Deploy to preview environment for final verification
