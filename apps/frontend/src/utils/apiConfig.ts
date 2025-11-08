// Simple API configuration using environment variables
// This replaces the complex azureServices.ts for Node.js backend

// Azure Functions endpoints (when using Azure Functions backend)
const FUNCTIONS_BASE_URL =
  import.meta.env.VITE_AZURE_FUNCTIONS_URL ||
  'https://func-tcdynamics-contact.azurewebsites.net'

export const API_ENDPOINTS = {
  // Node.js backend endpoints (using relative URLs for deployment compatibility)
  contact: `/api/contact`,
  demo: `/api/demo`,
  health: `/health`,

  // Azure Functions endpoints
  azureContact: `${FUNCTIONS_BASE_URL}/contactform`,
  azureDemo: `${FUNCTIONS_BASE_URL}/demoform`,
  azureChat: `${FUNCTIONS_BASE_URL}/chat`,
  azureVision: `${FUNCTIONS_BASE_URL}/vision`,
  azureHealth: `${FUNCTIONS_BASE_URL}/health`,
  azurePaymentIntent: `${FUNCTIONS_BASE_URL}/create-payment-intent`,
  azureSubscription: `${FUNCTIONS_BASE_URL}/create-subscription`,
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
