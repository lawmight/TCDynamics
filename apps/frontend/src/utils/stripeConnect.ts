/**
 * Stripe Connect Integration Utilities
 *
 * This file contains utility functions for interacting with Stripe Connect API.
 * It handles connected account management, product creation, and checkout sessions.
 *
 * Key Features:
 * - Connected account creation with controller settings
 * - Account onboarding with account links
 * - Product management for connected accounts
 * - Checkout sessions with application fees
 *
 * API Version: 2025-09-30.clover
 */

// Types for Stripe Connect operations
export interface ConnectedAccount {
  id: string
  email: string
  country: string
  charges_enabled: boolean
  payouts_enabled: boolean
  details_submitted: boolean
  requirements?: Record<string, unknown>
  business_type?: string
  type?: string
}

export interface CreateAccountParams {
  email: string
  country?: string
}

export interface CreateAccountResponse {
  success: boolean
  accountId?: string
  email?: string
  country?: string
  charges_enabled?: boolean
  payouts_enabled?: boolean
  details_submitted?: boolean
  message?: string
  error?: string
}

export interface CreateAccountLinkParams {
  accountId: string
  refreshUrl?: string
  returnUrl?: string
}

export interface CreateAccountLinkResponse {
  success: boolean
  url?: string
  expires_at?: number
  message?: string
  error?: string
}

export interface Product {
  id: string
  name: string
  description: string
  active: boolean
  created: number
  default_price: string | any
  images: string[]
  metadata: Record<string, string>
}

export interface CreateProductParams {
  accountId: string
  name: string
  description: string
  priceInCents: number
  currency?: string
  images?: string[]
}

export interface CreateProductResponse {
  success: boolean
  product?: Product
  message?: string
  error?: string
}

export interface ListProductsResponse {
  success: boolean
  products?: Product[]
  has_more?: boolean
  message?: string
  error?: string
}

export interface CreateCheckoutSessionParams {
  accountId: string
  lineItems: Array<{
    price_data: {
      unit_amount: number
      currency: string
      product_data: {
        name: string
        description?: string
        images?: string[]
      }
    }
    quantity: number
  }>
  successUrl: string
  cancelUrl?: string
  applicationFeeAmount?: number
}

export interface CreateCheckoutSessionResponse {
  success: boolean
  sessionId?: string
  url?: string
  message?: string
  error?: string
}

// Base API URL
const getApiUrl = () => {
  return import.meta.env.VITE_API_URL || 'http://localhost:3000'
}

/**
 * Create a new Stripe Connect account
 *
 * Creates a connected account with controller settings:
 * - Platform controls fee collection (connected account pays fees)
 * - Stripe handles payment disputes and losses
 * - Connected account gets full access to Stripe dashboard
 *
 * @param params - Account creation parameters
 * @returns Promise with account creation result
 */
export const createConnectedAccount = async (
  params: CreateAccountParams
): Promise<CreateAccountResponse> => {
  try {
    const apiUrl = getApiUrl()

    const response = await fetch(
      `${apiUrl}/api/stripe-connect/create-account`,
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
      throw new Error(data.message || 'Failed to create connected account')
    }

    return data
  } catch (error) {
    console.error('Error creating connected account:', error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

/**
 * Retrieve connected account details
 *
 * Gets the current status and details of a connected account.
 * This is used to check onboarding status and account capabilities.
 *
 * @param accountId - Stripe Connect account ID
 * @returns Promise with account details
 */
export const getConnectedAccount = async (
  accountId: string
): Promise<{
  success: boolean
  account?: ConnectedAccount
  message?: string
  error?: string
}> => {
  try {
    if (!accountId) {
      throw new Error('Account ID is required')
    }

    const apiUrl = getApiUrl()

    const response = await fetch(
      `${apiUrl}/api/stripe-connect/account/${accountId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to retrieve account')
    }

    return data
  } catch (error) {
    console.error('Error retrieving connected account:', error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

/**
 * Create account link for onboarding
 *
 * Creates a Stripe account link that allows the connected account holder
 * to complete their onboarding process. The link expires after a certain time.
 *
 * @param params - Account link creation parameters
 * @returns Promise with account link details
 */
export const createAccountLink = async (
  params: CreateAccountLinkParams
): Promise<CreateAccountLinkResponse> => {
  try {
    const apiUrl = getApiUrl()

    const response = await fetch(
      `${apiUrl}/api/stripe-connect/create-account-link`,
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
      throw new Error(data.message || 'Failed to create account link')
    }

    return data
  } catch (error) {
    console.error('Error creating account link:', error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

/**
 * List products for a connected account
 *
 * Retrieves all active products for a specific connected account.
 * This is used to display products in the storefront.
 *
 * @param accountId - Stripe Connect account ID
 * @param limit - Maximum number of products to retrieve (default: 10)
 * @returns Promise with products list
 */
export const listProducts = async (
  accountId: string,
  limit: number = 10
): Promise<ListProductsResponse> => {
  try {
    if (!accountId) {
      throw new Error('Account ID is required')
    }

    const apiUrl = getApiUrl()

    const response = await fetch(
      `${apiUrl}/api/stripe-connect/products?accountId=${accountId}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to retrieve products')
    }

    return data
  } catch (error) {
    console.error('Error retrieving products:', error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

/**
 * Create a product for a connected account
 *
 * Creates a new product with pricing for a connected account.
 * The product will be created on the connected account, not the platform.
 *
 * @param params - Product creation parameters
 * @returns Promise with product creation result
 */
export const createProduct = async (
  params: CreateProductParams
): Promise<CreateProductResponse> => {
  try {
    // Validate required fields
    if (
      !params.accountId ||
      !params.name ||
      !params.description ||
      !params.priceInCents
    ) {
      throw new Error('Account ID, name, description, and price are required')
    }

    // Validate price is positive
    if (params.priceInCents <= 0) {
      throw new Error('Price must be greater than 0')
    }

    const apiUrl = getApiUrl()

    const response = await fetch(`${apiUrl}/api/stripe-connect/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create product')
    }

    return data
  } catch (error) {
    console.error('Error creating product:', error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

/**
 * Create checkout session for connected account
 *
 * Creates a checkout session for purchasing products from a connected account.
 * Uses Direct Charge with application fee for platform monetization.
 *
 * @param params - Checkout session creation parameters
 * @returns Promise with checkout session details
 */
export const createCheckoutSession = async (
  params: CreateCheckoutSessionParams
): Promise<CreateCheckoutSessionResponse> => {
  try {
    // Validate required fields
    if (!params.accountId || !params.lineItems || !params.successUrl) {
      throw new Error('Account ID, line items, and success URL are required')
    }

    // Validate line items
    if (!Array.isArray(params.lineItems) || params.lineItems.length === 0) {
      throw new Error('Line items must be a non-empty array')
    }

    const apiUrl = getApiUrl()

    const response = await fetch(
      `${apiUrl}/api/stripe-connect/create-checkout-session`,
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
    console.error('Error creating checkout session:', error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

/**
 * Redirect to Stripe Checkout for connected account
 *
 * Creates a checkout session and redirects the user to Stripe Checkout
 * for purchasing products from a connected account.
 *
 * @param params - Checkout session creation parameters
 * @returns Promise with redirect result
 */
export const redirectToConnectCheckout = async (
  params: CreateCheckoutSessionParams
): Promise<{ error?: Error }> => {
  try {
    // Create checkout session
    const sessionResponse = await createCheckoutSession(params)

    if (!sessionResponse.success || !sessionResponse.url) {
      throw new Error(sessionResponse.message || 'Failed to create session')
    }

    // Redirect to Stripe Checkout
    window.location.href = sessionResponse.url

    return {}
  } catch (error) {
    console.error('Error redirecting to checkout:', error)
    return {
      error: error instanceof Error ? error : new Error('Unknown error'),
    }
  }
}

/**
 * Format price for display
 *
 * Formats a price in cents to a human-readable format.
 *
 * @param amountInCents - Price in cents
 * @param currency - Currency code (default: 'usd')
 * @returns Formatted price string
 */
export const formatConnectPrice = (
  amountInCents: number,
  currency: string = 'usd'
): string => {
  const amount = amountInCents / 100

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount)
}

/**
 * Get account onboarding status
 *
 * Determines the onboarding status of a connected account based on
 * the account details from the Stripe API.
 *
 * @param account - Connected account object
 * @returns Onboarding status string
 */
export const getOnboardingStatus = (account: ConnectedAccount): string => {
  if (!account.details_submitted) {
    return 'incomplete'
  }

  if (!account.charges_enabled) {
    return 'pending'
  }

  if (account.charges_enabled && account.payouts_enabled) {
    return 'complete'
  }

  return 'partial'
}

/**
 * Get status badge color for UI display
 *
 * Returns the appropriate color class for displaying account status.
 *
 * @param status - Onboarding status
 * @returns CSS class name for status badge
 */
export const getStatusBadgeColor = (status: string): string => {
  switch (status) {
    case 'complete':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    case 'partial':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    case 'incomplete':
    default:
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  }
}

/**
 * Get status display text
 *
 * Returns human-readable text for account status.
 *
 * @param status - Onboarding status
 * @returns Display text for status
 */
export const getStatusDisplayText = (status: string): string => {
  switch (status) {
    case 'complete':
      return 'Ready to accept payments'
    case 'pending':
      return 'Onboarding in progress'
    case 'partial':
      return 'Partially configured'
    case 'incomplete':
    default:
      return 'Onboarding required'
  }
}
