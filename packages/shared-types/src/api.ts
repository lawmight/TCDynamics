/**
 * @tcd/shared-types - API Types
 * Shared API response types and endpoint definitions
 */

/** Standard API response shape returned by all endpoints */
export interface ApiResponse {
  success: boolean
  message: string
  messageId?: string
  errors?: string[]
}

/** API endpoint paths for Vercel serverless functions */
export const API_ENDPOINTS = {
  contact: `/api/forms`,
  demo: `/api/forms`,
  health: `/api/analytics?health=true`,
  chat: `/api/ai?provider=openai&action=chat`,
  vision: `/api/ai?provider=openai&action=vision`,
  paymentIntent: `/api/payments?action=payment-intent`,
  subscription: `/api/payments?action=subscription`,
} as const

/** Type-safe endpoint key */
export type ApiEndpoint = keyof typeof API_ENDPOINTS
