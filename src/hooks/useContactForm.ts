import { useState } from 'react'
import { contactAPI, type ContactFormData, type ContactResponse } from '@/api/azureServices'

export const useContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [response, setResponse] = useState<ContactResponse | null>(null)

  const submitForm = async (data: ContactFormData): Promise<ContactResponse> => {
    setIsSubmitting(true)
    setResponse(null)

    try {
      const result = await contactAPI.submitContactForm(data)
      setResponse(result)
      return result
    } catch (error) {
      const errorResponse: ContactResponse = {
        success: false,
        message: 'Une erreur est survenue. Veuillez réessayer.',
        errors: [error instanceof Error ? error.message : 'Erreur inconnue']
      }
      setResponse(errorResponse)
      return errorResponse
    } finally {
      setIsSubmitting(false)
    }
  }

  const clearResponse = () => {
    setResponse(null)
  }

  return {
    submitForm,
    isSubmitting,
    response,
    clearResponse
  }
}
