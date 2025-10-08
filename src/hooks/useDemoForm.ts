import { API_ENDPOINTS } from '@/utils/apiConfig'
import { useFormSubmit } from './useFormSubmit'

export interface DemoFormData {
  name: string
  email: string
  phone?: string
  company?: string
  employeeCount?: string
  industry?: string
  message?: string
}

/**
 * Demo request form submission hook
 * Uses unified form submission with Azure Functions primary + Node.js fallback
 */
export const useDemoForm = () => {
  return useFormSubmit<DemoFormData>({
    primaryEndpoint: API_ENDPOINTS.azureDemo,
    fallbackEndpoint: API_ENDPOINTS.demo,
    enableFallback: true,
    errorMessage: "Erreur lors de l'envoi de la demande de démo",
  })
}
