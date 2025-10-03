// src/hooks/useFormSubmission.ts
// Optimized form submission hook with performance improvements

import { useState, useCallback, useRef } from 'react'
import { API_ENDPOINTS, apiRequest, type ApiResponse } from '@/utils/apiConfig'

interface FormSubmissionOptions {
  endpoint: string
  timeoutMs?: number
  retryAttempts?: number
}

interface FormState {
  isSubmitting: boolean
  response: ApiResponse | null
  error: string | null
  retryCount: number
}

export const useFormSubmission = <T extends Record<string, unknown>>(
  options: FormSubmissionOptions
) => {
  const { endpoint, timeoutMs = 30000, retryAttempts = 3 } = options

  const [state, setState] = useState<FormState>({
    isSubmitting: false,
    response: null,
    error: null,
    retryCount: 0,
  })

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const clearTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const abortRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
  }, [])

  const submitForm = useCallback(
    async (data: T): Promise<ApiResponse> => {
      // Cleanup previous request
      clearTimeout()
      abortRequest()

      setState(prev => ({
        ...prev,
        isSubmitting: true,
        response: null,
        error: null,
      }))

      // Create new abort controller for this request
      abortControllerRef.current = new AbortController()

      try {
        // Set timeout
        timeoutRef.current = setTimeout(() => {
          abortControllerRef.current?.abort()
        }, timeoutMs)

        const result = await apiRequest<ApiResponse>(endpoint, {
          method: 'POST',
          body: JSON.stringify(data),
          signal: abortControllerRef.current.signal,
        })

        setState(prev => ({
          ...prev,
          isSubmitting: false,
          response: result,
          retryCount: 0,
        }))

        clearTimeout()
        return result
      } catch (error) {
        clearTimeout()

        const isAborted = error instanceof Error && error.name === 'AbortError'
        const shouldRetry = !isAborted && state.retryCount < retryAttempts

        if (shouldRetry) {
          setState(prev => ({
            ...prev,
            retryCount: prev.retryCount + 1,
          }))

          // Exponential backoff retry
          const delay = Math.pow(2, state.retryCount) * 1000
          await new Promise(resolve => setTimeout(resolve, delay))
          return submitForm(data)
        }

        const errorResponse: ApiResponse = {
          success: false,
          message: isAborted
            ? 'Request timeout'
            : error instanceof Error
              ? error.message
              : 'Une erreur est survenue',
          errors: [error instanceof Error ? error.message : 'Erreur inconnue'],
        }

        setState(prev => ({
          ...prev,
          isSubmitting: false,
          response: errorResponse,
          error: errorResponse.message,
        }))

        return errorResponse
      }
    },
    [
      endpoint,
      timeoutMs,
      retryAttempts,
      state.retryCount,
      clearTimeout,
      abortRequest,
    ]
  )

  const clearResponse = useCallback(() => {
    setState(prev => ({
      ...prev,
      response: null,
      error: null,
    }))
  }, [])

  const reset = useCallback(() => {
    clearTimeout()
    abortRequest()
    setState({
      isSubmitting: false,
      response: null,
      error: null,
      retryCount: 0,
    })
  }, [clearTimeout, abortRequest])

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    clearTimeout()
    abortRequest()
  }, [clearTimeout, abortRequest])

  return {
    submitForm,
    clearResponse,
    reset,
    cleanup,
    isSubmitting: state.isSubmitting,
    response: state.response,
    error: state.error,
    hasErrors: state.response?.success === false,
    isSuccess: state.response?.success === true,
    errors: state.response?.errors || [],
    message: state.response?.message || '',
    retryCount: state.retryCount,
  }
}

// Optimized contact form hook
export const useContactForm = () => {
  return useFormSubmission<{
    name: string
    email: string
    phone?: string
    company?: string
    message: string
  }>({
    endpoint: API_ENDPOINTS.contact,
  })
}

// Optimized demo form hook
export const useDemoForm = () => {
  return useFormSubmission<{
    name: string
    email: string
    phone?: string
    company?: string
    employeeCount?: string
    industry?: string
    message?: string
  }>({
    endpoint: API_ENDPOINTS.demo,
  })
}
