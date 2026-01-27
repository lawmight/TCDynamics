// API configuration for Vercel serverless functions
// All endpoints use Vercel's serverless API routes

export const API_ENDPOINTS = {
  // All endpoints now use Vercel serverless functions (relative URLs)
  contact: `/api/forms`,
  demo: `/api/forms`,
  health: `/api/analytics?health=true`,
  chat: `/api/ai?provider=openai&action=chat`,
  vision: `/api/ai?provider=openai&action=vision`,
  paymentIntent: `/api/payments?action=payment-intent`,
  subscription: `/api/payments?action=subscription`,
}

export interface ApiResponse {
  success: boolean
  message: string
  messageId?: string
  errors?: string[]
}

export const apiRequest = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: response.statusText,
      }))
      throw new Error(errorData.message || 'Une erreur est survenue')
    }

    return response.json()
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Erreur de connexion au serveur')
  }
}
