import { useFormSubmit } from './useFormSubmit'

import { API_ENDPOINTS } from '@/utils/apiConfig'

export interface ContactFormData {
  name: string
  email: string
  phone?: string
  company?: string
  message: string
}

/**
 * Contact form submission hook
 * Uses Vercel serverless functions
 */
export const useContactForm = () => {
  return useFormSubmit<ContactFormData>({
    primaryEndpoint: API_ENDPOINTS.contact,
    fallbackEndpoint: API_ENDPOINTS.contact, // No fallback needed - unified backend
    enableFallback: false,
    errorMessage: "Erreur lors de l'envoi du formulaire de contact",
  })
}
