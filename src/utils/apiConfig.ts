// Simple API configuration using environment variables
// This replaces the complex azureServices.ts for Node.js backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export const API_ENDPOINTS = {
  contact: `${API_BASE_URL}/api/contact`,
  demo: `${API_BASE_URL}/api/demo`,
  health: `${API_BASE_URL}/health`,
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
