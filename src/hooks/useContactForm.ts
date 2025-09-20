import { useState } from 'react'
import {
  contactAPI,
  type ContactFormData,
  type ApiResponse,
} from '@/api/azureServices'

export const useContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [response, setResponse] = useState<ApiResponse | null>(null)

  const submitForm = async (data: ContactFormData): Promise<ApiResponse> => {
    setIsSubmitting(true)
    setResponse(null)

    const result = await contactAPI.submitContactForm(data)
    setResponse(result)

    setIsSubmitting(false)
    return result
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
