import { useFormSubmit } from './useFormSubmit'

import { API_ENDPOINTS } from '@/utils/apiConfig'

export interface DemoFormData {
  name: string
  email: string
  phone?: string
  company?: string
  employeeCount?: string
  industry?: string
  message?: string
  captchaToken?: string
}

/**
 * Demo request form submission hook
 * Uses Vercel serverless functions
 */
export const useDemoForm = () => {
  return useFormSubmit<DemoFormData>({
    primaryEndpoint: API_ENDPOINTS.demo,
    fallbackEndpoint: API_ENDPOINTS.demo, // No fallback needed - unified backend
    enableFallback: false,
    errorMessage: "Erreur lors de l'envoi de la demande de démo",
  })
}
