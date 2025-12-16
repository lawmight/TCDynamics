/**
 * Vercel Serverless Function for Stripe Checkout (CommonJS to avoid ESM import issues)
 */

const Stripe = require('stripe')
const { createClient } = require('@supabase/supabase-js')
const crypto = require('crypto')

// Startup diagnostics for troubleshooting missing env vars
console.log('Stripe create-checkout-session init', {
  hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
  keyPrefix: process.env.STRIPE_SECRET_KEY
    ? process.env.STRIPE_SECRET_KEY.substring(0, 8)
    : 'NOT_SET',
  vercelEnv: process.env.VERCEL_ENV,
  nodeEnv: process.env.NODE_ENV,
})

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null

/**
 * Hash an identifier (orgId, userId) for logging to prevent PII exposure.
 * Uses SHA-256 with optional salt from PII_HASH_SALT env var (or IP_HASH_SALT as fallback).
 * Returns a consistent hash for correlation while being non-reversible.
 *
 * @param {string} identifier - The identifier to hash (orgId or userId)
 * @returns {string} - Hex-encoded SHA-256 hash, or 'REDACTED' if identifier is missing
 */
const hashIdentifier = identifier => {
  if (!identifier) return 'REDACTED'

  const salt = process.env.PII_HASH_SALT || process.env.IP_HASH_SALT || ''
  const input = salt ? `${salt}:${identifier}` : identifier

  return crypto
    .createHash('sha256')
    .update(input)
    .digest('hex')
    .substring(0, 16) // Use first 16 chars for readability while maintaining uniqueness
}

/**
 * Sanitize error objects for logging - extracts only non-PII fields.
 * Logs error message and stack (in dev) but excludes full error objects that may contain sensitive data.
 *
 * @param {Error|unknown} error - The error to sanitize
 * @returns {object} - Sanitized error object with only safe fields
 */
const sanitizeError = error => {
  if (!error) return { message: 'Unknown error' }

  const sanitized = {
    message: error.message || String(error),
  }

  // Only include stack trace in development
  if (process.env.NODE_ENV === 'development' && error.stack) {
    sanitized.stack = error.stack
  }

  return sanitized
}

/**
 * PII LOGGING POLICY:
 * All logs containing orgId or userId use hashed identifiers (SHA-256) to prevent PII exposure.
 * Hashes are consistent for correlation but non-reversible. Error objects are sanitized to
 * exclude sensitive fields. See README.md for logging retention and access-control policies.
 */

// Get Supabase client for auth verification
const getSupabaseClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Supabase configuration missing. Check SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables.'
    )
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Verify Supabase auth token and return user ID
const verifySupabaseAuth = async authHeader => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { userId: null, error: 'Missing or invalid Authorization header' }
  }

  // Validate Supabase configuration before attempting to create client
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return {
      userId: null,
      error:
        'Supabase configuration missing. Check SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables.',
    }
  }

  const token = authHeader.replace('Bearer ', '')

  try {
    const supabase = getSupabaseClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token)

    if (error || !user) {
      return { userId: null, error: error?.message || 'Invalid token' }
    }

    return { userId: user.id, error: null }
  } catch (err) {
    return { userId: null, error: err.message }
  }
}

// Verify user has access to organization
// For MVP: org.id = user.id (1:1 relationship)
// Future: can be extended to check membership table
const verifyOrgAccess = async (userId, orgId) => {
  if (!orgId) {
    // No orgId provided, user can proceed with their own userId
    return { hasAccess: true, error: null }
  }

  if (!userId) {
    return {
      hasAccess: false,
      error: 'User ID is required for org verification',
    }
  }

  try {
    const supabase = getSupabaseClient()

    // Check if org exists
    const { data: org, error: orgError } = await supabase
      .from('orgs')
      .select('id')
      .eq('id', orgId)
      .single()

    if (orgError || !org) {
      console.warn('Organization not found or access denied', {
        orgId: hashIdentifier(orgId),
        userId: hashIdentifier(userId),
        error: orgError?.message,
      })
      return {
        hasAccess: false,
        error: 'Organization not found or access denied',
      }
    }

    // For MVP: verify userId === orgId (1:1 relationship)
    // Future: check membership table here if multi-user orgs are supported
    if (userId !== orgId) {
      console.warn('Unauthorized org access attempt', {
        orgId: hashIdentifier(orgId),
        userId: hashIdentifier(userId),
        attemptedBy: hashIdentifier(userId),
      })
      return {
        hasAccess: false,
        error: 'You do not have permission to access this organization',
      }
    }

    return { hasAccess: true, error: null }
  } catch (err) {
    console.error('Error verifying org access', {
      orgId: hashIdentifier(orgId),
      userId: hashIdentifier(userId),
      error: err.message,
    })
    return {
      hasAccess: false,
      error: 'Failed to verify organization access',
    }
  }
}

// Allow CORS for cross-origin usage (e.g., preview builds)
const allowCors = fn => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET,OPTIONS,PATCH,DELETE,POST,PUT'
  )
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  )

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  return await fn(req, res)
}

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    })
  }

  try {
    // Guard: Stripe configured
    if (!stripe) {
      console.error('Stripe not initialized - missing STRIPE_SECRET_KEY')
      return res.status(500).json({
        success: false,
        message:
          'Payment service is not configured. Please add STRIPE_SECRET_KEY to Vercel environment variables.',
        error: 'STRIPE_NOT_CONFIGURED',
      })
    }

    // Verify Supabase authentication to get userId
    const authHeader = req.headers.authorization
    const { userId, error: authError } = await verifySupabaseAuth(authHeader)

    if (authError || !userId) {
      console.warn('Authentication failed:', authError)
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: authError || 'Invalid token',
      })
    }

    const { priceId, planName, orgId } = req.body || {}

    if (!priceId || !planName) {
      return res.status(400).json({
        success: false,
        message: 'Price ID and plan name are required',
      })
    }

    // Validate orgId authorization if provided
    if (orgId) {
      const { hasAccess, error: orgAccessError } = await verifyOrgAccess(
        userId,
        orgId
      )

      if (!hasAccess) {
        console.warn('Unauthorized checkout attempt', {
          userId: hashIdentifier(userId),
          orgId: hashIdentifier(orgId),
          error: orgAccessError,
        })
        return res.status(403).json({
          success: false,
          message:
            'Unauthorized: You do not have permission to create a checkout session for this organization',
          error: orgAccessError || 'Organization access denied',
        })
      }
    }

    // Use orgId from request body if authorized, otherwise fallback to userId
    const orgIdentifier = orgId || userId

    // Resolve frontend URL for redirects
    const frontendUrl =
      process.env.VITE_FRONTEND_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:5173')

    // Create Stripe checkout session with client_reference_id and org_id metadata
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${frontendUrl}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/pricing`,
      client_reference_id: String(orgIdentifier),
      metadata: {
        planName,
        org_id: String(orgIdentifier),
      },
      billing_address_collection: 'required',
      allow_promotion_codes: true,
    })

    console.log('Stripe checkout session created', {
      sessionId: session.id,
      planName,
      priceId,
      orgId: hashIdentifier(orgIdentifier),
      clientReferenceId: session.client_reference_id,
    })

    return res.status(200).json({
      success: true,
      sessionId: session.id,
      url: session.url,
    })
  } catch (error) {
    console.error(
      'Error creating Stripe checkout session',
      sanitizeError(error)
    )

    return res.status(500).json({
      success: false,
      message: 'Failed to create checkout session',
      error: error.message || 'Unknown error occurred',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    })
  }
}

module.exports = allowCors(handler)
