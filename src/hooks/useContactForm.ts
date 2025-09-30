import { useState } from 'react'
import { API_ENDPOINTS, apiRequest, type ApiResponse } from '@/utils/apiConfig'

interface ContactFormData {
  name: string
  email: string
  phone?: string
  company?: string
  message: string
}

export const useContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [response, setResponse] = useState<ApiResponse | null>(null)

  const submitForm = async (data: ContactFormData): Promise<ApiResponse> => {
    setIsSubmitting(true)
    setResponse(null)

    try {
      const result = await apiRequest<ApiResponse>(API_ENDPOINTS.contact, {
        method: 'POST',
        body: JSON.stringify(data),
      })
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
