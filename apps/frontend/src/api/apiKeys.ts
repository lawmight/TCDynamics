/**
 * API Key Management API Client
 * Following patterns from utils/polar.ts
 */

import { config } from '@/utils/config'
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

const getApiKeysUrl = (path = '') => {
  const apiBaseUrl = config.apiBaseUrl.replace(/\/$/, '')
  return `${apiBaseUrl}/app/api-keys${path}`
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
    throw new Error(
      'Authentification requise. Connectez-vous pour continuer.'
    )
  }

  try {
    let response: Response
    try {
      response = await fetch(getApiKeysUrl(), {
        method: 'GET',
        credentials: 'omit',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
    } catch {
      // Handle network errors (server not running, connection refused, etc.)
      const isDevelopment = import.meta.env.DEV
      if (isDevelopment) {
        throw new Error(
          "Impossible de se connecter au serveur API. Vérifiez que vous avez démarré l'environnement complet avec `npm run dev` (et pas seulement `npm run dev:frontend`)."
        )
      }
      throw new Error(
        "Erreur réseau : impossible de joindre le serveur API. Réessayez plus tard."
      )
    }

    // Handle 404 - API server not running or endpoint not found
    if (response.status === 404) {
      const isDevelopment = import.meta.env.DEV
      if (isDevelopment) {
        throw new Error(
          "Point d'entrée API introuvable. Vérifiez que le serveur Vercel de développement est actif (`npm run dev` lance à la fois le frontend et l'API)."
        )
      }
      throw new Error("Point d'entrée API introuvable. Vérifiez votre configuration.")
    }

    // Handle 431 - Request headers too large (usually large auth tokens)
    if (response.status === 431) {
      const isDevelopment = import.meta.env.DEV
      if (isDevelopment) {
        throw new Error(
          "En-têtes de requête trop volumineux. Cela vient souvent de jetons d'authentification trop grands. " +
            "Vérifiez que vous utilisez `npm run dev` (qui applique le correctif de taille d'en-tête). " +
            'Si le problème persiste, déconnectez-vous puis reconnectez-vous pour rafraîchir votre session.'
        )
      }
      throw new Error(
        "Les données d'authentification sont trop volumineuses. Déconnectez-vous puis reconnectez-vous pour rafraîchir votre session."
      )
    }

    // Check if response has content before parsing
    const contentType = response.headers.get('content-type')
    const text = await response.text()

    // Handle empty responses (shouldn't happen with proper error handling, but defensive)
    if (!text || text.trim().length === 0) {
      if (response.status === 401) {
        throw new Error(
          'Votre session a expiré. Reconnectez-vous pour continuer.'
        )
      }
      throw new Error(
        `Le serveur a renvoyé une réponse vide (${response.status}). Réessayez.`
      )
    }

    // Validate content type
    if (!contentType?.includes('application/json')) {
      throw new Error(
        `Format de réponse inattendu : ${contentType}. JSON attendu.`
      )
    }

    let data: ListApiKeysResponse
    try {
      data = JSON.parse(text) as ListApiKeysResponse
    } catch (parseError) {
      throw new Error(
        `Impossible d'analyser la réponse serveur : ${parseError instanceof Error ? parseError.message : 'JSON invalide'}`
      )
    }

    if (!response.ok) {
      if (response.status === 401) {
        // More specific error message for session expiration
        const errorMsg = data.error || 'Votre session a expiré. Reconnectez-vous.'
        throw new Error(errorMsg)
      }
      throw new Error(data.error || 'Impossible de charger les clés API')
    }

    if (!data.success) {
      throw new Error(data.error || 'Impossible de charger les clés API')
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
    throw new Error('Authentification requise')
  }

  try {
    const response = await fetch(getApiKeysUrl(), {
      method: 'POST',
      credentials: 'omit',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(request || {}),
    })

    const data: CreateApiKeyResponse = await response.json()

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Session expirée')
      }
      throw new Error(data.error || 'Impossible de créer la clé API')
    }

    if (!data.success) {
      throw new Error(data.error || 'Impossible de créer la clé API')
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
    throw new Error('Authentification requise')
  }

  try {
    const response = await fetch(getApiKeysUrl(), {
      method: 'DELETE',
      credentials: 'omit',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ keyId }),
    })

    const data: RevokeApiKeyResponse = await response.json()

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Session expirée')
      }
      throw new Error(data.error || 'Impossible de révoquer la clé API')
    }

    if (!data.success) {
      throw new Error(data.error || 'Impossible de révoquer la clé API')
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
    throw new Error('Authentification requise')
  }

  try {
    const response = await fetch(
      getApiKeysUrl(`?action=restore&keyId=${keyId}`),
      {
        method: 'POST',
        credentials: 'omit',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    )

    const data: RestoreApiKeyResponse = await response.json()

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Session expirée')
      }
      throw new Error(data.error || 'Impossible de restaurer la clé API')
    }

    if (!data.success) {
      throw new Error(data.error || 'Impossible de restaurer la clé API')
    }

    return data
  } catch (error) {
    logger.error('Failed to restore API key', error)
    throw error
  }
}
