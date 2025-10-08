import * as apiConfig from '@/utils/apiConfig'
import * as logger from '@/utils/logger'
import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useFormSubmit } from '../useFormSubmit'

// Mock modules
vi.mock('@/utils/apiConfig', async () => {
  const actual = await vi.importActual('@/utils/apiConfig')
  return {
    ...actual,
    apiRequest: vi.fn(),
  }
})

// Mock logger
vi.mock('@/utils/logger', () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}))

describe('useFormSubmit', () => {
  const mockApiRequest = apiConfig.apiRequest as unknown as ReturnType<
    typeof vi.fn
  >
  const mockLogger = logger.logger

  const mockConfig = {
    primaryEndpoint: 'https://primary.com/api',
    fallbackEndpoint: 'https://fallback.com/api',
  }

  const mockFormData = {
    name: 'John Doe',
    email: 'john@example.com',
  }

  const mockSuccessResponse = {
    success: true,
    message: 'Success',
    messageId: '123',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Successful Submissions', () => {
    it('should submit form successfully to primary endpoint', async () => {
      mockApiRequest.mockResolvedValueOnce(mockSuccessResponse)

      const { result } = renderHook(() => useFormSubmit(mockConfig))

      expect(result.current.isSubmitting).toBe(false)
      expect(result.current.response).toBe(null)

      let response
      await act(async () => {
        response = await result.current.submitForm(mockFormData)
      })

      expect(mockApiRequest).toHaveBeenCalledTimes(1)
      expect(mockApiRequest).toHaveBeenCalledWith(mockConfig.primaryEndpoint, {
        method: 'POST',
        body: JSON.stringify(mockFormData),
      })

      expect(response).toEqual(mockSuccessResponse)
      expect(result.current.isSubmitting).toBe(false)
      expect(result.current.isSuccess).toBe(true)
      expect(result.current.hasErrors).toBe(false)
      expect(result.current.message).toBe('Success')
    })

    it('should call onSuccess callback when submission succeeds', async () => {
      mockApiRequest.mockResolvedValueOnce(mockSuccessResponse)
      const onSuccess = vi.fn()

      const { result } = renderHook(() => useFormSubmit(mockConfig))

      await act(async () => {
        await result.current.submitForm(mockFormData, { onSuccess })
      })

      expect(onSuccess).toHaveBeenCalledWith(mockSuccessResponse)
    })
  })

  describe('Fallback Behavior', () => {
    it('should fallback to secondary endpoint on primary 5xx error', async () => {
      const serverError = new Response(null, { status: 500 })
      mockApiRequest
        .mockRejectedValueOnce(serverError)
        .mockResolvedValueOnce(mockSuccessResponse)

      const { result } = renderHook(() => useFormSubmit(mockConfig))

      await act(async () => {
        await result.current.submitForm(mockFormData)
      })

      expect(mockApiRequest).toHaveBeenCalledTimes(2)
      expect(mockApiRequest).toHaveBeenNthCalledWith(
        1,
        mockConfig.primaryEndpoint,
        {
          method: 'POST',
          body: JSON.stringify(mockFormData),
        }
      )
      expect(mockApiRequest).toHaveBeenNthCalledWith(
        2,
        mockConfig.fallbackEndpoint,
        {
          method: 'POST',
          body: JSON.stringify(mockFormData),
        }
      )

      expect(mockLogger.warn).toHaveBeenCalled()
      expect(result.current.isSuccess).toBe(true)
    })

    it('should fallback on network errors', async () => {
      const networkError = new Error('Network failure')
      mockApiRequest
        .mockRejectedValueOnce(networkError)
        .mockResolvedValueOnce(mockSuccessResponse)

      const { result } = renderHook(() => useFormSubmit(mockConfig))

      await act(async () => {
        await result.current.submitForm(mockFormData)
      })

      expect(mockApiRequest).toHaveBeenCalledTimes(2)
      expect(result.current.isSuccess).toBe(true)
    })

    it('should NOT fallback on 4xx client errors', async () => {
      const clientError = new Response(
        JSON.stringify({ message: 'Invalid email' }),
        { status: 400 }
      )
      mockApiRequest.mockRejectedValueOnce(clientError)

      const { result } = renderHook(() => useFormSubmit(mockConfig))

      await act(async () => {
        await result.current.submitForm(mockFormData)
      })

      expect(mockApiRequest).toHaveBeenCalledTimes(1)
      expect(result.current.hasErrors).toBe(true)
    })

    it('should respect custom shouldFallback function', async () => {
      const customError = new Response(null, { status: 403 })
      mockApiRequest
        .mockRejectedValueOnce(customError)
        .mockResolvedValueOnce(mockSuccessResponse)

      const shouldFallback = vi.fn().mockReturnValue(true)

      const { result } = renderHook(() => useFormSubmit(mockConfig))

      await act(async () => {
        await result.current.submitForm(mockFormData, { shouldFallback })
      })

      expect(shouldFallback).toHaveBeenCalledWith(customError)
      expect(mockApiRequest).toHaveBeenCalledTimes(2)
      expect(result.current.isSuccess).toBe(true)
    })

    it('should NOT fallback when enableFallback is false', async () => {
      const serverError = new Response(null, { status: 500 })
      mockApiRequest.mockRejectedValueOnce(serverError)

      const configNoFallback = {
        ...mockConfig,
        enableFallback: false,
      }

      const { result } = renderHook(() => useFormSubmit(configNoFallback))

      await act(async () => {
        await result.current.submitForm(mockFormData)
      })

      expect(mockApiRequest).toHaveBeenCalledTimes(1)
      expect(result.current.hasErrors).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('should handle errors and set error state', async () => {
      const errorMessage = 'Submission failed'
      mockApiRequest.mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useFormSubmit(mockConfig))

      await act(async () => {
        await result.current.submitForm(mockFormData)
      })

      expect(result.current.hasErrors).toBe(true)
      expect(result.current.isSuccess).toBe(false)
      expect(result.current.message).toBe(errorMessage)
      expect(result.current.errors).toEqual([errorMessage])
    })

    it('should call onError callback when submission fails', async () => {
      const error = new Error('Test error')
      mockApiRequest.mockRejectedValue(error)
      const onError = vi.fn()

      const { result } = renderHook(() => useFormSubmit(mockConfig))

      await act(async () => {
        await result.current.submitForm(mockFormData, { onError })
      })

      expect(onError).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          success: false,
          message: 'Test error',
        })
      )
    })

    it('should use custom error message from config', async () => {
      mockApiRequest.mockRejectedValue(new Error('Network error'))

      const customConfig = {
        ...mockConfig,
        errorMessage: 'Custom error message',
      }

      const { result } = renderHook(() => useFormSubmit(customConfig))

      await act(async () => {
        await result.current.submitForm(mockFormData)
      })

      // The actual error message from the Error should be used
      expect(result.current.message).toBe('Network error')
    })
  })

  describe('State Management', () => {
    it('should set isSubmitting during submission', async () => {
      let resolveRequest: (value: unknown) => void
      const pendingPromise = new Promise(resolve => {
        resolveRequest = resolve
      })
      mockApiRequest.mockReturnValue(pendingPromise)

      const { result } = renderHook(() => useFormSubmit(mockConfig))

      expect(result.current.isSubmitting).toBe(false)

      act(() => {
        result.current.submitForm(mockFormData)
      })

      await waitFor(() => {
        expect(result.current.isSubmitting).toBe(true)
      })

      await act(async () => {
        resolveRequest(mockSuccessResponse)
        await pendingPromise
      })

      expect(result.current.isSubmitting).toBe(false)
    })

    it('should clear response when clearResponse is called', async () => {
      mockApiRequest.mockResolvedValueOnce(mockSuccessResponse)

      const { result } = renderHook(() => useFormSubmit(mockConfig))

      await act(async () => {
        await result.current.submitForm(mockFormData)
      })

      expect(result.current.response).toEqual(mockSuccessResponse)

      act(() => {
        result.current.clearResponse()
      })

      expect(result.current.response).toBe(null)
      expect(result.current.hasErrors).toBe(false)
      expect(result.current.isSuccess).toBe(false)
    })

    it('should reset response on new submission', async () => {
      mockApiRequest.mockResolvedValue(mockSuccessResponse)

      const { result } = renderHook(() => useFormSubmit(mockConfig))

      // First submission
      await act(async () => {
        await result.current.submitForm(mockFormData)
      })

      expect(result.current.response).toEqual(mockSuccessResponse)

      // Second submission should clear previous response
      await act(async () => {
        await result.current.submitForm({ ...mockFormData, name: 'Jane' })
      })

      expect(result.current.response).toEqual(mockSuccessResponse)
      expect(mockApiRequest).toHaveBeenCalledTimes(2)
    })
  })

  describe('TypeScript Generics', () => {
    it('should work with typed form data', async () => {
      interface CustomFormData {
        customField: string
        numericField: number
      }

      mockApiRequest.mockResolvedValueOnce(mockSuccessResponse)

      const { result } = renderHook(() =>
        useFormSubmit<CustomFormData>(mockConfig)
      )

      const customData: CustomFormData = {
        customField: 'test',
        numericField: 123,
      }

      await act(async () => {
        await result.current.submitForm(customData)
      })

      expect(mockApiRequest).toHaveBeenCalledWith(mockConfig.primaryEndpoint, {
        method: 'POST',
        body: JSON.stringify(customData),
      })
    })
  })
})
