import { useState } from 'react'
import { getCsrfToken } from '../utils/csrf'

interface DemoData {
  firstName: string
  lastName: string
  email: string
  phone?: string
  company: string
  employees?: string
  needs?: string
}

interface DemoResponse {
  success: boolean
  message: string
  errors?: string[]
}

export const useDemoForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [response, setResponse] = useState<DemoResponse | null>(null)

  const submitForm = async (data: DemoData): Promise<DemoResponse> => {
    setIsSubmitting(true)
    setResponse(null)

    try {
      const csrfToken = await getCsrfToken()
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/demo`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken,
          },
          body: JSON.stringify(data),
        }
      )

      const result: DemoResponse = await response.json()
      setResponse(result)
      return result
    } catch {
      const errorResponse: DemoResponse = {
        success: false,
        message:
          'Erreur de connexion. Veuillez vérifier votre connexion internet.',
      }
      setResponse(errorResponse)
      return errorResponse
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    submitForm,
    isSubmitting,
    response,
    clearResponse: () => setResponse(null),
  }
}
