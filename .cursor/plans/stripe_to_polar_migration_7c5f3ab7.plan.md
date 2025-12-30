---
name: Stripe to Polar Migration
overview: Migrate TCDynamics payment system from Stripe to Polar.sh, replacing checkout sessions, webhooks, and database schema while maintaining org_id linkage through Polar's external_customer_id field.
todos:
  - id: install-polar-sdk
    content: Install @polar-sh/sdk and @polar-sh/express in api/package.json dependencies
    status: pending
  - id: update-env-template
    content: Update env.production.template with POLAR_ACCESS_TOKEN, POLAR_WEBHOOK_SECRET, POLAR_SERVER, and POLAR_PRODUCT_* vars
    status: pending
  - id: create-polar-checkout-endpoint
    content: Create api/polar/create-checkout-session.js with Polar SDK, externalCustomerId, and checkout_id URL parameter
    status: pending
  - id: create-polar-webhook-handler
    content: Create api/polar/webhook.js using @polar-sh/express Webhooks helper with typed event handlers
    status: pending
  - id: create-polar-session-retrieval
    content: Create api/polar/checkout/[checkoutId].js for retrieving checkout session details
    status: pending
  - id: database-migration-script
    content: Create database migration script to add polar_* columns to orgs table and create polar_events table
    status: pending
  - id: update-schema-sql
    content: Update supabase-schema-enhanced.sql with polar_customer_id, polar_subscription_id columns, and polar_events table
    status: pending
  - id: create-polar-utils
    content: Create apps/frontend/src/utils/polar.ts replacing stripe.ts with Polar Product IDs and checkout_id handling
    status: pending
  - id: update-checkout-success-page
    content: Update apps/frontend/src/pages/CheckoutSuccess.tsx to use checkout_id parameter instead of session_id
    status: pending
  - id: add-frontend-env-vars
    content: Add frontend environment variables (VITE_POLAR_PRODUCT_STARTER, VITE_POLAR_PRODUCT_PROFESSIONAL, VITE_POLAR_PRODUCT_ENTERPRISE)
    status: pending
  - id: setup-polar-dashboard
    content: Create products in Polar dashboard and configure webhook endpoint
    status: pending
  - id: test-sandbox-integration
    content: Test sandbox integration with complete checkout flow and webhook delivery
    status: pending
  - id: deploy-parallel-operation
    content: Deploy Polar endpoints alongside Stripe, monitor both systems, gradually migrate traffic
    status: pending
  - id: stripe-cleanup
    content: Remove Stripe API endpoints, dependencies, and clean up environment variables
    status: pending
  - id: final-schema-cleanup
    content: Drop old stripe_* columns from orgs table after successful migration
    status: pending
---

# Stripe to Polar Migration Implementation Plan

## Overview

This plan migrates TCDynamics from Stripe to Polar.sh, a Merchant of Record (MoR) platform. The migration maintains existing functionality while replacing Stripe-specific implementations with Polar equivalents.

**✅ Research Verified via NIA Oracle:** All technical details validated against:

- Polar documentation (docs.polar.sh) - indexed and searched
- Polar API changelog (2025 updates: Feb, Mar 14, Mar 25, Jun 18)
- SDK adapter documentation (`@polar-sh/express`, `@polar-sh/sdk`)
- Customer and Subscription object schemas

---

## Critical Considerations

> [!IMPORTANT]

> **Polar is a Merchant of Record (MoR)**: Polar handles tax compliance, invoicing, and payment processing. This simplifies your setup but changes operational responsibilities.

> [!WARNING]

> **2025 API Deprecations** (NIA-verified):

>

> - `customer_external_id` → `external_customer_id` (June 18, 2025)

> - `product_id` in Checkout → use `products` array (Feb 2025)

> - `Subscription.price_id` and `Subscription.price` → use `Subscription.prices` array (Mar 14, 2025)

> - `checkout.subtotal_amount` → use `checkout.net_amount` (Mar 25, 2025)

> [!CAUTION]

> **Customer external_id is IMMUTABLE**: Once set, the `external_id` on a Customer cannot be changed. It must be unique across your organization.

> [!TIP]

> **Subscription Metadata Supported**: Polar subscriptions CAN store metadata (up to 50 key-value pairs). Keys: max 40 chars, Values: strings (max 500 chars), integers, floats, or booleans. Metadata set on checkout flows to the resulting order/subscription.

---

## API Environment URLs (NIA-Verified)

| Environment | Dashboard | API Base |

| -------------- | -------------------------- | --------------------------------- |

| **Sandbox** | `https://sandbox.polar.sh` | `https://sandbox-api.polar.sh/v1` |

| **Production** | `https://polar.sh` | `https://api.polar.sh/v1` |

> [!NOTE]

> **Sandbox Limitation**: Subscriptions are automatically canceled 90 days after creation in sandbox. Access tokens are completely isolated between environments.

---

## Object Schemas (NIA-Verified)

### Customer Object

| Field | Type | Description |

| ----------------- | --------- | ----------------------------------------------------- |

| `id` | string | Polar internal ID |

| `email` | string | Customer email |

| `name` | string | Customer name |

| `external_id` | string | **Your org_id** - unique, immutable |

| `created_at` | timestamp | Creation timestamp |

| `metadata` | object | Custom key-value pairs (strings, ints, bools, floats) |

| `billing_address` | object | Billing address info |

### Subscription Object

| Field | Type | Description |

| ---------------------- | --------- | -------------------------------------------------------------------- |

| `id` | string | Subscription ID |

| `customer_id` | string | Reference to Customer |

| `product_id` | string | ⚠️ Deprecated - use `prices` array |

| `status` | string | `incomplete`, `trialing`, `active`, `past_due`, `canceled`, `unpaid` |

| `started_at` | timestamp | When subscription started |

| `current_period_start` | timestamp | Current billing period start |

| `current_period_end` | timestamp | Current billing period end |

| `ended_at` | timestamp | When subscription ended (if applicable) |

| `cancel_at_period_end` | boolean | If true, will cancel at period end but stays active |

| `prices` | array | Price objects (replaces `price_id`) |

| `metadata` | object | Custom key-value pairs (up to 50) |

---

## Architecture Comparison

### Current Stripe vs Target Polar

| Component | Stripe | Polar |

| ------------------------- | ----------------------------------------- | ----------------------------------------------- |

| **Checkout** | `client_reference_id` + `metadata.org_id` | `externalCustomerId` only |

| **Webhook Verification** | `stripe.webhooks.constructEvent()` | `validateEvent()` from `@polar-sh/sdk/webhooks` |

| **Session ID** | `session_id` query param | `checkout_id` query param |

| **Price/Product IDs** | Stripe Price IDs | Polar Product IDs (UUIDs) |

| **Subscription Metadata** | Supported | ✅ Supported (flows from checkout metadata) |

| **Amount Field** | `amount_total` | `net_amount` (not `subtotal_amount`) |

---

## Implementation Steps

### Phase 1: Dependencies and Configuration

#### 1.1 Install Polar SDK

```bash
cd api
npm install @polar-sh/sdk @polar-sh/express zod
```

#### 1.2 Environment Variables

**Backend (`env.production.template`):**

```bash
# Polar Configuration (NIA-verified)
POLAR_ACCESS_TOKEN=           # Dashboard → Settings → Developers → Create Token
POLAR_WEBHOOK_SECRET=         # Dashboard → Settings → Webhooks → Show secret
POLAR_SERVER=production       # 'sandbox' for testing, 'production' for live

# Polar Product IDs (UUIDs from dashboard)
POLAR_PRODUCT_STARTER=        # Starter plan product ID
POLAR_PRODUCT_PROFESSIONAL=   # Professional plan product ID
POLAR_PRODUCT_ENTERPRISE=     # Enterprise plan product ID (optional)

# Alerts
POLAR_ALERT_EMAIL=${STRIPE_ALERT_EMAIL}
```

**Frontend (Vercel):**

```bash
VITE_POLAR_PRODUCT_STARTER=
VITE_POLAR_PRODUCT_PROFESSIONAL=
VITE_POLAR_PRODUCT_ENTERPRISE=
```

#### 1.3 Polar Dashboard Setup

1.  **Sandbox First**: Create account at `https://sandbox.polar.sh`

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Separate from production (tokens not interchangeable!)

2.  **Create Products**: Starter (29€/mo), Professional (79€/mo)
3.  **Configure Webhook**: `https://your-domain.com/api/polar/webhook`

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Events: `checkout.updated`, `subscription.*`, `order.paid`, `customer.state_changed`

4.  **Generate Tokens**: Access token + Webhook secret

---

### Phase 2: API Endpoints Migration

#### 2.1 Create Polar Checkout Endpoint

**File:** `api/polar/create-checkout-session.js`

```javascript
import { Polar } from '@polar-sh/sdk'
import { verifySupabaseAuth } from '../_lib/auth.js'

// Product ID mapping (NIA-verified: use products array, not product_id)
const POLAR_PRODUCTS = {
  starter: process.env.POLAR_PRODUCT_STARTER,
  professional: process.env.POLAR_PRODUCT_PROFESSIONAL,
  enterprise: process.env.POLAR_PRODUCT_ENTERPRISE,
}

const polar = process.env.POLAR_ACCESS_TOKEN
  ? new Polar({
      accessToken: process.env.POLAR_ACCESS_TOKEN,
      server: process.env.POLAR_SERVER || 'production',
    })
  : null

const allowCors = fn => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()
  return await fn(req, res)
}

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res
      .status(405)
      .json({ success: false, message: 'Method not allowed' })
  }

  try {
    if (!polar) {
      return res.status(500).json({
        success: false,
        message: 'Payment service not configured',
        error: 'POLAR_NOT_CONFIGURED',
      })
    }

    const authHeader = req.headers.authorization
    const { userId: orgId, error: authError } =
      await verifySupabaseAuth(authHeader)

    if (authError || !orgId) {
      return res
        .status(401)
        .json({ success: false, message: 'Authentication required' })
    }

    const { planName } = req.body

    if (!planName || !POLAR_PRODUCTS[planName]) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid plan name' })
    }

    const productId = POLAR_PRODUCTS[planName]
    const frontendUrl =
      process.env.VITE_FRONTEND_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:5173')

    // NIA-verified: Use 'products' array (not deprecated product_id)
    // NIA-verified: Use 'externalCustomerId' (renamed from customer_external_id June 2025)
    // NIA-verified: Metadata flows from checkout → order/subscription
    const checkout = await polar.checkouts.create({
      products: [productId],
      externalCustomerId: orgId, // Links to org, becomes customer.external_id
      successUrl: `${frontendUrl}/checkout-success?checkout_id={CHECKOUT_ID}`,
      metadata: {
        plan_name: planName, // Stored in resulting subscription for easy access
        org_id: orgId,
        created_via: 'api',
      },
    })

    console.log('✅ Polar checkout created:', {
      checkoutId: checkout.id,
      planName,
    })

    return res.status(200).json({
      success: true,
      checkoutId: checkout.id,
      url: checkout.url,
    })
  } catch (error) {
    console.error('❌ Error creating Polar checkout:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to create checkout',
      error: error.message,
    })
  }
}

export default allowCors(handler)
```

#### 2.2 Create Polar Webhook Handler

**File:** `api/polar/webhook.js`

```javascript
import { validateEvent, WebhookVerificationError } from '@polar-sh/sdk/webhooks'
import { getResendClient } from '../_lib/email.js'
import { savePolarEvent, getSupabaseClient } from '../_lib/supabase.js'

// Reverse mapping: product_id → plan name
const PRODUCT_TO_PLAN = {
  [process.env.POLAR_PRODUCT_STARTER]: 'starter',
  [process.env.POLAR_PRODUCT_PROFESSIONAL]: 'professional',
  [process.env.POLAR_PRODUCT_ENTERPRISE]: 'enterprise',
}

// In-memory dedupe cache
const processedEvents = new Map()
const EVENT_CACHE_MAX = 1000
const EVENT_CACHE_TTL_MS = 15 * 60 * 1000

function pruneCache() {
  const now = Date.now()
  for (const [id, ts] of processedEvents) {
    if (now - ts > EVENT_CACHE_TTL_MS) processedEvents.delete(id)
  }
  while (processedEvents.size > EVENT_CACHE_MAX) {
    const oldest = processedEvents.keys().next().value
    processedEvents.delete(oldest)
  }
}

/**
 * NIA-verified: Read raw body as Buffer for signature verification
 * This is REQUIRED for Vercel serverless functions
 */
async function getRawBody(req) {
  if (req.body && typeof req.body === 'string') {
    return Buffer.from(req.body, 'utf8')
  }
  if (Buffer.isBuffer(req.body)) {
    return req.body
  }

  // Collect chunks as Buffers
  const chunks = []
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }
  return Buffer.concat(chunks)
}

/**
 * Sync subscription to orgs table
 * NIA-verified: customer.external_id contains our org_id
 */
async function syncSubscriptionToOrg(subscription, eventType) {
  const supabase = getSupabaseClient()

  // NIA-verified: external_id is immutable and unique per organization
  const orgId = subscription.customer?.external_id

  if (!orgId) {
    console.warn('No external_id in customer', {
      subscriptionId: subscription.id,
      eventType,
    })
    return { success: false, error: 'Missing customer external_id' }
  }

  // NIA-verified: Metadata flows from checkout → subscription
  // Primary: Use plan_name from metadata (set during checkout creation)
  // Fallback: Map product_id to plan name
  const metadataPlan = subscription.metadata?.plan_name
  const productId =
    subscription.product_id || subscription.prices?.[0]?.product_id
  const plan = metadataPlan || PRODUCT_TO_PLAN[productId] || 'starter'

  // NIA-verified status mapping:
  // - cancel_at_period_end: true + status: active = still active until period ends (customer can uncancel)
  // - status: canceled = period ended OR immediate revocation happened
  // Note: 'revoked' is a webhook EVENT, not a status. The final status is 'canceled'.
  const subscriptionStatus = subscription.status // Use directly - Polar uses correct statuses

  try {
    const { error } = await supabase.from('orgs').upsert(
      {
        id: orgId,
        plan,
        subscription_status: subscriptionStatus,
        polar_customer_id: subscription.customer?.id,
        polar_subscription_id: subscription.id,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    )

    if (error) {
      console.error('Failed to sync subscription', error)
      return { success: false, error: error.message }
    }

    console.log('✅ Synced subscription to org', {
      orgId,
      status: subscriptionStatus,
      plan,
    })
    return { success: true }
  } catch (err) {
    console.error('Exception syncing subscription', err)
    return { success: false, error: err.message }
  }
}

async function sendPolarEmail(subject, body) {
  try {
    const toEmail = process.env.POLAR_ALERT_EMAIL || process.env.CONTACT_EMAIL
    if (!toEmail) return
    const resend = getResendClient()
    await resend.emails.send({
      from: 'TCDynamics <contact@tcdynamics.fr>',
      to: [toEmail],
      subject,
      text: body,
    })
  } catch (err) {
    console.warn('Polar email notification failed', err)
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const webhookSecret = process.env.POLAR_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('POLAR_WEBHOOK_SECRET not configured')
    return res.status(500).json({ error: 'Webhook secret not configured' })
  }

  let event
  try {
    // NIA-verified: Must use raw body Buffer for signature verification
    const body = await getRawBody(req)

    // NIA-verified: Use validateEvent from @polar-sh/sdk/webhooks
    event = validateEvent(body, req.headers, webhookSecret)
  } catch (err) {
    if (err instanceof WebhookVerificationError) {
      console.error('Webhook signature verification failed:', err.message)
      return res.status(403).json({ error: 'Invalid signature' })
    }
    console.error('Webhook processing error:', err)
    return res.status(400).json({ error: err.message })
  }

  // Idempotency check
  pruneCache()
  if (processedEvents.has(event.id)) {
    return res
      .status(200)
      .json({ received: true, type: event.type, replay: true })
  }

  // Persist to database
  try {
    const result = await savePolarEvent(event)
    if (result?.duplicate) {
      return res
        .status(200)
        .json({ received: true, type: event.type, replay: true })
    }
  } catch (err) {
    console.warn('Event persistence failed', err)
  }

  processedEvents.set(event.id, Date.now())
  console.log(`Received Polar webhook: ${event.type}`)

  try {
    switch (event.type) {
      // NIA-verified: checkout.updated fires when status changes to 'succeeded'
      case 'checkout.updated': {
        const checkout = event.data
        if (checkout.status === 'succeeded' && checkout.subscription) {
          await syncSubscriptionToOrg(checkout.subscription, event.type)
        }
        await sendPolarEmail(
          'Checkout updated',
          `Checkout ${checkout.id} status: ${checkout.status}`
        )
        break
      }

      case 'subscription.created': {
        await syncSubscriptionToOrg(event.data, event.type)
        await sendPolarEmail(
          'Subscription created',
          `Subscription ${event.data.id}`
        )
        break
      }

      // NIA-verified: subscription.updated is catch-all for cancellations, un-cancellations
      case 'subscription.updated': {
        await syncSubscriptionToOrg(event.data, event.type)
        await sendPolarEmail(
          'Subscription updated',
          `Status: ${event.data.status}`
        )
        break
      }

      case 'subscription.revoked': {
        const subscription = event.data
        const orgId = subscription.customer?.external_id
        if (orgId) {
          const supabase = getSupabaseClient()
          await supabase
            .from('orgs')
            .update({
              subscription_status: 'canceled',
              polar_subscription_id: null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', orgId)
        }
        await sendPolarEmail(
          'Subscription revoked',
          `Subscription ${subscription.id} revoked`
        )
        break
      }

      // NIA-verified: subscription.uncanceled fires when customer reverses cancellation
      case 'subscription.uncanceled': {
        await syncSubscriptionToOrg(event.data, event.type)
        await sendPolarEmail(
          'Subscription uncanceled',
          `Subscription ${event.data.id} was reactivated`
        )
        break
      }

      // NIA-verified: order.paid is recommended for payment confirmation
      case 'order.paid': {
        await sendPolarEmail('Order paid', `Order ${event.data.id} paid`)
        break
      }

      // NIA-verified: customer.state_changed is comprehensive catch-all
      case 'customer.state_changed': {
        console.log('Customer state changed:', event.data.customer?.id)
        break
      }

      default:
        console.log(`Unhandled Polar event: ${event.type}`)
    }

    // NIA-verified: Return 202 for successful processing
    return res.status(202).json({ received: true, type: event.type })
  } catch (error) {
    console.error('Error processing webhook:', error)
    processedEvents.delete(event.id)
    return res.status(500).json({ error: 'Webhook processing failed' })
  }
}

// NIA-verified: CRITICAL - Disable body parser for signature verification
export const config = {
  api: { bodyParser: false },
}
```

#### 2.3 Add savePolarEvent to Supabase Library

**File:** `api/_lib/supabase.js` (add function):

```javascript
export async function savePolarEvent(event) {
  const supabase = getSupabaseClient()

  try {
    const { error } = await supabase.from('polar_events').insert({
      event_id: event.id,
      type: event.type,
      payload: event,
    })

    if (error) {
      if (error.code === '23505') return { success: true, duplicate: true }
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (err) {
    return { success: false, error: err.message }
  }
}
```

#### 2.4 Create Polar Session Retrieval

**File:** `api/polar/checkout/[checkoutId].js`

```javascript
import { Polar } from '@polar-sh/sdk'

const polar = process.env.POLAR_ACCESS_TOKEN
  ? new Polar({
      accessToken: process.env.POLAR_ACCESS_TOKEN,
      server: process.env.POLAR_SERVER || 'production',
    })
  : null

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { checkoutId } = req.query

  if (!checkoutId) {
    return res
      .status(400)
      .json({ success: false, message: 'Checkout ID required' })
  }

  try {
    const checkout = await polar.checkouts.get(checkoutId)

    // NIA-verified: Use net_amount (not deprecated subtotal_amount)
    return res.json({
      success: true,
      session: {
        id: checkout.id,
        status: checkout.status,
        customerEmail: checkout.customer?.email,
        amountTotal: checkout.net_amount,
        currency: checkout.currency,
        paymentStatus:
          checkout.status === 'succeeded' ? 'paid' : checkout.status,
      },
    })
  } catch (error) {
    console.error('Failed to retrieve checkout:', error)
    return res
      .status(404)
      .json({ success: false, message: 'Checkout not found' })
  }
}
```

---

### Phase 3: Database Schema Migration

**File:** `scripts/migrate-stripe-to-polar.sql`

```sql
-- =====================================================
-- Stripe to Polar Migration Script
-- =====================================================

-- Step 1: Add Polar columns (keep Stripe for rollback)
ALTER TABLE orgs
  ADD COLUMN IF NOT EXISTS polar_customer_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS polar_subscription_id TEXT UNIQUE;

-- Step 2: Create indexes
CREATE INDEX IF NOT EXISTS idx_orgs_polar_customer_id ON orgs(polar_customer_id);
CREATE INDEX IF NOT EXISTS idx_orgs_polar_subscription_id ON orgs(polar_subscription_id);

-- Step 3: Create polar_events table
CREATE TABLE IF NOT EXISTS polar_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_polar_events_event_id ON polar_events(event_id);
CREATE INDEX IF NOT EXISTS idx_polar_events_type ON polar_events(type);
CREATE INDEX IF NOT EXISTS idx_polar_events_created_at ON polar_events(created_at DESC);

-- Step 4: RLS
ALTER TABLE polar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage polar_events"
ON polar_events FOR ALL
USING (auth.role() = 'service_role');
```

---

### Phase 4: Frontend Updates

#### 4.1 Create Polar Utils

**File:** `apps/frontend/src/utils/polar.ts`

```typescript
import type { Session } from '@supabase/supabase-js'
import { logger } from './logger'

export const POLAR_PRODUCT_IDS = {
  starter: import.meta.env.VITE_POLAR_PRODUCT_STARTER || '',
  professional: import.meta.env.VITE_POLAR_PRODUCT_PROFESSIONAL || '',
  enterprise: '',
} as const

export type PlanType = keyof typeof POLAR_PRODUCT_IDS

export const PLAN_PRICES = {
  starter: { amount: 29, currency: 'EUR', interval: 'month' },
  professional: { amount: 79, currency: 'EUR', interval: 'month' },
  enterprise: { amount: null, currency: 'EUR', interval: 'month' },
} as const

export interface CheckoutSessionResponse {
  success: boolean
  checkoutId?: string
  url?: string
  message?: string
  error?: string
}

export interface CheckoutSession {
  id: string
  status: string
  customerEmail?: string
  amountTotal?: number
  currency?: string
  paymentStatus?: string
}

export const createCheckoutSession = async (
  planName: PlanType,
  session: Session | null
): Promise<CheckoutSessionResponse> => {
  if (!session?.access_token) {
    return {
      success: false,
      message: 'Authentication required',
      error: 'AUTH_REQUIRED',
    }
  }

  try {
    const response = await fetch('/api/polar/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ planName }),
    })

    const data = await response.json()
    if (!response.ok) {
      if (response.status === 401) {
        return {
          success: false,
          message: 'Session expired',
          error: 'AUTH_EXPIRED',
        }
      }
      throw new Error(data.message || 'Failed to create checkout')
    }
    return data
  } catch (error) {
    logger.error('Failed to create checkout session', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export const redirectToCheckout = async (
  planName: PlanType,
  session: Session | null
): Promise<{ error?: Error; authRequired?: boolean }> => {
  if (!session?.access_token) {
    return { error: new Error('Authentication required'), authRequired: true }
  }

  try {
    if (!POLAR_PRODUCT_IDS[planName]) {
      throw new Error(`Invalid plan: ${planName}`)
    }

    const response = await createCheckoutSession(planName, session)

    if (
      response.error === 'AUTH_REQUIRED' ||
      response.error === 'AUTH_EXPIRED'
    ) {
      return {
        error: new Error(response.message || 'Authentication required'),
        authRequired: true,
      }
    }

    if (!response.success || !response.url) {
      throw new Error(response.message || 'Failed to create checkout')
    }

    window.location.href = response.url
    return {}
  } catch (error) {
    logger.error('Failed to redirect to checkout', error)
    return {
      error: error instanceof Error ? error : new Error('Unknown error'),
    }
  }
}

export const getCheckoutSession = async (
  checkoutId: string
): Promise<CheckoutSession | null> => {
  try {
    const response = await fetch(`/api/polar/checkout/${checkoutId}`)
    const data = await response.json()
    if (!response.ok || !data.success) throw new Error(data.message)
    return data.session
  } catch (error) {
    logger.error('Failed to retrieve checkout', error)
    return null
  }
}

export const formatPrice = (
  amount: number | null,
  currency = 'EUR'
): string => {
  if (amount === null) return 'Sur mesure'
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(
    amount
  )
}
```

#### 4.2 Update CheckoutSuccess.tsx

Change `session_id` to `checkout_id`:

```diff
- const sessionId = searchParams.get('session_id')
+ const checkoutId = searchParams.get('checkout_id')
```

---

## Webhook Events Reference (NIA-Verified)

| Event | When | Action |

| ------------------------ | ------------------------------ | ------------------------------- |

| `checkout.updated` | Status changes (→ `succeeded`) | If succeeded, sync subscription |

| `subscription.created` | New subscription | Sync to orgs table |

| `subscription.updated` | **Catch-all** for all changes | Sync to orgs table |

| `subscription.revoked` | Final cancellation | Mark org as canceled |

| `subscription.uncanceled`| Cancellation reversed | Re-sync org to active |

| `order.paid` | Payment confirmed | Send notification |

| `customer.state_changed` | Any customer change | Optional comprehensive sync |

**Checkout Status Flow:**

```
Open → Confirmed → Succeeded ✅ (or Expired)
```

**Subscription Status + cancel_at_period_end:**

- `status: active` + `cancel_at_period_end: false` = Active subscription
- `status: active` + `cancel_at_period_end: true` = Scheduled for cancellation (still active until period ends!)
- `status: canceled` = Period ended or immediate revocation, no longer billed

> [!NOTE]

> **`revoked` is a webhook EVENT, not a status.** When `subscription.revoked` fires, the subscription's status becomes `canceled`.

---

## Testing Checklist

### Sandbox Testing (Use `https://sandbox.polar.sh`)

| Test | Expected Result |

| ------------------- | --------------------------------------------------------- |

| Create checkout | Returns `checkoutId` and `url` |

| Complete payment | `checkout.updated` with `succeeded` |

| Verify org sync | `polar_customer_id` and `polar_subscription_id` populated |

| Cancel subscription | `subscription.updated` → `subscription.revoked` |

| Replay webhook | Returns `{ replay: true }` (idempotency) |

### Local Testing with ngrok

```bash
ngrok http 3000
# Add ngrok URL to Sandbox webhook settings
# Set POLAR_WEBHOOK_SECRET from sandbox dashboard
```

---

## Files Summary

### New Files

| File | Purpose |

| -------------------------------------- | ----------------- |

| `api/polar/create-checkout-session.js` | Checkout endpoint |

| `api/polar/webhook.js` | Webhook handler |

| `api/polar/checkout/[checkoutId].js` | Session retrieval |

| `apps/frontend/src/utils/polar.ts` | Frontend utils |

| `scripts/migrate-stripe-to-polar.sql` | DB migration |

### Modified Files

| File | Changes |

| ------------------------- | ----------------------------------------------- |

| `api/package.json` | Add `@polar-sh/sdk`, `@polar-sh/express`, `zod` |

| `api/_lib/supabase.js` | Add `savePolarEvent()` |

| `env.production.template` | Add Polar env vars |

| `CheckoutSuccess.tsx` | Use `checkout_id` param |

### Cleanup (After Migration)

- Delete `api/stripe/*`
- Delete `apps/frontend/src/utils/stripe.ts`
- Remove Stripe columns from `orgs` table
- Remove `stripe` from `package.json`

---

## Rollback Plan

1. Keep Stripe endpoints during parallel operation
2. Stripe columns preserved until final cleanup
3. Feature flag to switch between providers
4. Polar webhooks can be disabled in dashboard
