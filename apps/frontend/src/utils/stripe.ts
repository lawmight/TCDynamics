import { loadStripe, Stripe } from '@stripe/stripe-js'

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

export const createCheckoutSession = async (
  params: CreateCheckoutSessionParams
): Promise<CheckoutSessionResponse> => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

    const response = await fetch(
      `${apiUrl}/api/stripe/create-checkout-session`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create checkout session')
    }

    return data
  } catch (error) {
    // Log error for debugging (TODO: use proper logging service)
    if (import.meta.env.DEV) {
      console.error('Error creating checkout session:', error)
    }
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

// Redirect to Stripe Checkout
export const redirectToCheckout = async (
  planName: PlanType
): Promise<{ error?: Error }> => {
  try {
    const priceId = STRIPE_PRICE_IDS[planName]

    if (!priceId) {
      throw new Error(`Invalid plan: ${planName}`)
    }

    // Create checkout session
    const sessionResponse = await createCheckoutSession({
      priceId,
      planName,
    })

    if (!sessionResponse.success || !sessionResponse.url) {
      throw new Error(sessionResponse.message || 'Failed to create session')
    }

    // Redirect to Stripe Checkout
    window.location.href = sessionResponse.url

    return {}
  } catch (error) {
    // Log error for debugging (TODO: use proper logging service)
    if (import.meta.env.DEV) {
      console.error('Error redirecting to checkout:', error)
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

export const getCheckoutSession = async (
  sessionId: string
): Promise<CheckoutSession | null> => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

    const response = await fetch(`${apiUrl}/api/stripe/session/${sessionId}`, {
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
      console.error('Error retrieving checkout session:', error)
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
