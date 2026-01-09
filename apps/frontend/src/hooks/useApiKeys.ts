/**
 * React Query hook for API Key Management
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import type {
  ApiKey,
  CreateApiKeyRequest,
  CreateApiKeyResponse,
} from '@/api/apiKeys'
import {
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
      toast.success('API key created', {
        description:
          "Your new API key is ready. Copy it now - it won't be shown again.",
      })
    },
    onError: (error: Error) => {
      toast.error('Failed to create API key', {
        description: error.message || 'An unexpected error occurred',
      })
    },
  })

  // Mutation for revoking key
  const revokeMutation = useMutation({
    mutationFn: (keyId: string) => revokeApiKey(keyId, getToken),
    onSuccess: (_, keyId) => {
      queryClient.invalidateQueries({ queryKey: API_KEYS_QUERY_KEY })
      toast.success('API key revoked', {
        description: 'This action can be undone within 10 seconds',
        action: {
          label: 'Undo',
          onClick: () => restoreMutation.mutate(keyId),
        },
        duration: 10000, // Match restore window
      })
    },
    onError: (error: Error) => {
      toast.error('Failed to revoke API key', {
        description: error.message || 'An unexpected error occurred',
      })
    },
  })

  // Mutation for restoring key
  const restoreMutation = useMutation({
    mutationFn: (keyId: string) => restoreApiKey(keyId, getToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: API_KEYS_QUERY_KEY })
      toast.success('API key restored', {
        description: 'Your API key is active again',
      })
    },
    onError: (error: Error) => {
      toast.error('Failed to restore API key', {
        description: error.message || 'An unexpected error occurred',
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
