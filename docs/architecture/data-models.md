# Database Schema Documentation

**Last Updated**: 2026-01-09
**Status**: Active

Complete MongoDB schema documentation for TCDynamics WorkFlowAI platform. All models use Mongoose ODM and are stored in MongoDB Atlas.

## Overview

The database uses MongoDB Atlas with Mongoose schemas defined in `api/_lib/models/`. All models use MongoDB ObjectIds as primary keys (`_id`) and include automatic timestamps (`createdAt`, `updatedAt`).

## Database Connection

- **Database**: MongoDB Atlas
- **Connection**: Serverless singleton in `api/_lib/mongodb.js`
- **Multi-tenancy**: Models linked via `clerkId` (Clerk user ID)

---

## Models

### User

User accounts synced from Clerk authentication service.

**Collection**: `users`

**Schema**:

```javascript
{
  clerkId: String (required, unique, indexed)
  email: String (required, lowercase, trimmed, indexed)
  plan: String (enum: ['starter', 'professional', 'enterprise'], default: 'starter', indexed)
  subscriptionStatus: String (enum: ['active', 'canceled', 'past_due', 'trialing', null], default: null)
  polarCustomerId: String (default: null)
  polarSubscriptionId: String (default: null)
  firstName: String (default: null)
  lastName: String (default: null)
  imageUrl: String (default: null)
  deletedAt: Date (default: null) // Soft delete
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

**Indexes**:

- `{ clerkId: 1 }` (unique)
- `{ email: 1 }`
- `{ subscriptionStatus: 1, plan: 1 }` (compound)

**Relationships**:

- One-to-many: `ApiKey` (via `clerkId`)
- One-to-many: `ChatConversation` (via `clerkId`)
- One-to-many: `KnowledgeFile` (via `clerkId`)
- One-to-many: `AnalyticsEvent` (via `clerkId`)
- One-to-many: `UsageLog` (via `clerkId`)
- One-to-many: `Contact` (via `clerkId`, optional)
- One-to-many: `DemoRequest` (via `clerkId`, optional)
- One-to-many: `Feedback` (via `clerkId`, optional)

**Usage Patterns**:

- Created automatically via Clerk webhook (`user.created` event)
- Updated via Clerk webhook (`user.updated` event)
- Soft-deleted via Clerk webhook (`user.deleted` event)
- Subscription status synced via Polar webhook

**Example Document**:

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "clerkId": "user_2abc123def456",
  "email": "user@example.com",
  "plan": "professional",
  "subscriptionStatus": "active",
  "polarCustomerId": "cust_xyz789",
  "polarSubscriptionId": "sub_abc123",
  "firstName": "John",
  "lastName": "Doe",
  "imageUrl": "https://img.clerk.com/...",
  "deletedAt": null,
  "createdAt": "2026-01-09T12:00:00.000Z",
  "updatedAt": "2026-01-09T15:30:00.000Z"
}
```

---

### Contact

Contact form submissions from the website.

**Collection**: `contacts`

**Schema**:

```javascript
{
  name: String (required, maxlength: 100, trimmed)
  email: String (required, unique, lowercase, trimmed, indexed, match: email regex, maxlength: 254)
  phone: String (default: null)
  company: String (default: null)
  message: String (required)
  source: String (default: 'website')
  status: String (enum: ['new', 'contacted', 'qualified', 'closed'], default: 'new')
  type: String (default: 'contact')
  clerkId: String (default: null, sparse index) // Optional: link to authenticated user
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

**Indexes**:

- `{ email: 1 }` (unique, case-insensitive, French locale collation)
- `{ status: 1 }`
- `{ createdAt: -1 }`
- `{ status: 1, createdAt: -1 }` (compound)
- `{ clerkId: 1 }` (sparse)

**Relationships**:

- Many-to-one: `User` (via `clerkId`, optional)

**Usage Patterns**:

- Created via `/api/forms` endpoint (contact form)
- Email validation and duplicate detection
- Case-insensitive unique email constraint (handles duplicate errors gracefully)

**Example Document**:

```json
{
  "_id": "507f1f77bcf86cd799439012",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+33612345678",
  "company": "Example Corp",
  "message": "Interested in your services",
  "source": "website",
  "status": "new",
  "type": "contact",
  "clerkId": null,
  "createdAt": "2026-01-09T12:00:00.000Z",
  "updatedAt": "2026-01-09T12:00:00.000Z"
}
```

---

### DemoRequest

Demo request form submissions.

**Collection**: `demorequests`

**Schema**:

```javascript
{
  name: String (required)
  email: String (required, lowercase, trimmed, indexed, match: email regex)
  company: String (required)
  phone: String (default: null)
  jobTitle: String (default: null)
  companySize: String (default: null)
  industry: String (default: null)
  businessNeeds: String (required)
  useCase: String (default: null)
  timeline: String (default: null)
  message: String (default: null)
  preferredDate: Date (default: null)
  status: String (enum: ['pending', 'scheduled', 'completed', 'canceled'], default: 'pending')
  type: String (default: 'demo_request')
  clerkId: String (default: null) // Optional: link to authenticated user
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

**Indexes**:

- `{ email: 1 }`
- `{ status: 1 }`
- `{ company: 1 }`
- `{ createdAt: -1 }`

**Relationships**:

- Many-to-one: `User` (via `clerkId`, optional)

**Usage Patterns**:

- Created via `/api/forms` endpoint (demo form)
- Status updated manually or via automation

**Example Document**:

```json
{
  "_id": "507f1f77bcf86cd799439013",
  "name": "Bob Smith",
  "email": "bob@example.com",
  "company": "Tech Startup",
  "phone": "+33698765432",
  "jobTitle": "CTO",
  "companySize": "11-50",
  "industry": "Technology",
  "businessNeeds": "Need workflow automation",
  "useCase": "Lead management",
  "timeline": "1-3 months",
  "message": "Looking forward to the demo",
  "preferredDate": "2026-01-15T10:00:00.000Z",
  "status": "pending",
  "type": "demo_request",
  "clerkId": null,
  "createdAt": "2026-01-09T12:00:00.000Z",
  "updatedAt": "2026-01-09T12:00:00.000Z"
}
```

---

### ApiKey

API keys for tenant authentication (server-to-server).

**Collection**: `apikeys`

**Schema**:

```javascript
{
  clerkId: String (required, indexed)
  keyHash: String (required, unique) // bcrypt hash of full key
  keyPrefix: String (required, indexed) // First 20 chars for display (e.g., "tc_live_abc123...")
  name: String (default: null) // Optional human-readable name (1-100 chars)
  revokedAt: Date (default: null) // Soft revoke timestamp
  lastUsedAt: Date (default: null)
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

**Indexes**:

- `{ clerkId: 1 }`
- `{ keyHash: 1 }` (unique)
- `{ keyPrefix: 1 }`
- `{ clerkId: 1, revokedAt: 1 }` (compound)
- `{ revokedAt: 1, clerkId: 1 }` (compound)
- `{ revokedAt: 1, keyPrefix: 1 }` (compound)

**Relationships**:

- Many-to-one: `User` (via `clerkId`)

**Usage Patterns**:

- Created via `/api/app/api-keys` POST endpoint
- Listed via `/api/app/api-keys` GET endpoint (prefixes only)
- Revoked via `/api/app/api-keys` DELETE endpoint
- Restored via `/api/app/api-keys?action=restore&keyId=<id>` POST endpoint (within 10 seconds)
- Full key only returned once on creation
- Verification via bcrypt comparison against `keyHash`

**Example Document**:

```json
{
  "_id": "507f1f77bcf86cd799439014",
  "clerkId": "user_2abc123def456",
  "keyHash": "$2a$10$hashed_key_here...",
  "keyPrefix": "tc_live_abc123...",
  "name": "Production Server",
  "revokedAt": null,
  "lastUsedAt": "2026-01-09T15:30:00.000Z",
  "createdAt": "2026-01-09T10:00:00.000Z",
  "updatedAt": "2026-01-09T15:30:00.000Z"
}
```

---

### ChatConversation

Chat conversation logs with embedded messages.

**Collection**: `chatconversations`

**Schema**:

```javascript
{
  sessionId: String (required, indexed)
  conversationId: String (default: null)
  userEmail: String (default: null)
  clerkId: String (default: null, indexed)
  messages: [{
    role: String (enum: ['user', 'assistant'], required)
    content: String (required)
    timestamp: Date (default: Date.now)
  }]
  messageCount: Number (default: 0) // Denormalized count
  metadata: Object (default: {}) // Model info, tokens, etc.
  conversationStatus: String (enum: ['active', 'archived', 'deleted'], default: 'active')
  type: String (default: 'chat')
  lastMessageAt: Date (default: Date.now, indexed)
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

**Indexes**:

- `{ sessionId: 1 }`
- `{ clerkId: 1 }`
- `{ clerkId: 1, conversationStatus: 1 }` (compound)
- `{ lastMessageAt: -1 }`

**Relationships**:

- Many-to-one: `User` (via `clerkId`, optional)

**Usage Patterns**:

- Created via `/api/ai?provider=openai&action=chat` endpoint
- Messages appended to `messages` array
- `messageCount` and `lastMessageAt` updated automatically via pre-save middleware

**Example Document**:

```json
{
  "_id": "507f1f77bcf86cd799439015",
  "sessionId": "chat_1234567890_abc123",
  "conversationId": "conv_xyz789",
  "userEmail": "user@example.com",
  "clerkId": "user_2abc123def456",
  "messages": [
    {
      "role": "user",
      "content": "Hello!",
      "timestamp": "2026-01-09T12:00:00.000Z"
    },
    {
      "role": "assistant",
      "content": "Hello! How can I help you?",
      "timestamp": "2026-01-09T12:00:15.000Z"
    }
  ],
  "messageCount": 2,
  "metadata": {
    "model": "gpt-3.5-turbo",
    "tokens_used": 25,
    "source": "vercel-chat"
  },
  "conversationStatus": "active",
  "type": "chat",
  "lastMessageAt": "2026-01-09T12:00:15.000Z",
  "createdAt": "2026-01-09T12:00:00.000Z",
  "updatedAt": "2026-01-09T12:00:15.000Z"
}
```

---

### KnowledgeFile

File metadata with reference to GridFS storage.

**Collection**: `knowledgefiles`

**Schema**:

```javascript
{
  path: String (required, unique, indexed)
  name: String (required)
  size: Number (default: 0)
  mimeType: String (default: 'application/octet-stream')
  summary: String (default: null) // Text summary (PII filtered)
  embedding: [Number] (default: []) // Vector embedding for semantic search
  storageProvider: String (enum: ['mongodb_gridfs', 's3', 'cloudflare_r2'], default: 'mongodb_gridfs')
  storagePath: String (default: null) // GridFS file ID or storage path
  clerkId: String (default: null, indexed) // Optional: link to user
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

**Indexes**:

- `{ path: 1 }` (unique)
- `{ clerkId: 1 }`
- `{ createdAt: -1 }`

**Relationships**:

- Many-to-one: `User` (via `clerkId`, optional)
- Storage: GridFS bucket named `files`

**Usage Patterns**:

- Created via `/api/files` POST endpoint
- Files stored in MongoDB GridFS
- Text-like files automatically embedded (vector search)
- PII detection prevents summary generation if sensitive data found

**Example Document**:

```json
{
  "_id": "507f1f77bcf86cd799439016",
  "path": "uploads/1234567890-abc123-document.pdf",
  "name": "1234567890-abc123-document.pdf",
  "size": 1024000,
  "mimeType": "application/pdf",
  "summary": "A business document about workflow automation...",
  "embedding": [0.123, -0.456, 0.789, ...],
  "storageProvider": "mongodb_gridfs",
  "storagePath": "507f1f77bcf86cd799439017",
  "clerkId": "user_2abc123def456",
  "createdAt": "2026-01-09T12:00:00.000Z",
  "updatedAt": "2026-01-09T12:00:00.000Z"
}
```

---

### AnalyticsEvent

Custom analytics events.

**Collection**: `analyticevents`

**Schema**:

```javascript
{
  event: String (required, indexed)
  metadata: Object (default: {})
  clerkId: String (default: null, indexed) // Optional: link to user
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

**Indexes**:

- `{ event: 1 }`
- `{ clerkId: 1 }`
- `{ clerkId: 1, event: 1 }` (compound)
- `{ createdAt: -1 }`

**Relationships**:

- Many-to-one: `User` (via `clerkId`, optional)

**Usage Patterns**:

- Created via `/api/analytics` POST endpoint
- Used for custom event tracking

**Example Document**:

```json
{
  "_id": "507f1f77bcf86cd799439018",
  "event": "page_view",
  "metadata": {
    "page": "/dashboard",
    "userId": "user_123"
  },
  "clerkId": "user_2abc123def456",
  "createdAt": "2026-01-09T12:00:00.000Z",
  "updatedAt": "2026-01-09T12:00:00.000Z"
}
```

---

### UsageLog

API activity tracking for analytics and billing.

**Collection**: `usagelogs`

**Schema**:

```javascript
{
  clerkId: String (required, indexed)
  endpoint: String (required, indexed)
  method: String (enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], required)
  status: Number (required, indexed) // HTTP status code
  responseTimeMs: Number (default: null)
  userAgent: String (default: null)
  ip: String (default: null)
  metadata: Object (default: {})
  createdAt: Date (auto) // Request timestamp
  updatedAt: Date (auto)
}
```

**Indexes**:

- `{ clerkId: 1, createdAt: -1 }` (compound)
- `{ endpoint: 1, status: 1 }` (compound)
- `{ createdAt: 1 }` (TTL: 90 days)

**Relationships**:

- Many-to-one: `User` (via `clerkId`)

**Usage Patterns**:

- Created automatically on API requests (if enabled)
- Auto-deleted after 90 days (TTL index)
- Used for analytics and billing calculations

**Example Document**:

```json
{
  "_id": "507f1f77bcf86cd799439019",
  "clerkId": "user_2abc123def456",
  "endpoint": "/api/ai?provider=vertex&action=chat",
  "method": "POST",
  "status": 200,
  "responseTimeMs": 1250,
  "userAgent": "Mozilla/5.0...",
  "ip": "192.168.1.1",
  "metadata": {
    "action": "chat",
    "tokens_used": 150
  },
  "createdAt": "2026-01-09T12:00:00.000Z",
  "updatedAt": "2026-01-09T12:00:00.000Z"
}
```

---

### Feedback

Customer feedback from demo and contact forms.

**Collection**: `feedbacks`

**Schema**:

```javascript
{
  formType: String (enum: ['demo', 'contact'], required, indexed)
  rating: Number (required, min: 1, max: 5)
  feedbackText: String (trimmed, maxlength: 2000)
  userEmail: String (trimmed, lowercase)
  userCompany: String (trimmed)
  allowFollowup: Boolean (default: false)
  clerkId: String (sparse) // Optional: link to user
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

**Indexes**:

- `{ createdAt: -1 }`
- `{ formType: 1, createdAt: -1 }` (compound)

**Relationships**:

- Many-to-one: `User` (via `clerkId`, optional)

**Usage Patterns**:

- Created via feedback forms
- Used for customer satisfaction tracking

**Example Document**:

```json
{
  "_id": "507f1f77bcf86cd799439020",
  "formType": "demo",
  "rating": 5,
  "feedbackText": "Great demo, very helpful!",
  "userEmail": "user@example.com",
  "userCompany": "Example Corp",
  "allowFollowup": true,
  "clerkId": "user_2abc123def456",
  "createdAt": "2026-01-09T12:00:00.000Z",
  "updatedAt": "2026-01-09T12:00:00.000Z"
}
```

---

### PolarEvent

Polar webhook events for idempotency and auditing.

**Collection**: `polarevents`

**Schema**:

```javascript
{
  eventId: String(required, unique, indexed)
  type: String(required, indexed) // Event type (e.g., 'checkout.succeeded')
  payload: Object(required) // Full webhook payload
  createdAt: Date(auto)
  updatedAt: Date(auto)
}
```

**Indexes**:

- `{ eventId: 1 }` (unique)

**Relationships**: None (standalone event log)

**Usage Patterns**:

- Created via `/api/polar/webhook` endpoint
- Used for idempotency (prevent duplicate processing)
- Full event payload stored for auditing

**Example Document**:

```json
{
  "_id": "507f1f77bcf86cd799439021",
  "eventId": "evt_polar_abc123def456",
  "type": "checkout.succeeded",
  "payload": {
    "id": "checkout_xyz789",
    "customer": {
      "email": "customer@example.com",
      "external_id": "user_2abc123def456"
    },
    "amount": 5000,
    "status": "completed"
  },
  "createdAt": "2026-01-09T12:00:00.000Z",
  "updatedAt": "2026-01-09T12:00:00.000Z"
}
```

---

## Relationships Diagram

```
User (1) ──┬── (many) ApiKey
           ├── (many) ChatConversation
           ├── (many) KnowledgeFile
           ├── (many) AnalyticsEvent
           ├── (many) UsageLog
           ├── (many) Contact (optional)
           ├── (many) DemoRequest (optional)
           └── (many) Feedback (optional)

PolarEvent (standalone, no relationships)
```

---

## Indexes Summary

### Compound Indexes

- `User`: `{ subscriptionStatus: 1, plan: 1 }`
- `Contact`: `{ status: 1, createdAt: -1 }`
- `ApiKey`: `{ clerkId: 1, revokedAt: 1 }`, `{ revokedAt: 1, keyPrefix: 1 }`
- `ChatConversation`: `{ clerkId: 1, conversationStatus: 1 }`
- `AnalyticsEvent`: `{ clerkId: 1, event: 1 }`
- `UsageLog`: `{ clerkId: 1, createdAt: -1 }`, `{ endpoint: 1, status: 1 }`
- `Feedback`: `{ formType: 1, createdAt: -1 }`

### TTL Indexes

- `UsageLog`: `{ createdAt: 1 }` (expireAfterSeconds: 7776000 = 90 days)

### Unique Indexes

- `User`: `{ clerkId: 1 }`
- `Contact`: `{ email: 1 }` (case-insensitive, French locale)
- `ApiKey`: `{ keyHash: 1 }`
- `KnowledgeFile`: `{ path: 1 }`
- `PolarEvent`: `{ eventId: 1 }`

---

## Multi-Tenancy

All models support multi-tenancy via `clerkId` (Clerk user ID):

- **Required**: `User`, `ApiKey`, `UsageLog`
- **Optional**: `Contact`, `DemoRequest`, `ChatConversation`, `KnowledgeFile`, `AnalyticsEvent`, `Feedback`

Models with optional `clerkId` support both authenticated and anonymous usage.

---

## Data Access Patterns

### Common Queries

**Get all API keys for a user**:

```javascript
ApiKey.find({ clerkId, revokedAt: null })
```

**Get user's conversations**:

```javascript
ChatConversation.find({ clerkId, conversationStatus: 'active' })
```

**Get contacts by status**:

```javascript
Contact.find({ status: 'new' }).sort({ createdAt: -1 })
```

**Get user's subscription info**:

```javascript
User.findOne({ clerkId })
```

**Check if API key is valid**:

```javascript
ApiKey.findOne({ keyPrefix: prefix, revokedAt: null }).then(key =>
  bcrypt.compare(fullKey, key.keyHash)
)
```

---

## Related Documentation

- [API Endpoints](./api-endpoints.md) - API usage patterns
- [Authentication](../security/authentication.md) - User and API key authentication
- [Environment Setup](../development/environment-setup.md) - MongoDB connection configuration

---

**Last Updated**: 2026-01-09
