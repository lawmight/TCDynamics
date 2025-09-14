import { useState } from 'react'

interface ContactData {
  name: string
  email: string
  phone?: string
  company?: string
  message: string
}

interface ContactResponse {
  success: boolean
  message: string
  messageId?: string
  errors?: string[]
}

export const useContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [response, setResponse] = useState<ContactResponse | null>(null)

  const submitForm = async (data: ContactData): Promise<ContactResponse> => {
    setIsSubmitting(true)
    setResponse(null)

    try {
      const response = await fetch('http://localhost:3001/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result: ContactResponse = await response.json()
      setResponse(result)
      return result
    } catch {
      const errorResponse: ContactResponse = {
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
