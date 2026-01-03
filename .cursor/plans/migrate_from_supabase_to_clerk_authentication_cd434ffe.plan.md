---
name: Migrate from Supabase to Clerk Authentication
overview: Replace Supabase authentication with Clerk in both the React frontend and Vercel serverless API backend, following the strict Clerk integration guidelines provided.
todos:
  - id: install-frontend-clerk
    content: Install @clerk/clerk-react@latest in apps/frontend/package.json
    status: completed
  - id: add-env-vars-frontend
    content: Add VITE_CLERK_PUBLISHABLE_KEY to .env.example and document in plan
    status: completed
  - id: wrap-with-clerkprovider
    content: Wrap app with ClerkProvider in apps/frontend/src/main.tsx
    status: completed
  - id: replace-useauth-hook
    content: Replace Supabase auth with Clerk hooks in apps/frontend/src/hooks/useAuth.tsx
    status: completed
  - id: update-app-router
    content: Remove AuthProvider and update ProtectedRoute in apps/frontend/src/App.tsx
    status: completed
  - id: update-login-page
    content: Replace custom auth with Clerk components in apps/frontend/src/pages/auth/Login.tsx
    status: completed
  - id: update-navigation-components
    content: Update navigation components to use Clerk hooks (SimpleNavigation, etc.)
    status: completed
  - id: install-backend-clerk
    content: Install @clerk/backend@latest in api/package.json
    status: completed
  - id: update-backend-auth
    content: Replace verifySupabaseAuth with Clerk JWT verification in api/_lib/auth.js
    status: completed
  - id: update-api-routes
    content: Update API routes to use new Clerk auth function (api-keys, checkout-session, create-checkout-session)
    status: completed
  - id: user-id-migration
    content: Decide and implement user ID migration strategy (orgs table FK constraint)
    status: pending
  - id: update-api-utilities
    content: Update polar.ts and stripe.ts to use getToken() instead of session.access_token
    status: pending
  - id: clerk-dashboard-setup
    content: Configure Clerk dashboard (Google OAuth, redirect URLs, session settings)
    status: pending
---

# Migrate from Supabase to Clerk Authentication

## Overview

Replace Supabase authentication with Clerk following the official React (Vite) integration guidelines. This migration affects both frontend and backend since the API uses Supabase JWT verification.

## Scope

- **Frontend**: Replace Supabase auth with Clerk React SDK
- **Backend**: Replace Supabase JWT verification with Clerk JWT verification
- **Database**: Supabase database operations remain (contact forms, API keys, etc.) - only auth is replaced

## Implementation Plan

### 1. Frontend Setup (`apps/frontend/`)

#### 1.1 Install Dependencies

- Add `@clerk/clerk-react@latest` to `package.json` dependencies
- Run `npm install` (to be executed after plan approval)

#### 1.2 Environment Configuration

- Add `VITE_CLERK_PUBLISHABLE_KEY` to `.env.local` (or `.env`)
- Update `.env.example` to include `VITE_CLERK_PUBLISHABLE_KEY` placeholder
- **Critical**: Use `VITE_` prefix (required for Vite client-side exposure)

#### 1.3 Update Main Entry Point (`apps/frontend/src/main.tsx`)

- Import `ClerkProvider` from `@clerk/clerk-react`
- Read `VITE_CLERK_PUBLISHABLE_KEY` from `import.meta.env`
- Add error check for missing publishable key
- Wrap the entire app with `<ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">`
- Keep existing `StrictMode` wrapper

**Key changes:**

```typescript
import { ClerkProvider } from "@clerk/clerk-react";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <App />
    </ClerkProvider>
  </StrictMode>
);
```

#### 1.4 Replace Authentication Hook (`apps/frontend/src/hooks/useAuth.tsx`)

- Remove Supabase imports and client usage
- Replace with Clerk hooks: `useUser`, `useAuth`, `useClerk` from `@clerk/clerk-react`
- Maintain same interface where possible for minimal component changes:
  - `user`: Map Clerk's `user` object
  - `loading`: Use Clerk's `isLoaded` state
  - `signInWithGoogle`: Use Clerk's `signIn.authenticateWithRedirect`
  - `signOut`: Use Clerk's `signOut()` method
  - `session`: Can use `useAuth().sessionId` if needed
- Remove `refreshSession` or replace with Clerk equivalent
- Remove `authReady` or map to Clerk's loading state

#### 1.5 Update App Router (`apps/frontend/src/App.tsx`)

- Remove `AuthProvider` wrapper (ClerkProvider handles this)
- Update `ProtectedRoute` to use Clerk's `useAuth().isSignedIn` instead of custom `useAuth` hook
- Keep existing route structure

#### 1.6 Update Login Page (`apps/frontend/src/pages/auth/Login.tsx`)

- Replace custom Google sign-in button with Clerk's `<SignInButton>` component
- Use Clerk's `<SignedIn>` and `<SignedOut>` components for conditional rendering
- Remove Supabase-specific error handling
- Update text to reflect Clerk authentication

#### 1.7 Update Navigation/Header Components

- Search for components using `useAuth` hook (e.g., `SimpleNavigation.tsx`)
- Replace with Clerk's `useUser()` and `useAuth()` hooks
- Use `<UserButton>` component for user menu
- Use `<SignInButton>` and `<SignUpButton>` where appropriate

### 2. Backend API Setup (`api/`)

#### 2.1 Install Backend Dependencies

- Add `@clerk/backend@latest` to `api/package.json` dependencies
- Run `npm install` in `api/` directory

#### 2.2 Environment Configuration

- Add `CLERK_SECRET_KEY` to backend environment variables
- Update `api/.env.example` if it exists
- Configure in Vercel dashboard for production

#### 2.3 Update Auth Verification (`api/_lib/auth.js`)

- Replace `verifySupabaseAuth` with Clerk JWT verification
- Import `clerkClient` from `@clerk/backend`
- Use `clerkClient.verifyToken(token)` to verify JWT
- Extract user ID from verified token payload
- Maintain same function signature for compatibility with existing API routes:
  ```javascript
  export async function verifyClerkAuth(authHeader) {
    // Verify Clerk JWT token
    // Return { userId, error }
  }
  ```

#### 2.4 Update API Routes Using Auth

Update the following files to use new auth function:

- `api/app/api-keys.js`
- `api/polar/checkout-session.js`
- `api/polar/create-checkout-session.js`

**Change pattern:**

```javascript
// Before
import { verifySupabaseAuth } from '../_lib/auth.js'
const { userId, error } = await verifySupabaseAuth(authHeader)

// After
import { verifyClerkAuth } from '../_lib/auth.js'
const { userId, error } = await verifyClerkAuth(authHeader)
```

### 3. User ID Migration Strategy

> ✅ **No Migration Needed**: Since there are no existing users, you can use Option C (Fresh Start).

The `orgs` table has a foreign key constraint `id UUID PRIMARY KEY REFERENCES auth.users(id)`, but since you have no existing users with data, this is not a concern. New users created via Clerk will have their Clerk user IDs used directly.

**Note**: If you later need to support both Supabase and Clerk user IDs, you can add a `clerk_user_id` column at that time.

---

### 4. Token Acquisition for API Calls (CRITICAL)

The current code in `polar.ts` uses `session.access_token` for API authentication:

```typescript
Authorization: `Bearer ${session.access_token}`,
```

With Clerk, you need to use `getToken()` from the `useAuth()` hook:

#### 4.1 Update `useAuth.tsx` to Expose `getToken`

```typescript
import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-react'

export const useAuth = () => {
  const { isLoaded, isSignedIn, getToken, signOut } = useClerkAuth()
  const { user } = useUser()

  return {
    user,
    loading: !isLoaded,
    authReady: isLoaded,
    isSignedIn,
    getToken, // Expose this for API calls
    signOut,
  }
}
```

#### 4.2 Update API Call Utilities

Update `polar.ts` and `stripe.ts` to accept `getToken` function:

```typescript
// After (Clerk)
export const createCheckoutSession = async (
  planName: PlanType,
  getToken: () => Promise<string | null>
) => {
  const token = await getToken()
  if (!token) {
    return { success: false, error: 'AUTH_REQUIRED' }
  }
  // Use token in Authorization header
}
```

---

### 5. Backend Auth Verification (Corrected API)

The original plan mentions `clerkClient.verifyToken()`. The correct API is `verifyToken()` from `@clerk/backend`:

```javascript
import { verifyToken } from '@clerk/backend'

export async function verifyClerkAuth(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { userId: null, error: 'Missing or invalid Authorization header' }
  }

  const token = authHeader.replace('Bearer ', '')

  try {
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    })

    // payload.sub contains the Clerk user ID
    return { userId: payload.sub, error: null }
  } catch (err) {
    return { userId: null, error: err.message }
  }
}
```

---

### 6. Clerk Dashboard Setup (Required Before Migration)

Complete these steps in the [Clerk Dashboard](https://dashboard.clerk.com) before implementing code changes:

#### 6.1 Create Application

1. Go to Clerk Dashboard → Create Application
2. Name: "TC Dynamics"
3. Get your **Publishable Key** and **Secret Key**

#### 6.2 Configure Google OAuth

1. Navigate to **User & Authentication → Social Connections**
2. Enable **Google**
3. Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
4. Add authorized redirect URI from Clerk dashboard
5. Copy Client ID and Client Secret to Clerk

#### 6.3 Configure Redirect URLs

1. Go to **Paths → Redirect URLs**
2. Add your production domains:
   - `https://tcdynamics.fr`
   - `https://tcdynamics.fr/app/chat`

---

### 7. Rollback Plan

If issues arise during migration:

#### 7.1 Environment Variable Toggle

Keep both auth systems available initially:

```typescript
const USE_CLERK = import.meta.env.VITE_USE_CLERK === 'true';

// In main.tsx
{USE_CLERK ? (
  <ClerkProvider publishableKey={CLERK_KEY}><App /></ClerkProvider>
) : (
  <AuthProvider><App /></AuthProvider>
)}
```

#### 7.2 Backend Fallback

```javascript
const USE_CLERK = process.env.USE_CLERK === 'true'

export async function verifyAuth(authHeader) {
  return USE_CLERK
    ? verifyClerkAuth(authHeader)
    : verifySupabaseAuth(authHeader)
}
```

#### 7.3 Rollback Steps

1. Set `VITE_USE_CLERK=false` and `USE_CLERK=false` in Vercel env vars
2. Redeploy
3. Users continue with Supabase auth

---

### 8. Cleanup (Optional - can be deferred)

#### 3.1 Remove Supabase Auth Dependencies (if no longer needed)

- If Supabase is only used for auth: Remove `@supabase/supabase-js` from frontend
- If Supabase is still used for database: Keep package but remove auth-related imports

#### 3.2 Remove Supabase Client (if auth-only)

- If `apps/frontend/src/lib/supabaseClient.ts` is only for auth, remove it
- If used for database operations, keep but remove auth configuration

#### 3.3 Update Environment Variables

- Remove `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from frontend (if not needed for database)
- Keep backend Supabase vars if database operations remain

## Critical Guidelines Compliance

✅ **Environment Variable**: `VITE_CLERK_PUBLISHABLE_KEY` (not `REACT_APP_*` or `frontendApi`)

✅ **ClerkProvider Location**: In `main.tsx` (not deeper in component tree)

✅ **Package**: `@clerk/clerk-react@latest` (not other Clerk packages)

✅ **Props**: Use `publishableKey` (not `frontendApi`)

## Files to Modify

### Frontend

- `apps/frontend/package.json` - Add Clerk dependency
- `apps/frontend/src/main.tsx` - Add ClerkProvider wrapper
- `apps/frontend/src/hooks/useAuth.tsx` - Replace with Clerk hooks, expose getToken()
- `apps/frontend/src/App.tsx` - Remove AuthProvider, update ProtectedRoute
- `apps/frontend/src/pages/auth/Login.tsx` - Use Clerk components
- `apps/frontend/src/utils/polar.ts` - Update to use getToken() instead of session
- `apps/frontend/src/utils/stripe.ts` - Update to use getToken() instead of session
- `apps/frontend/.env.example` - Add VITE_CLERK_PUBLISHABLE_KEY

### Backend

- `api/package.json` - Add @clerk/backend dependency
- `api/_lib/auth.js` - Replace with Clerk JWT verification using verifyToken()
- `api/app/api-keys.js` - Update auth import
- `api/polar/checkout-session.js` - Update auth import
- `api/polar/create-checkout-session.js` - Update auth import

### Database (if migrating existing users)

- `supabase-schema-enhanced.sql` - Add clerk_user_id column to orgs (Option B)

## Verification Steps

1. Environment variable `VITE_CLERK_PUBLISHABLE_KEY` is set and accessible
2. `<ClerkProvider>` wraps app in `main.tsx`
3. No usage of `frontendApi` prop (use `publishableKey`)
4. Backend `CLERK_SECRET_KEY` is configured
5. All protected routes work with Clerk authentication
6. API routes successfully verify Clerk JWT tokens

## References

- Clerk React Quickstart: https://clerk.com/docs/react/getting-started/quickstart
- Clerk Backend SDK: https://clerk.com/docs/backend-requests/overview
