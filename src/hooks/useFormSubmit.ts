import { apiRequest, type ApiResponse } from '@/utils/apiConfig'
import { logger } from '@/utils/logger'
import { useState } from 'react'

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
  if (!(error instanceof Response)) {
    return true
  }
  // Service unavailable or server errors
  return error.status === 503 || error.status >= 500
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

    try {
      let result: ApiResponse

      try {
        // Attempt primary endpoint first
        result = await apiRequest<ApiResponse>(primaryEndpoint, {
          method: 'POST',
          body: JSON.stringify(data),
        })
      } catch (primaryError) {
        // Check if we should fallback
        const canFallback = enableFallback && shouldFallback(primaryError)

        if (!canFallback) {
          // Surface validation/client errors directly without fallback
          throw primaryError
        }

        // Log fallback attempt
        logger.warn(
          `Primary endpoint failed, falling back to secondary endpoint`,
          {
            primary: primaryEndpoint,
            fallback: fallbackEndpoint,
            error: primaryError,
          }
        )

        // Attempt fallback endpoint
        result = await apiRequest<ApiResponse>(fallbackEndpoint, {
          method: 'POST',
          body: JSON.stringify(data),
        })
      }

      // Success path
      setResponse(result)
      setIsSubmitting(false)

      // Execute success callback
      if (onSuccess && result.success) {
        onSuccess(result)
      }

      return result
    } catch (error) {
      // Error path
      const errorResponse: ApiResponse = {
        success: false,
        message: error instanceof Error ? error.message : errorMessage,
        errors: [error instanceof Error ? error.message : 'Erreur inconnue'],
      }

      setResponse(errorResponse)
      setIsSubmitting(false)

      // Execute error callback
      if (onError) {
        onError(
          error instanceof Error ? error : new Error(errorMessage),
          errorResponse
        )
      }

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
