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
 * Contact form submission data with formType field
 */
export interface ContactFormSubmission extends ContactFormData {
  formType: 'contact'
}

/**
 * Contact form submission hook
 * Uses Vercel serverless functions
 */
export const useContactForm = () => {
  const formSubmit = useFormSubmit<ContactFormSubmission>({
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
    const submissionData: ContactFormSubmission = {
      ...data,
      formType: 'contact',
    }
    return originalSubmitForm(submissionData, options)
  }

  return {
    ...formSubmit,
    submitForm,
  }
}
