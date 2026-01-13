# API Endpoints Documentation

**Last Updated**: 2026-01-09
**Status**: Active

Complete catalog of Vercel serverless function endpoints for the TCDynamics WorkFlowAI platform.

## Overview

All API endpoints are deployed as Vercel serverless functions in the `api/` directory. Endpoints are accessible at `/api/*` paths.

### Base URL

- **Production**: `https://tcdynamics.fr/api`
- **Development**: `http://localhost:3001/api` (Vercel dev server)

### Authentication

Most endpoints require authentication via one of the following:

1. **Clerk JWT** (recommended): `Authorization: Bearer <clerk_jwt_token>`
2. **API Key**: `Authorization: Bearer <api_key>` (for server-to-server requests)

### Error Handling

All endpoints follow consistent error response format:

```json
{
  "error": "Error message",
  "message": "Detailed error description (development only)",
  "requestId": "optional-request-id"
}
```

### CORS

All endpoints support CORS with appropriate headers set.

---

## Core Endpoints

### Analytics

#### `GET /api/analytics`

Get analytics summary statistics.

**Authentication**: Not required (optional)

**Query Parameters**:
- `health=true` - Simple health check (no database required)

**Response** (with `health=true`):
```json
{
  "status": "ok",
  "timestamp": "2026-01-09T12:00:00.000Z",
  "environment": "production",
  "version": "1.0.0",
  "uptime": 12345.67
}
```

**Response** (without `health=true`):
```json
{
  "chatMessages": 150,
  "uploads": 75,
  "activeUsers": 42,
  "avgLatencyMs": null
}
```

**Error Responses**:
- `503 Service Unavailable` - Database not configured

---

#### `POST /api/analytics`

Record an analytics event.

**Authentication**: Not required (optional)

**Request Body**:
```json
{
  "event": "page_view",
  "metadata": {
    "page": "/dashboard",
    "userId": "user_123"
  },
  "clerkId": "user_clerk_id_optional"
}
```

**Response**:
```json
{
  "success": true
}
```

**Error Responses**:
- `400 Bad Request` - Missing `event` field
- `500 Internal Server Error` - Failed to record event

---

### Chat

#### `POST /api/chat`

AI chat conversation endpoint.

**Authentication**: Not required (but may require internal token if `INTERNAL_CHAT_TOKEN` is set)

**Configuration**:
- Route is internal-only unless `ALLOW_VERCEL_CHAT=true`
- Optional `INTERNAL_CHAT_TOKEN` for additional security
- Rate limited: 5 requests per 60 seconds per IP

**Request Body**:
```json
{
  "message": "Bonjour, comment puis-je vous aider?",
  "sessionId": "optional-session-id",
  "userEmail": "user@example.com",
  "maxTokens": 512
}
```

**Response**:
```json
{
  "success": true,
  "response": "Bonjour! Je suis WorkFlowAI...",
  "conversationId": "chat_1234567890_abc123"
}
```

**Error Responses**:
- `403 Forbidden` - Route disabled or origin not allowed
- `401 Unauthorized` - Invalid internal token
- `429 Too Many Requests` - Rate limit exceeded
- `400 Bad Request` - Missing message or message too long
- `503 Service Unavailable` - OpenAI API not configured
- `500 Internal Server Error` - AI service error

**Notes**:
- Maximum message length: 2000 characters (configurable via `MAX_MESSAGE_LENGTH`)
- Maximum tokens: 512 (configurable via `MAX_TOKENS`)
- Conversations are saved to MongoDB (best-effort)

---

### Files

#### `GET /api/files`

List uploaded files with optional pagination.

**Authentication**: Not required

**Query Parameters**:
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 50) - Items per page

**Response**:
```json
{
  "files": [
    {
      "id": "file_id_123",
      "name": "document.pdf",
      "path": "uploads/document.pdf",
      "size": 1024000,
      "mimeType": "application/pdf",
      "summary": "File summary (if available)",
      "createdAt": "2026-01-09T12:00:00.000Z"
    }
  ]
}
```

**Error Responses**:
- `500 Internal Server Error` - Database error

---

#### `POST /api/files`

Upload a file to MongoDB GridFS.

**Authentication**: Not required

**Request Body**:
```json
{
  "fileName": "document.pdf",
  "mimeType": "application/pdf",
  "base64": "base64-encoded-file-content",
  "size": 1024000,
  "includeSummary": false
}
```

**Response**:
```json
{
  "success": true,
  "path": "uploads/1234567890-abc123-document.pdf",
  "summary": "File summary (if includeSummary=true and no PII detected)"
}
```

**Error Responses**:
- `400 Bad Request` - Missing `fileName` or `base64`
- `500 Internal Server Error` - Upload failed

**Notes**:
- Maximum file size: 15MB (configurable via Vercel limits)
- Files are stored in MongoDB GridFS
- Text-like files are automatically embedded (vector search)
- PII detection prevents summary generation if sensitive data is found

---

### Forms

#### `POST /api/forms`

Submit contact form or demo request form.

**Authentication**: Not required (but requires Cloudflare Turnstile CAPTCHA)

**Rate Limiting**: 5 requests per 15 minutes per IP

**Request Body** (Contact Form):
```json
{
  "formType": "contact",
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Hello, I'm interested in your services.",
  "phone": "+33612345678",
  "company": "Example Corp",
  "captchaToken": "cloudflare-turnstile-token"
}
```

**Request Body** (Demo Form):
```json
{
  "formType": "demo",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "company": "Example Corp",
  "businessNeeds": "Need workflow automation for our team",
  "phone": "+33612345678",
  "jobTitle": "CTO",
  "companySize": "11-50",
  "industry": "Technology",
  "useCase": "Lead management",
  "timeline": "1-3 months",
  "message": "Additional details",
  "preferredDate": "2026-01-15T10:00:00Z",
  "captchaToken": "cloudflare-turnstile-token"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Message envoyé avec succès",
  "messageId": "contact_id_123",
  "emailSent": true,
  "emailId": "email_id_123",
  "requestId": "request_id_123"
}
```

**Error Responses**:
- `400 Bad Request` - Missing required fields or validation error
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

**Validation Rules**:

**Contact Form**:
- `name`: Required, string
- `email`: Required, valid email format
- `message`: Required, 10-5000 characters

**Demo Form**:
- `name`: Required, string
- `email`: Required, valid email format
- `company`: Required, string
- `businessNeeds`: Required, 10-5000 characters

---

### Vertex AI

#### `POST /api/vertex`

Vertex AI integration endpoint for chat and embeddings.

**Authentication**: Not required

**Query Parameters**:
- `action` (required) - Either `chat` or `embed`

**Request Body** (Chat):
```json
{
  "action": "chat",
  "messages": [
    { "role": "system", "content": "You are a helpful assistant." },
    { "role": "user", "content": "Hello!" }
  ],
  "sessionId": "optional-session-id",
  "temperature": 0.7
}
```

**Request Body** (Embed):
```json
{
  "action": "embed",
  "text": "Text to embed"
}
```

**Response** (Chat):
```json
{
  "message": "Hello! How can I help you?",
  "usage": {
    "promptTokens": 10,
    "completionTokens": 8,
    "totalTokens": 18
  },
  "sessionId": "optional-session-id"
}
```

**Response** (Embed):
```json
{
  "embedding": [0.123, -0.456, 0.789, ...]
}
```

**Error Responses**:
- `400 Bad Request` - Invalid action or missing required fields
- `500 Internal Server Error` - Vertex AI not configured or request failed

**Notes**:
- Requires `VERTEX_PROJECT_ID` environment variable
- Default location: `us-central1` (configurable via `VERTEX_LOCATION`)

---

### Vision

#### `POST /api/vision`

Image analysis using OpenAI GPT-4o Vision API.

**Authentication**: Not required

**Request Body**:
```json
{
  "imageUrl": "https://example.com/image.jpg"
}
```

**Response**:
```json
{
  "success": true,
  "response": "Image analysée: A detailed description of the image...",
  "caption": "Full analysis of the image including text extraction",
  "text": "Extracted text from image",
  "description": "Detailed description of the image"
}
```

**Error Responses**:
- `400 Bad Request` - Missing or invalid `imageUrl`
- `503 Service Unavailable` - OpenAI API not configured
- `500 Internal Server Error` - Vision API error

**Notes**:
- Requires `OPENAI_API_KEY` environment variable
- Uses GPT-4o model for vision analysis

---

## Application Endpoints

### API Keys

#### `GET /api/app/api-keys`

List all API keys for the authenticated user.

**Authentication**: Required (Clerk JWT)

**Response**:
```json
{
  "success": true,
  "keys": [
    {
      "id": "key_id_123",
      "key_prefix": "tc_live_abc123...",
      "name": "Production Server",
      "created_at": "2026-01-09T12:00:00.000Z",
      "revoked_at": null,
      "last_used_at": "2026-01-09T15:30:00.000Z"
    }
  ]
}
```

**Error Responses**:
- `401 Unauthorized` - Authentication required
- `503 Service Unavailable` - Database connection failed
- `500 Internal Server Error` - Database error

**Notes**:
- Only returns active (non-revoked) keys
- Never returns full keys, only prefixes

---

#### `POST /api/app/api-keys`

Create a new API key.

**Authentication**: Required (Clerk JWT)

**Request Body**:
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
  "key": "tc_live_full_api_key_here_64_chars",
  "key_prefix": "tc_live_abc123...",
  "created_at": "2026-01-09T12:00:00.000Z"
}
```

**Error Responses**:
- `401 Unauthorized` - Authentication required
- `400 Bad Request` - Invalid name (empty, too long, or invalid characters)
- `503 Service Unavailable` - Database connection failed
- `500 Internal Server Error` - Database error

**Validation Rules**:
- `name`: Optional, 1-100 characters, alphanumeric + spaces, hyphens, underscores only
- Full key is only returned once on creation

---

#### `DELETE /api/app/api-keys`

Revoke an API key.

**Authentication**: Required (Clerk JWT)

**Request Body**:
```json
{
  "keyId": "key_id_123"
}
```

**Response**:
```json
{
  "success": true,
  "message": "API key revoked"
}
```

**Error Responses**:
- `401 Unauthorized` - Authentication required
- `400 Bad Request` - Missing `keyId`
- `404 Not Found` - Key not found or access denied
- `500 Internal Server Error` - Database error

---

#### `POST /api/app/api-keys/[id]/restore`

Restore a recently revoked API key (within 10 seconds).

**Authentication**: Required (Clerk JWT)

**Path Parameters**:
- `id` - API key ID

**Response**:
```json
{
  "success": true,
  "message": "API key restored"
}
```

**Error Responses**:
- `401 Unauthorized` - Authentication required
- `400 Bad Request` - Key ID required, key not revoked, or restore window expired
- `404 Not Found` - Key not found or access denied
- `500 Internal Server Error` - Database error

**Notes**:
- Restore window: 10 seconds after revocation
- Only keys owned by the authenticated user can be restored

---

## Payment Endpoints

### Polar Checkout

#### `POST /api/polar/create-checkout-session`

Create a Polar checkout session.

**Authentication**: Optional (Clerk JWT for authenticated flow)

**Query Parameters**:
- `public=true` - Enable public checkout flow (no auth required)

**Request Body** (Authenticated):
```json
{
  "planName": "professional",
  "amount": 5000,
  "currency": "usd",
  "paymentType": "subscription"
}
```

**Request Body** (Public):
```json
{
  "planName": "enterprise",
  "amount": 216000,
  "currency": "usd",
  "paymentType": "one_time",
  "customerEmail": "customer@example.com"
}
```

**Headers** (Public checkout, if `PUBLIC_CHECKOUT_SECRET` is set):
- `X-Checkout-Token`: Token matching `PUBLIC_CHECKOUT_SECRET`

**Response**:
```json
{
  "success": true,
  "url": "https://polar.sh/checkout/session_123"
}
```

**Error Responses**:
- `401 Unauthorized` - Invalid checkout token (public flow)
- `400 Bad Request` - Missing required fields or amount below minimum
- `500 Internal Server Error` - Polar not configured or checkout creation failed

**Notes**:
- Public checkout requires minimum amount: 2160€ (216000 cents) by default
- Authenticated checkout links to Clerk user via `externalCustomerId`
- Public checkout supports manual onboarding without Clerk account

---

### Polar Webhook

#### `POST /api/polar/webhook`

Handle Polar payment webhook events.

**Authentication**: Webhook signature verification (via Polar SDK)

**Headers**:
- `polar-signature`: Webhook signature for verification

**Request Body**: Polar webhook event payload

**Response**:
```json
{
  "received": true,
  "eventType": "checkout.succeeded"
}
```

**Supported Events**:
- `checkout.succeeded` - Checkout completed
- `checkout.failed` - Checkout failed
- `subscription.created` - Subscription created
- `subscription.updated` - Subscription updated
- `subscription.canceled` - Subscription canceled

**Error Responses**:
- `403 Forbidden` - Invalid webhook signature
- `400 Bad Request` - Invalid webhook payload
- `500 Internal Server Error` - Webhook processing failed

**Notes**:
- Events are deduplicated (in-memory cache)
- Subscriptions are synced to MongoDB User collection
- Manual onboarding checkouts send admin notification emails

---

## Webhooks

### Clerk Webhook

#### `POST /api/webhooks/clerk`

Handle Clerk user lifecycle webhook events.

**Authentication**: Webhook signature verification (via Svix)

**Headers**:
- `svix-id`: Webhook ID
- `svix-timestamp`: Webhook timestamp
- `svix-signature`: Webhook signature

**Request Body**: Clerk webhook event payload

**Response**:
```json
{
  "received": true,
  "type": "user.created"
}
```

**Supported Events**:
- `user.created` - Create User document in MongoDB
- `user.updated` - Update User document in MongoDB
- `user.deleted` - Soft-delete User document (set `deletedAt`)

**Error Responses**:
- `403 Forbidden` - Invalid webhook signature
- `500 Internal Server Error` - Webhook processing failed

**Notes**:
- Users are synced to MongoDB User collection
- Soft delete preserves user records for audit purposes
- Default plan: `starter` for new users

---

## Error Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| 400 | Bad Request | Invalid input, missing required fields |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | Invalid webhook signature, origin not allowed |
| 404 | Not Found | Resource not found or access denied |
| 405 | Method Not Allowed | HTTP method not supported |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error, check logs |
| 503 | Service Unavailable | Database or external service not configured |

---

## Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/chat` | 5 requests | 60 seconds per IP |
| `/api/forms` | 5 requests | 15 minutes per IP |

---

## Related Documentation

- [Environment Variables](../development/environment-setup.md) - API configuration
- [Authentication](../security/authentication.md) - Authentication flows
- [Data Models](./data-models.md) - Database schemas

---

**Last Updated**: 2026-01-09
