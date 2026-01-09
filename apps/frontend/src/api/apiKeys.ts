/**
 * API Key Management API Client
 * Following patterns from utils/polar.ts
 */

import { logger } from '@/utils/logger'

export interface ApiKey {
  id: string
  key_prefix: string
  name: string | null
  created_at: string
  revoked_at: string | null
  last_used_at: string | null
}

export interface CreateApiKeyRequest {
  name?: string
}

export interface CreateApiKeyResponse {
  success: boolean
  id: string
  key: string // Only returned on creation
  key_prefix: string
  created_at: string
  message?: string
  error?: string
}

export interface ListApiKeysResponse {
  success: boolean
  keys: ApiKey[]
  error?: string
}

export interface RevokeApiKeyResponse {
  success: boolean
  message: string
  error?: string
}

export interface RestoreApiKeyResponse {
  success: boolean
  message: string
  error?: string
}

/**
 * List all active API keys for the authenticated user
 */
export const listApiKeys = async (
  getToken: () => Promise<string | null>
): Promise<ApiKey[]> => {
  // Get a fresh token - Clerk automatically handles refresh if needed
  const token = await getToken()
  if (!token) {
    throw new Error('Authentication required. Please sign in to continue.')
  }

  try {
    let response: Response
    try {
      response = await fetch('/api/app/api-keys', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
    } catch (networkError) {
      // Handle network errors (server not running, connection refused, etc.)
      const isDevelopment = import.meta.env.DEV
      if (isDevelopment) {
        throw new Error(
          'Cannot connect to API server. Please start the Vercel dev server in a separate terminal: `vercel dev --listen 3001`'
        )
      }
      throw new Error(
        'Network error: Cannot connect to API server. Please try again later.'
      )
    }

    // Handle 404 - API server not running or endpoint not found
    if (response.status === 404) {
      const isDevelopment = import.meta.env.DEV
      if (isDevelopment) {
        throw new Error(
          'API endpoint not found. Please ensure the Vercel dev server is running: `vercel dev --listen 3001`'
        )
      }
      throw new Error('API endpoint not found. Please check your configuration.')
    }

    // Check if response has content before parsing
    const contentType = response.headers.get('content-type')
    const text = await response.text()

    // Handle empty responses (shouldn't happen with proper error handling, but defensive)
    if (!text || text.trim().length === 0) {
      if (response.status === 401) {
        throw new Error(
          'Your session has expired. Please sign in again to continue.'
        )
      }
      throw new Error(
        `Server returned empty response (${response.status}). Please try again.`
      )
    }

    // Validate content type
    if (!contentType?.includes('application/json')) {
      throw new Error(
        `Unexpected response format: ${contentType}. Expected JSON.`
      )
    }

    let data: ListApiKeysResponse
    try {
      data = JSON.parse(text) as ListApiKeysResponse
    } catch (parseError) {
      throw new Error(
        `Failed to parse server response: ${parseError instanceof Error ? parseError.message : 'Invalid JSON'}`
      )
    }

    if (!response.ok) {
      if (response.status === 401) {
        // More specific error message for session expiration
        const errorMsg =
          data.error || 'Your session has expired. Please sign in again.'
        throw new Error(errorMsg)
      }
      throw new Error(data.error || 'Failed to list API keys')
    }

    if (!data.success) {
      throw new Error(data.error || 'Failed to list API keys')
    }

    return data.keys
  } catch (error) {
    logger.error('Failed to list API keys', error)
    throw error
  }
}

/**
 * Create a new API key
 */
export const createApiKey = async (
  getToken: () => Promise<string | null>,
  request?: CreateApiKeyRequest
): Promise<CreateApiKeyResponse> => {
  const token = await getToken()
  if (!token) {
    throw new Error('Authentication required')
  }

  try {
    const response = await fetch('/api/app/api-keys', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(request || {}),
    })

    const data: CreateApiKeyResponse = await response.json()

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Session expired')
      }
      throw new Error(data.error || 'Failed to create API key')
    }

    if (!data.success) {
      throw new Error(data.error || 'Failed to create API key')
    }

    return data
  } catch (error) {
    logger.error('Failed to create API key', error)
    throw error
  }
}

/**
 * Revoke an API key
 */
export const revokeApiKey = async (
  keyId: string,
  getToken: () => Promise<string | null>
): Promise<RevokeApiKeyResponse> => {
  const token = await getToken()
  if (!token) {
    throw new Error('Authentication required')
  }

  try {
    const response = await fetch('/api/app/api-keys', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ keyId }),
    })

    const data: RevokeApiKeyResponse = await response.json()

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Session expired')
      }
      throw new Error(data.error || 'Failed to revoke API key')
    }

    if (!data.success) {
      throw new Error(data.error || 'Failed to revoke API key')
    }

    return data
  } catch (error) {
    logger.error('Failed to revoke API key', error)
    throw error
  }
}

/**
 * Restore a recently revoked API key (within time window)
 */
export const restoreApiKey = async (
  keyId: string,
  getToken: () => Promise<string | null>
): Promise<RestoreApiKeyResponse> => {
  const token = await getToken()
  if (!token) {
    throw new Error('Authentication required')
  }

  try {
    const response = await fetch(`/api/app/api-keys/${keyId}/restore`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    const data: RestoreApiKeyResponse = await response.json()

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Session expired')
      }
      throw new Error(data.error || 'Failed to restore API key')
    }

    if (!data.success) {
      throw new Error(data.error || 'Failed to restore API key')
    }

    return data
  } catch (error) {
    logger.error('Failed to restore API key', error)
    throw error
  }
}
