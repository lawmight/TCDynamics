import { useState } from 'react'

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
  messageId?: string
  errors?: string[]
}

export const useDemoForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [response, setResponse] = useState<DemoResponse | null>(null)

  const submitForm = async (data: DemoData): Promise<DemoResponse> => {
    setIsSubmitting(true)
    setResponse(null)

    try {
      const response = await fetch('http://localhost:3001/api/demo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

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
