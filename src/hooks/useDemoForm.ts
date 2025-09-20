import { useState } from 'react'
import {
  demoAPI,
  type DemoFormData,
  type ApiResponse,
} from '@/api/azureServices'

export const useDemoForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [response, setResponse] = useState<ApiResponse | null>(null)

  const submitForm = async (data: DemoFormData): Promise<ApiResponse> => {
    setIsSubmitting(true)
    setResponse(null)

    const result = await demoAPI.submitDemoForm(data)
    setResponse(result)

    setIsSubmitting(false)
    return result
  }

  const clearResponse = () => {
    setResponse(null)
  }

  const hasErrors = response?.success === false
  const isSuccess = response?.success === true

  return {
    submitForm,
    isSubmitting,
    response,
    clearResponse,
    hasErrors,
    isSuccess,
    errors: response?.errors || [],
    message: response?.message || '',
  }
}
