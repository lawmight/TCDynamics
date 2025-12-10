import { track } from '@vercel/analytics'
import { useState } from 'react'

import type { ApiResponse } from '@/utils/apiConfig'
import { logger } from '@/utils/logger'

/**
 * Configuration for form submission endpoints
 */
interface FormSubmitConfig {
  /** Primary endpoint (typically Azure Functions) */
  primaryEndpoint: string
  /** Fallback endpoint (typically Node.js backend) */
  fallbackEndpoint: string
  /** Whether to enable automatic fallback on primary endpoint failure */
  enableFallback?: boolean
  /** Custom error message for submission failures */
  errorMessage?: string
}

/**
 * Options for form submission behavior
 */
interface SubmitOptions {
  /** Callback executed on successful submission */
  onSuccess?: (response: ApiResponse) => void
  /** Callback executed on submission error */
  onError?: (error: Error, response: ApiResponse) => void
  /** Whether to check for fallback conditions (default: true for 5xx errors) */
  shouldFallback?: (error: unknown) => boolean
}

/**
 * Return type for the useFormSubmit hook
 */
interface UseFormSubmitReturn<T> {
  /** Function to submit form data */
  submitForm: (data: T, options?: SubmitOptions) => Promise<ApiResponse>
  /** Whether form is currently submitting */
  isSubmitting: boolean
  /** Response from last submission */
  response: ApiResponse | null
  /** Clear the current response */
  clearResponse: () => void
  /** Whether last submission had errors */
  hasErrors: boolean
  /** Whether last submission was successful */
  isSuccess: boolean
  /** Array of error messages from last submission */
  errors: string[]
  /** Message from last submission */
  message: string
}

/**
 * Default fallback condition: fallback on network errors and 5xx server errors
 */
const defaultShouldFallback = (error: unknown): boolean => {
  // Network errors (not a Response)
  const isResponse =
    typeof error === 'object' && error !== null && 'status' in error
  if (!isResponse) {
    return true
  }
  // Service unavailable or server errors
  const err = error as { status?: number }
  return err.status === 503 || (err.status ?? 0) >= 500
}

/**
 * Generic form submission hook with primary/fallback endpoint support
 *
 * @template T - Type of form data being submitted
 * @param config - Configuration for endpoints and behavior
 * @returns Form submission state and controls
 *
 * @example
 * ```tsx
 * const { submitForm, isSubmitting, isSuccess } = useFormSubmit<ContactFormData>({
 *   primaryEndpoint: API_ENDPOINTS.azureContact,
 *   fallbackEndpoint: API_ENDPOINTS.contact,
 * })
 *
 * await submitForm(formData, {
 *   onSuccess: (res) => console.log('Success!', res),
 *   onError: (err) => console.error('Failed!', err)
 * })
 * ```
 */
export const useFormSubmit = <T = Record<string, unknown>>(
  config: FormSubmitConfig
): UseFormSubmitReturn<T> => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [response, setResponse] = useState<ApiResponse | null>(null)

  const {
    primaryEndpoint,
    fallbackEndpoint,
    enableFallback = true,
    errorMessage = 'Une erreur est survenue',
  } = config

  const submitForm = async (
    data: T,
    options: SubmitOptions = {}
  ): Promise<ApiResponse> => {
    const {
      onSuccess,
      onError,
      shouldFallback = defaultShouldFallback,
    } = options

    setIsSubmitting(true)
    setResponse(null)

    // Resolve the (possibly mocked) apiRequest at call time to avoid stale references in tests
    const { apiRequest } = await import('@/utils/apiConfig')

    const performRequest = async () => {
      try {
        return await apiRequest<ApiResponse>(primaryEndpoint, {
          method: 'POST',
          body: JSON.stringify(data),
        })
      } catch (primaryError) {
        const canFallback = enableFallback && shouldFallback(primaryError)
        logger.warn?.(`Primary endpoint failed, evaluating fallback`, {
          primary: primaryEndpoint,
          fallback: fallbackEndpoint,
          error: primaryError,
        })
        if (!canFallback) throw primaryError

        return await apiRequest<ApiResponse>(fallbackEndpoint, {
          method: 'POST',
          body: JSON.stringify(data),
        })
      }
    }

    try {
      const result = await performRequest()
      const safeResult: ApiResponse =
        result ??
        ({
          success: false,
          message: errorMessage,
          errors: [errorMessage],
        } as ApiResponse)

      setResponse(safeResult)
      setIsSubmitting(false)

      if (safeResult.success) {
        try {
          track?.('form_submitted', {
            endpoint: primaryEndpoint,
            timestamp: new Date().toISOString(),
          })
        } catch {
          // Ignore analytics failures in tests/runtime
        }
        onSuccess?.(safeResult)
      } else {
        try {
          track?.('form_error', {
            endpoint: primaryEndpoint,
            errorType: 'validation',
            errorMessage: safeResult.message || 'Validation error',
            timestamp: new Date().toISOString(),
          })
        } catch {
          // Ignore analytics failures
        }
      }

      return safeResult
    } catch (error) {
      const normalizedMessage =
        error instanceof Error ? error.message : errorMessage

      const errorResponse: ApiResponse = {
        success: false,
        message: normalizedMessage,
        errors: [normalizedMessage],
      }

      setResponse(errorResponse)
      setIsSubmitting(false)

      try {
        track?.('form_error', {
          endpoint: primaryEndpoint,
          errorType: 'submission',
          errorMessage: normalizedMessage,
          timestamp: new Date().toISOString(),
        })
      } catch {
        // Ignore analytics failures
      }

      onError?.(
        error instanceof Error ? error : new Error(errorMessage),
        errorResponse
      )

      return errorResponse
    }
  }

  const clearResponse = () => {
    setResponse(null)
  }

  const hasErrors = response?.success === false
  const isSuccess = response?.success === true

  return {
    submitForm,
    isSubmitting,
    response,
    clearResponse,
    hasErrors,
    isSuccess,
    errors: response?.errors || [],
    message: response?.message || '',
  }
}
