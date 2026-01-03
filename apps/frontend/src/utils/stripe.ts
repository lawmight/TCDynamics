import { loadStripe, Stripe } from '@stripe/stripe-js'

import { logger } from './logger'
// Stripe publishable key from environment
const STRIPE_PUBLISHABLE_KEY =
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ||
  'pk_test_your_stripe_publishable_key_here'

// Price IDs for different plans (from your Stripe Dashboard)
export const STRIPE_PRICE_IDS = {
  starter:
    import.meta.env.VITE_STRIPE_PRICE_STARTER ||
    'price_1SITt3PrdINvydiHc9MN33jF',
  professional:
    import.meta.env.VITE_STRIPE_PRICE_PROFESSIONAL ||
    'price_1SITtRPrdINvydiH0Kp0pgK2', // 79€
  enterprise: '', // Enterprise is custom pricing, contact required
} as const

export type PlanType = keyof typeof STRIPE_PRICE_IDS

// Plan pricing information for display
export const PLAN_PRICES = {
  starter: {
    amount: 29,
    currency: 'EUR',
    interval: 'month',
  },
  professional: {
    amount: 79,
    currency: 'EUR',
    interval: 'month',
  },
  enterprise: {
    amount: null, // Custom pricing
    currency: 'EUR',
    interval: 'month',
  },
} as const

// Initialize Stripe instance (singleton)
let stripePromise: Promise<Stripe | null> | null = null

export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY)
  }
  return stripePromise
}

// Create checkout session
export interface CreateCheckoutSessionParams {
  priceId: string
  planName: string
}

export interface CheckoutSessionResponse {
  success: boolean
  sessionId?: string
  url?: string
  message?: string
  error?: string
}

/**
 * Create a Stripe checkout session
 *
 * RESTful endpoint: POST /api/stripe/checkout-sessions
 *
 * @param params - Checkout parameters (priceId, planName)
 * @param getToken - Function to get Clerk JWT token (required for authentication)
 * @returns Checkout session response with URL to redirect to
 */
export const createCheckoutSession = async (
  params: CreateCheckoutSessionParams,
  getToken: () => Promise<string | null>
): Promise<CheckoutSessionResponse> => {
  // Require authentication
  const token = await getToken()
  if (!token) {
    return {
      success: false,
      message: 'Authentication required. Please log in.',
      error: 'AUTH_REQUIRED',
    }
  }

  try {
    // Use relative URL for API calls to work on any deployment
    // RESTful endpoint: POST /api/stripe/checkout-sessions
    const response = await fetch(`/api/stripe/checkout-sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(params),
    })

    const data = await response.json()

    if (!response.ok) {
      // Handle specific auth errors
      if (response.status === 401) {
        return {
          success: false,
          message: 'Session expired. Please log in again.',
          error: 'AUTH_EXPIRED',
        }
      }
      throw new Error(data.message || 'Failed to create checkout session')
    }

    return data
  } catch (error) {
    // Log error for debugging (TODO: use proper logging service)
    if (import.meta.env.DEV) {
      logger.error('Failed to create checkout session', error)
    }
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

/**
 * Redirect to Stripe Checkout
 * @param planName - Plan to checkout (starter, professional, enterprise)
 * @param getToken - Function to get Clerk JWT token (required for authentication)
 * @returns Object with optional error
 */
export const redirectToCheckout = async (
  planName: PlanType,
  getToken: () => Promise<string | null>
): Promise<{ error?: Error; authRequired?: boolean }> => {
  // Check authentication first
  const token = await getToken()
  if (!token) {
    return {
      error: new Error('Authentication required. Please log in.'),
      authRequired: true,
    }
  }

  try {
    const priceId = STRIPE_PRICE_IDS[planName]

    if (!priceId) {
      throw new Error(`Invalid plan: ${planName}`)
    }

    // Create checkout session with auth
    const sessionResponse = await createCheckoutSession(
      {
        priceId,
        planName,
      },
      getToken
    )

    // Handle auth errors
    if (
      sessionResponse.error === 'AUTH_REQUIRED' ||
      sessionResponse.error === 'AUTH_EXPIRED'
    ) {
      return {
        error: new Error(sessionResponse.message || 'Authentication required'),
        authRequired: true,
      }
    }

    if (!sessionResponse.success || !sessionResponse.url) {
      throw new Error(sessionResponse.message || 'Failed to create session')
    }

    // Redirect to Stripe Checkout
    window.location.href = sessionResponse.url

    return {}
  } catch (error) {
    // Log error for debugging (TODO: use proper logging service)
    if (import.meta.env.DEV) {
      logger.error('Failed to redirect to checkout', error)
    }
    return {
      error: error instanceof Error ? error : new Error('Unknown error'),
    }
  }
}

// Retrieve checkout session details
export interface CheckoutSession {
  id: string
  status: string
  customerEmail?: string
  amountTotal?: number
  currency?: string
  paymentStatus?: string
}

/**
 * Retrieve a Stripe checkout session by ID
 *
 * RESTful endpoint: GET /api/stripe/checkout-sessions/{sessionId}
 *
 * @param sessionId - Stripe checkout session ID
 * @returns Checkout session details or null if not found
 */
export const getCheckoutSession = async (
  sessionId: string
): Promise<CheckoutSession | null> => {
  try {
    // Use relative URL for API calls to work on any deployment
    // RESTful endpoint: GET /api/stripe/checkout-sessions/{sessionId}
    const response = await fetch(`/api/stripe/checkout-sessions/${sessionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to retrieve session')
    }

    return data.session
  } catch (error) {
    // Log error for debugging (TODO: use proper logging service)
    if (import.meta.env.DEV) {
      logger.error('Failed to retrieve checkout session', error)
    }
    return null
  }
}

// Format price for display
export const formatPrice = (
  amount: number | null,
  currency: string = 'EUR'
): string => {
  if (amount === null) {
    return 'Sur mesure'
  }

  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
  }).format(amount)
}
