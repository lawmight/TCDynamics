import { API_ENDPOINTS } from '@/utils/apiConfig'
import { useFormSubmit } from './useFormSubmit'

export interface ContactFormData {
  name: string
  email: string
  phone?: string
  company?: string
  message: string
}

/**
 * Contact form submission hook
 * Uses unified form submission with Azure Functions primary + Node.js fallback
 */
export const useContactForm = () => {
  return useFormSubmit<ContactFormData>({
    primaryEndpoint: API_ENDPOINTS.azureContact,
    fallbackEndpoint: API_ENDPOINTS.contact,
    enableFallback: true,
    errorMessage: "Erreur lors de l'envoi du formulaire de contact",
  })
}
