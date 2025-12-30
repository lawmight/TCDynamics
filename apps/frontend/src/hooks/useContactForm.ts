import { useFormSubmit } from './useFormSubmit'

import { API_ENDPOINTS } from '@/utils/apiConfig'

export interface ContactFormData {
  name: string
  email: string
  phone?: string
  company?: string
  message: string
  captchaToken?: string
}

/**
 * Contact form submission hook
 * Uses Vercel serverless functions
 */
export const useContactForm = () => {
  const formSubmit = useFormSubmit<ContactFormData>({
    primaryEndpoint: API_ENDPOINTS.contact,
    fallbackEndpoint: API_ENDPOINTS.contact, // No fallback needed - unified backend
    enableFallback: false,
    errorMessage: "Erreur lors de l'envoi du formulaire de contact",
  })

  // Wrap submitForm to add formType
  const originalSubmitForm = formSubmit.submitForm
  const submitForm = async (
    data: ContactFormData,
    options?: Parameters<typeof originalSubmitForm>[1]
  ) => {
    return originalSubmitForm({ ...data, formType: 'contact' }, options)
  }

  return {
    ...formSubmit,
    submitForm,
  }
}
