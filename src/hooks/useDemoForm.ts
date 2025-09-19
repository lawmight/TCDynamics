import { useState } from 'react'
import { demoAPI, type DemoFormData, type DemoResponse } from '@/api/azureServices'

export const useDemoForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [response, setResponse] = useState<DemoResponse | null>(null)

  const submitForm = async (data: DemoFormData): Promise<DemoResponse> => {
    setIsSubmitting(true)
    setResponse(null)

    try {
      const result = await demoAPI.submitDemoForm(data)
      setResponse(result)
      return result
    } catch (error) {
      const errorResponse: DemoResponse = {
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
