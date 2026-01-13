# Authentication Documentation

**Last Updated**: 2026-01-09
**Status**: Active

Authentication flows and security practices for TCDynamics WorkFlowAI platform.

## Overview

The platform uses multiple authentication methods:

- **Clerk Authentication** - Primary user authentication (frontend + backend)
- **API Key Authentication** - Server-to-server authentication
- **Webhook Authentication** - Event verification (Clerk, Polar)

## Clerk Authentication

### Frontend Integration

**Location**: `apps/frontend/src/App.tsx`

**Setup**:

```typescript
import { ClerkProvider } from '@clerk/clerk-react'

<ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
  {/* App content */}
</ClerkProvider>
```

**Usage**:

```typescript
import { useAuth } from '@clerk/clerk-react'

function MyComponent() {
  const { userId, isSignedIn } = useAuth()

  if (!isSignedIn) {
    return <Login />
  }

  return <Dashboard userId={userId} />
}
```

**Components**:
- `<SignIn />` - Sign-in form
- `<SignUp />` - Sign-up form
- `<UserButton />` - User profile button
- `<SignedIn />` - Conditional render for authenticated users
- `<SignedOut />` - Conditional render for unauthenticated users

**Protected Routes**:

```typescript
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react'

function ProtectedRoute({ children }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  )
}
```

### Backend Verification

**Location**: `api/_lib/auth.js`

**Usage**:

```javascript
import { verifyClerkAuth } from './_lib/auth.js'

export default async function handler(req, res) {
  const authHeader = req.headers.authorization
  const { userId: clerkId, error } = await verifyClerkAuth(authHeader)

  if (error || !clerkId) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  // User is authenticated, clerkId is available
  // ... handler logic
}
```

**Token Verification**:

```javascript
// Verify JWT token from Authorization header
const { userId: clerkId, error } = await verifyClerkAuth(
  req.headers.authorization // "Bearer <jwt_token>"
)
```

**Error Handling**:

- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Token expired or revoked
- Development mode provides detailed error messages

### User Sync

**Location**: `api/webhooks/clerk.js`

**Webhook Events**:
- `user.created` - Create User document in MongoDB
- `user.updated` - Update User document in MongoDB
- `user.deleted` - Soft-delete User document (set `deletedAt`)

**User Model**:

```javascript
{
  clerkId: String (required, unique, indexed)
  email: String (required, lowercase, indexed)
  plan: String (enum: ['starter', 'professional', 'enterprise'], default: 'starter')
  subscriptionStatus: String (enum: ['active', 'canceled', 'past_due', 'trialing', null])
  firstName: String (optional)
  lastName: String (optional)
  imageUrl: String (optional)
  deletedAt: Date (optional) // Soft delete
}
```

See [Data Models](../architecture/data-models.md) for complete schema.

### Webhook Authentication

**Location**: `api/webhooks/clerk.js`

**Signature Verification**:

```javascript
import { Webhook } from 'svix'

const wh = new Webhook(process.env.CLERK_WEBHOOK_SIGNING_SECRET)
const event = wh.verify(payload, {
  'svix-id': req.headers['svix-id'],
  'svix-timestamp': req.headers['svix-timestamp'],
  'svix-signature': req.headers['svix-signature'],
})
```

**Configuration**:

1. Set `CLERK_WEBHOOK_SIGNING_SECRET` environment variable
2. Configure webhook in Clerk Dashboard:
   - Endpoint: `https://your-domain.com/api/webhooks/clerk`
   - Events: `user.created`, `user.updated`, `user.deleted`
   - Copy signing secret to environment variable

**Security**:
- Verifies webhook signature using Svix library
- Rejects requests with invalid signatures (403 Forbidden)
- Requires raw body for signature verification

## API Key Authentication

### API Key Format

**Format**: `tc_live_<64 hex chars>`

**Example**: `tc_live_1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef`

**Storage**:
- Full key hashed with bcrypt (`keyHash`)
- Prefix stored for display (`keyPrefix`: first 20 chars + `...`)
- Full key only returned once on creation

### Creating API Keys

**Endpoint**: `POST /api/app/api-keys`

**Authentication**: Requires Clerk JWT

**Request**:

```json
{
  "name": "Production Server"
}
```

**Response**:

```json
{
  "success": true,
  "id": "key_id_123",
  "key": "tc_live_full_api_key_here",
  "key_prefix": "tc_live_abc123...",
  "created_at": "2026-01-09T12:00:00.000Z"
}
```

**⚠️ Important**: Full key is only returned once on creation. Store securely.

### Verifying API Keys

**Location**: `api/_lib/api-key-auth.js`

**Usage**:

```javascript
import { verifyTenantApiKey } from './_lib/api-key-auth.js'

export default async function handler(req, res) {
  const apiKey = req.headers['x-api-key'] || req.headers.authorization?.replace('Bearer ', '')
  const { clerkId, error } = await verifyTenantApiKey(apiKey)

  if (error || !clerkId) {
    return res.status(401).json({ error: 'Invalid API key' })
  }

  // API key is valid, clerkId is available
  // ... handler logic
}
```

**Performance Optimization**:
1. Pre-filter by `keyPrefix` (first 20 chars) - Reduces candidates
2. Filter by `revokedAt: null` - Only check active keys
3. Bcrypt comparison loop - Typically 0-1 keys per request

**Indexes**:
- `{ keyPrefix: 1 }` - Fast prefix matching
- `{ revokedAt: 1, keyPrefix: 1 }` - Compound index for optimal queries

### Managing API Keys

**List Keys**: `GET /api/app/api-keys`
- Returns key prefixes (never full keys)
- Only active (non-revoked) keys

**Revoke Key**: `DELETE /api/app/api-keys`
- Soft revoke (sets `revokedAt` timestamp)
- Can be restored within 10 seconds

**Restore Key**: `POST /api/app/api-keys/[id]/restore`
- Restore window: 10 seconds after revocation
- Only within restore window

See [API Endpoints](../architecture/api-endpoints.md) for complete API documentation.

### API Key Security

**Best Practices**:
1. **Store securely** - Never log or expose full keys
2. **Use HTTPS** - Always transmit over encrypted connections
3. **Rotate regularly** - Revoke and create new keys periodically
4. **Name descriptively** - Use clear names for key identification
5. **Monitor usage** - Track `lastUsedAt` for suspicious activity

**Revocation**:
- Immediate revocation via DELETE endpoint
- 10-second restore window for accidental revocations
- After restore window, key is permanently revoked

## Webhook Authentication

### Clerk Webhook

**Location**: `api/webhooks/clerk.js`

**Authentication**: Svix signature verification

**Headers Required**:
- `svix-id` - Webhook ID
- `svix-timestamp` - Webhook timestamp
- `svix-signature` - Webhook signature

**Verification**:

```javascript
import { Webhook } from 'svix'

const wh = new Webhook(process.env.CLERK_WEBHOOK_SIGNING_SECRET)
const event = wh.verify(payload.toString(), {
  'svix-id': req.headers['svix-id'],
  'svix-timestamp': req.headers['svix-timestamp'],
  'svix-signature': req.headers['svix-signature'],
})
```

**Security**:
- Verifies webhook signature using Svix library
- Rejects requests with invalid signatures (403 Forbidden)
- Requires raw body (not parsed JSON) for verification

### Polar Webhook

**Location**: `api/polar/webhook.js`

**Authentication**: Polar SDK signature verification

**Headers Required**:
- `polar-signature` - Webhook signature

**Verification**:

```javascript
import { validateEvent } from '@polar-sh/sdk/webhooks'

const signature = req.headers['polar-signature']
const rawBody = await getRawBody(req)

const event = validateEvent(rawBody.toString(), signature, process.env.POLAR_WEBHOOK_SECRET)
```

**Security**:
- Verifies webhook signature using Polar SDK
- Rejects requests with invalid signatures (403 Forbidden)
- Deduplicates events using in-memory cache
- Requires raw body for signature verification

**Deduplication**:
- In-memory cache of processed event IDs
- 15-minute TTL
- Maximum 1000 events cached

## Rate Limiting

### API Rate Limits

**Chat Endpoint** (`/api/chat`):
- Limit: 5 requests per 60 seconds per IP
- In-memory rate limiter (replace with Redis in production)

**Forms Endpoint** (`/api/forms`):
- Limit: 5 requests per 15 minutes per IP
- Cloudflare Turnstile CAPTCHA required
- Combined scope for contact and demo forms

### Rate Limit Headers

**Response Headers**:
- `X-RateLimit-Limit` - Maximum requests allowed
- `X-RateLimit-Remaining` - Requests remaining
- `X-RateLimit-Reset` - Reset timestamp

**Rate Limit Exceeded**:
- Status: `429 Too Many Requests`
- Response: `{ error: 'Rate limit exceeded' }`

## Security Best Practices

### Authentication

1. **Always verify tokens** - Never trust client-provided data
2. **Use HTTPS** - Always transmit tokens over encrypted connections
3. **Validate signatures** - Verify webhook signatures before processing
4. **Hash sensitive data** - PII is automatically hashed in logs
5. **Rotate keys** - Rotate API keys and webhook secrets periodically

### API Keys

1. **Store securely** - Never log or expose full keys
2. **Use prefixes** - Display only prefixes in UI
3. **Monitor usage** - Track `lastUsedAt` for suspicious activity
4. **Revoke immediately** - Revoke compromised keys immediately
5. **Use descriptive names** - Name keys for easy identification

### Webhooks

1. **Verify signatures** - Always verify webhook signatures
2. **Use raw body** - Don't parse body before signature verification
3. **Handle idempotency** - Deduplicate events to prevent double processing
4. **Validate events** - Verify event structure before processing
5. **Log security events** - Log failed verification attempts

## Environment Variables

### Clerk

- `VITE_CLERK_PUBLISHABLE_KEY` - Frontend publishable key (required)
- `CLERK_SECRET_KEY` - Backend secret key (required)
- `CLERK_WEBHOOK_SIGNING_SECRET` - Webhook signing secret (required for webhooks)

### API Keys

- No special environment variables (uses MongoDB for storage)

### Webhooks

- `CLERK_WEBHOOK_SIGNING_SECRET` - Clerk webhook signing secret
- `POLAR_WEBHOOK_SECRET` - Polar webhook signing secret

See [Environment Setup](../development/environment-setup.md) for complete variable documentation.

## Related Documentation

- [API Endpoints](../architecture/api-endpoints.md) - Authentication-required endpoints
- [Data Models](../architecture/data-models.md) - User and ApiKey models
- [Environment Setup](../development/environment-setup.md) - Authentication configuration
- [Security Headers](./headers.md) - Security headers and CSP

---

**Last Updated**: 2026-01-09
