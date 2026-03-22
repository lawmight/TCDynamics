/**
 * React Query hook for API Key Management
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import {
  type ApiKey,
  type CreateApiKeyRequest,
  type CreateApiKeyResponse,
  createApiKey,
  listApiKeys,
  restoreApiKey,
  revokeApiKey,
} from '@/api/apiKeys'
import { useAuth } from '@/hooks/useAuth'

const API_KEYS_QUERY_KEY = ['apiKeys'] as const

export interface UseApiKeysReturn {
  keys: ApiKey[]
  isLoading: boolean
  error: Error | null
  refetch: () => void
  createKey: (request?: CreateApiKeyRequest) => void
  revokeKey: (keyId: string) => void
  restoreKey: (keyId: string) => void
  isCreating: boolean
  isRevoking: boolean
  isRestoring: boolean
  createdKey: CreateApiKeyResponse | null
  clearCreatedKey: () => void
}

export function useApiKeys(): UseApiKeysReturn {
  const { getToken, isSignedIn } = useAuth()
  const queryClient = useQueryClient()

  // Query for listing keys
  const {
    data: keys,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: API_KEYS_QUERY_KEY,
    queryFn: () => listApiKeys(getToken),
    enabled: !!isSignedIn,
    staleTime: 30 * 1000, // 30 seconds
  })

  // Mutation for creating key
  const createMutation = useMutation({
    mutationFn: (request: CreateApiKeyRequest | undefined) =>
      createApiKey(getToken, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: API_KEYS_QUERY_KEY })
      toast.success('Clé API créée', {
        description:
          'Votre nouvelle clé API est prête. Copiez-la maintenant : elle ne sera plus affichée.',
      })
    },
    onError: (error: Error) => {
      toast.error('Impossible de créer la clé API', {
        description: error.message || 'Une erreur inattendue est survenue',
      })
    },
  })

  // Mutation for revoking key
  const revokeMutation = useMutation({
    mutationFn: (keyId: string) => revokeApiKey(keyId, getToken),
    onSuccess: (_, keyId) => {
      queryClient.invalidateQueries({ queryKey: API_KEYS_QUERY_KEY })
      toast.success('Clé API révoquée', {
        description: 'Cette action peut être annulée pendant 10 secondes',
        action: {
          label: 'Annuler',
          onClick: () => restoreMutation.mutate(keyId),
        },
        duration: 10000, // Match restore window
      })
    },
    onError: (error: Error) => {
      toast.error('Impossible de révoquer la clé API', {
        description: error.message || 'Une erreur inattendue est survenue',
      })
    },
  })

  // Mutation for restoring key
  const restoreMutation = useMutation({
    mutationFn: (keyId: string) => restoreApiKey(keyId, getToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: API_KEYS_QUERY_KEY })
      toast.success('Clé API restaurée', {
        description: 'Votre clé API est de nouveau active',
      })
    },
    onError: (error: Error) => {
      toast.error('Impossible de restaurer la clé API', {
        description: error.message || 'Une erreur inattendue est survenue',
      })
    },
  })

  // Clear the created key after user closes dialog
  const clearCreatedKey = () => {
    createMutation.reset()
  }

  // Wrapper function to properly type the mutation
  const handleCreateKey = (request?: CreateApiKeyRequest) => {
    createMutation.mutate(request)
  }

  return {
    keys: keys || [],
    isLoading,
    error: error as Error | null,
    refetch,
    createKey: handleCreateKey,
    revokeKey: revokeMutation.mutate,
    restoreKey: restoreMutation.mutate,
    isCreating: createMutation.isPending,
    isRevoking: revokeMutation.isPending,
    isRestoring: restoreMutation.isPending,
    createdKey: createMutation.data ?? null,
    clearCreatedKey,
  }
}
