# API Key Management - Testing Guide

This guide covers how to test the API Key Management UI feature you just implemented.

## Quick Start

### 1. Navigate to Settings Page

The API Key Manager is integrated into the Settings page:

- **URL**: `http://localhost:5173/settings`
- **Route**: `/settings` (from `App.tsx`)
- **Requires**: Authentication (Clerk)

**From your current location** (`/app/chat`):
- Click on your user profile/avatar (top right)
- Look for a "Settings" link, OR
- Navigate directly to: `http://localhost:5173/settings`

---

## Manual UI Testing

### Test 1: View Empty State

1. Navigate to `/settings`
2. **Expected**: You should see:
   - "No API keys" message
   - "Create your first API key" button
   - Empty state card with key icon

### Test 2: Create API Key (Basic)

1. Click "Create your first API key" button
2. **Expected**: Dialog opens with:
   - Title: "Create API Key"
   - Optional name field
   - "Create Key" and "Cancel" buttons

3. Click "Create Key" (without name)
4. **Expected**:
   - Loading spinner appears
   - Dialog changes to show full API key
   - Key displayed in monospace font
   - Copy button visible
   - Security warning alert
   - Auto-close countdown (30 seconds)
   - Toast notification: "API key created"

5. **Verify**:
   - Full key starts with `tc_live_`
   - Key is 64+ characters long
   - Copy button works (icon changes to checkmark)
   - Toast appears on copy

### Test 3: Create API Key (With Name)

1. Click "Create key" button
2. Enter a name: `Production Server`
3. Click "Create Key"
4. **Expected**:
   - Key created successfully
   - In the list, key shows name "Production Server"
   - Key prefix visible (e.g., `tc_live_abc123...`)

### Test 4: Create API Key (Name Validation)

Test invalid names:

1. **Empty after trim**: Enter only spaces → Should show error
2. **Too long**: Enter 101+ characters → Should show error
3. **Invalid chars**: Enter `test@key` → Should show error
4. **Valid**: Enter `My-API-Key_123` → Should work

**Expected errors**:
- "API key name cannot be empty"
- "API key name must be 100 characters or less"
- "API key name can only contain letters, numbers, spaces, hyphens, and underscores"

### Test 5: View Key List

After creating keys, you should see:

- **Card layout** with:
  - Key icon
  - Key name (or "Unnamed key")
  - Key prefix (monospace, truncated)
  - Creation date (formatted)
  - Last used date ("Never used" or relative time)
  - Revoke button (trash icon)

- **Header** with:
  - "API Keys" title
  - "Create key" button

### Test 6: Revoke API Key

1. Click the trash icon on any key
2. **Expected**: Confirmation dialog opens with:
   - Warning icon
   - "Revoke API Key?" title
   - Key context card showing:
     - Key name (if set)
     - Key prefix
     - Created date
     - Last used date (if available)
   - "Immediate Impact" warning alert
   - "Cancel" and "Revoke Key" buttons

3. Click "Revoke Key"
4. **Expected**:
   - Loading spinner on button
   - Dialog closes
   - Key disappears from list
   - Toast notification: "API key revoked" with "Undo" action
   - Toast shows for 10 seconds

### Test 7: Undo Revocation (Restore)

1. Revoke a key (see Test 6)
2. **Within 10 seconds**, click "Undo" in the toast
3. **Expected**:
   - Toast: "API key restored"
   - Key reappears in the list
   - Key is active again

4. **After 10 seconds**:
   - Toast disappears
   - Undo no longer available
   - Key remains revoked

### Test 8: Prevent Accidental Key Loss

1. Create a new key
2. When key is displayed, try to close dialog without copying
3. **Expected**:
   - Warning toast: "Make sure to copy your API key before closing"
   - "Close anyway" action in toast
   - Dialog stays open

4. Copy the key, then close
5. **Expected**: Dialog closes without warning

### Test 9: Auto-Close Dialog

1. Create a new key
2. Wait 30 seconds (watch countdown)
3. **Expected**: Dialog auto-closes

### Test 10: Loading States

1. Create a key → See loading spinner
2. Revoke a key → See loading spinner on revoke button
3. **Expected**: Buttons disabled during operations

### Test 11: Error Handling

**Test network error**:
1. Open browser DevTools → Network tab
2. Set to "Offline" mode
3. Try to create a key
4. **Expected**: Error toast with message

**Test 401 (Unauthorized)**:
1. Log out or expire session
2. Try to access `/settings`
3. **Expected**: Redirected to login

---

## Automated Testing

### Run Existing Tests

```bash
# Run all frontend tests
npm run test:frontend

# Run only API key tests
npm run test:frontend -- ApiKeyManager

# Run with coverage
npm run test:coverage
```

### Test File Location

```
apps/frontend/src/components/app/__tests__/ApiKeyManager.test.tsx
```

### Current Test Coverage

The existing tests cover:
- ✅ Component renders correctly
- ✅ Key list displays
- ✅ Create button appears
- ✅ Revoke dialog opens
- ✅ Key context in dialog

### Add More Tests (Optional)

You can enhance the test suite with:

```typescript
// Test empty state
it('shows empty state when no keys exist', () => {
  // Mock empty keys array
})

// Test create dialog
it('opens create dialog when button clicked', async () => {
  // Test dialog opens
})

// Test copy functionality
it('copies key to clipboard', async () => {
  // Mock clipboard API
})

// Test error states
it('displays error message on API failure', () => {
  // Mock error response
})
```

---

## API Testing (Browser DevTools)

### Test 1: List API Keys

1. Open DevTools → Network tab
2. Navigate to `/settings`
3. Find request: `GET /api/app/api-keys`
4. **Check**:
   - Status: `200 OK`
   - Headers: `Authorization: Bearer <token>`
   - Response:
     ```json
     {
       "success": true,
       "keys": [
         {
           "id": "...",
           "key_prefix": "tc_live_abc123...",
           "name": "Production Server",
           "created_at": "2024-01-01T00:00:00.000Z",
           "revoked_at": null,
           "last_used_at": null
         }
       ]
     }
     ```

### Test 2: Create API Key

1. Create a key in UI
2. Find request: `POST /api/app/api-keys`
3. **Check**:
   - Status: `200 OK`
   - Request body: `{ "name": "..." }` (optional)
   - Response:
     ```json
     {
       "success": true,
       "id": "...",
       "key": "tc_live_<full_key>",
       "key_prefix": "tc_live_abc123...",
       "created_at": "2024-01-01T00:00:00.000Z"
     }
     ```
   - **Important**: Full `key` only returned once!

### Test 3: Revoke API Key

1. Revoke a key in UI
2. Find request: `DELETE /api/app/api-keys`
3. **Check**:
   - Status: `200 OK`
   - Request body: `{ "keyId": "..." }`
   - Response:
     ```json
     {
       "success": true,
       "message": "API key revoked"
     }
     ```

### Test 4: Restore API Key

1. Revoke a key, then click "Undo" in toast
2. Find request: `POST /api/app/api-keys/{id}/restore`
3. **Check**:
   - Status: `200 OK`
   - Response:
     ```json
     {
       "success": true,
       "message": "API key restored"
     }
     ```

### Test 5: Error Cases

**401 Unauthorized**:
- Remove `Authorization` header
- Expected: `401` with error message

**400 Bad Request** (invalid name):
- Send `POST` with invalid name
- Expected: `400` with validation error

**404 Not Found** (revoke non-existent key):
- Send `DELETE` with invalid `keyId`
- Expected: `404` with error message

---

## Feature Checklist

Use this checklist to verify all features:

### Core Features
- [ ] View empty state when no keys exist
- [ ] Create API key (without name)
- [ ] Create API key (with name)
- [ ] View list of API keys
- [ ] See key metadata (name, prefix, dates)
- [ ] Revoke API key with confirmation
- [ ] Undo revocation within 10 seconds
- [ ] Copy key to clipboard
- [ ] Auto-close dialog after 30 seconds
- [ ] Prevent accidental key loss

### Validation
- [ ] Name validation (empty, length, characters)
- [ ] Error messages display correctly
- [ ] Form resets after creation

### Security
- [ ] Full key shown only once
- [ ] Keys masked in list (prefix only)
- [ ] Authentication required
- [ ] User can only see own keys

### UX/UI
- [ ] Loading states during operations
- [ ] Toast notifications appear
- [ ] Error states display correctly
- [ ] Responsive design (mobile/desktop)
- [ ] Keyboard navigation works
- [ ] Screen reader friendly

### Edge Cases
- [ ] Network errors handled
- [ ] 401 redirects to login
- [ ] Restore window expires correctly
- [ ] Multiple keys can be created
- [ ] Revoked keys don't appear in list

---

## Common Issues & Troubleshooting

### Issue: "Authentication required" error

**Solution**:
- Ensure you're logged in via Clerk
- Check browser console for auth errors
- Verify `Authorization` header in Network tab

### Issue: Keys not appearing

**Solution**:
- Check MongoDB connection
- Verify `clerkId` matches your user
- Check browser console for errors
- Verify API response in Network tab

### Issue: Copy button doesn't work

**Solution**:
- Check browser permissions for clipboard
- Test in HTTPS or localhost (clipboard requires secure context)
- Check console for errors

### Issue: Dialog doesn't auto-close

**Solution**:
- Check browser console for errors
- Verify countdown timer is running
- Check if dialog is manually closed before timeout

### Issue: Undo doesn't work

**Solution**:
- Ensure you click "Undo" within 10 seconds
- Check Network tab for restore request
- Verify key was actually revoked (check `revokedAt` in DB)

---

## Testing with cURL (Optional)

If you want to test the API directly:

```bash
# Get your Clerk token (from browser DevTools → Application → Local Storage)
TOKEN="your_clerk_token_here"

# List keys
curl -X GET http://localhost:5173/api/app/api-keys \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

# Create key
curl -X POST http://localhost:5173/api/app/api-keys \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Key"}'

# Revoke key (replace KEY_ID)
curl -X DELETE http://localhost:5173/api/app/api-keys \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"keyId": "KEY_ID"}'

# Restore key (replace KEY_ID)
curl -X POST http://localhost:5173/api/app/api-keys/KEY_ID/restore \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

---

## Next Steps

1. ✅ Complete manual testing checklist
2. ✅ Run automated tests
3. ✅ Test error scenarios
4. ✅ Verify security (keys not exposed)
5. ✅ Test on mobile devices
6. ✅ Test with multiple users (different `clerkId`)

---

## Quick Test Script

Here's a quick test sequence:

1. **Navigate**: `http://localhost:5173/settings`
2. **Create key**: Click "Create your first API key" → "Create Key"
3. **Copy key**: Click copy button → Verify toast
4. **Close dialog**: Click "I've copied the key"
5. **Verify list**: Key appears with prefix
6. **Revoke key**: Click trash icon → "Revoke Key"
7. **Undo**: Click "Undo" in toast (within 10s)
8. **Verify**: Key reappears
9. **Revoke again**: Revoke the key
10. **Wait 11s**: Undo should no longer work

---

**Happy Testing! 🚀**
