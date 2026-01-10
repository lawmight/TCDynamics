import { logger } from './logger'

export const POLAR_PRODUCT_IDS = {
  starter: import.meta.env.VITE_POLAR_PRODUCT_STARTER,
  professional: import.meta.env.VITE_POLAR_PRODUCT_PROFESSIONAL,
  enterprise: import.meta.env.VITE_POLAR_PRODUCT_ENTERPRISE,
} as const

// Startup validation: ensure required environment variables are set
if (typeof window !== 'undefined') {
  const missingVars: string[] = []
  if (!POLAR_PRODUCT_IDS.starter) {
    missingVars.push('VITE_POLAR_PRODUCT_STARTER')
  }
  if (!POLAR_PRODUCT_IDS.professional) {
    missingVars.push('VITE_POLAR_PRODUCT_PROFESSIONAL')
  }
  // Enterprise is optional (can be undefined for custom pricing)
  if (missingVars.length > 0) {
    throw new Error(
      `Missing required Polar product ID environment variables: ${missingVars.join(', ')}`
    )
  }
}

export type PlanType = keyof typeof POLAR_PRODUCT_IDS

export const PLAN_PRICES = {
  starter: { amount: 29, currency: 'USD', interval: 'month' },
  professional: { amount: 79, currency: 'USD', interval: 'month' },
  enterprise: { amount: null, currency: 'USD', interval: 'month' },
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
  getToken: () => Promise<string | null>
): Promise<CheckoutSessionResponse> => {
  const token = await getToken()
  if (!token) {
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
        Authorization: `Bearer ${token}`,
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
  getToken: () => Promise<string | null>
): Promise<{ error?: Error; authRequired?: boolean }> => {
  const token = await getToken()
  if (!token) {
    return { error: new Error('Authentication required'), authRequired: true }
  }

  try {
    if (!(planName in POLAR_PRODUCT_IDS)) {
      throw new Error(`Invalid plan: ${planName}`)
    }

    const response = await createCheckoutSession(planName, getToken)

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
  checkoutId: string,
  getToken: () => Promise<string | null>
): Promise<CheckoutSession | null> => {
  const token = await getToken()
  if (!token) {
    logger.error('Authentication required to retrieve checkout session')
    return null
  }

  try {
    const response = await fetch(
      `/api/polar/checkout-session?checkoutId=${checkoutId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    )
    const data = await response.json()
    if (!response.ok || !data.success) {
      if (response.status === 401) {
        logger.error('Session expired while retrieving checkout')
        return null
      }
      throw new Error(data.message || 'Failed to retrieve checkout session')
    }
    return data.session
  } catch (error) {
    logger.error('Failed to retrieve checkout', error)
    return null
  }
}

export const formatPrice = (
  amount: number | null,
  currency = 'USD'
): string => {
  if (amount === null) return 'Sur mesure'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(
    amount
  )
}

/**
 * Create an on-demand checkout with custom pricing
 * Useful for one-time payments, custom amounts, or dynamic pricing
 */
export interface OnDemandCheckoutParams {
  planName?: PlanType // Plan name ('starter', 'professional', 'enterprise') - preferred
  productId?: string // Direct Polar product ID (use if planName not available)
  amount: number // Amount in cents (e.g., 10000 for $100.00)
  currency?: string // Defaults to 'usd'
  amountType?: 'fixed' | 'custom' | 'free' // Defaults to 'fixed'
  metadata?: Record<string, string>
}

export const createOnDemandCheckout = async (
  params: OnDemandCheckoutParams,
  getToken: () => Promise<string | null>
): Promise<CheckoutSessionResponse> => {
  const token = await getToken()
  if (!token) {
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
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        planName: params.planName,
        productId: params.productId,
        amount: params.amount,
        currency: params.currency || 'eur',
        amountType: params.amountType || 'fixed',
        metadata: params.metadata || {},
      }),
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
      throw new Error(data.message || 'Failed to create on-demand checkout')
    }
    return data
  } catch (error) {
    logger.error('Failed to create on-demand checkout', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Redirect to on-demand checkout
 */
export const redirectToOnDemandCheckout = async (
  params: OnDemandCheckoutParams,
  getToken: () => Promise<string | null>
): Promise<{ error?: Error; authRequired?: boolean }> => {
  const token = await getToken()
  if (!token) {
    return { error: new Error('Authentication required'), authRequired: true }
  }

  try {
    const response = await createOnDemandCheckout(params, getToken)

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
    logger.error('Failed to redirect to on-demand checkout', error)
    return {
      error: error instanceof Error ? error : new Error('Unknown error'),
    }
  }
}
