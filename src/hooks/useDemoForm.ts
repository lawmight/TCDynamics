import { API_ENDPOINTS, apiRequest, type ApiResponse } from '@/utils/apiConfig'
import { logger } from '@/utils/logger'
import { useState } from 'react'

interface DemoFormData {
  name: string
  email: string
  phone?: string
  company?: string
  employeeCount?: string
  industry?: string
  message?: string
}

export const useDemoForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [response, setResponse] = useState<ApiResponse | null>(null)

  const submitForm = async (data: DemoFormData): Promise<ApiResponse> => {
    setIsSubmitting(true)
    setResponse(null)

    try {
      // Try Azure Functions first, fallback to Node.js backend
      let result: ApiResponse

      try {
        result = await apiRequest<ApiResponse>(API_ENDPOINTS.azureDemo, {
          method: 'POST',
          body: JSON.stringify(data),
        })
      } catch (azureError) {
        // Fallback to Node.js backend if Azure Functions fail
        logger.warn(
          'Azure Functions not available, falling back to Node.js backend',
          azureError
        )
        result = await apiRequest<ApiResponse>(API_ENDPOINTS.demo, {
          method: 'POST',
          body: JSON.stringify(data),
        })
      }

      setResponse(result)
      setIsSubmitting(false)
      return result
    } catch (error) {
      const errorResponse: ApiResponse = {
        success: false,
        message:
          error instanceof Error ? error.message : 'Une erreur est survenue',
        errors: [error instanceof Error ? error.message : 'Erreur inconnue'],
      }
      setResponse(errorResponse)
      setIsSubmitting(false)
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
