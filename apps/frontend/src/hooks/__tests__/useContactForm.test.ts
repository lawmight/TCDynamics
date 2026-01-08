import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useContactForm, type ContactFormData } from '../useContactForm'

import * as apiConfig from '@/utils/apiConfig'

vi.mock('@vercel/analytics', () => ({
  track: vi.fn(),
}))

// Mock modules
vi.mock('@/utils/apiConfig', async () => {
  const actual = await vi.importActual('@/utils/apiConfig')
  return {
    ...actual,
    apiRequest: vi.fn(),
  }
})

vi.mock('@/utils/logger', () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}))

describe('useContactForm', () => {
  const mockApiRequest = apiConfig.apiRequest as unknown as ReturnType<
    typeof vi.fn
  >

  const mockContactData: ContactFormData = {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+33123456789',
    company: 'Test Corp',
    message: 'Test message',
  }

  const mockSuccessResponse = {
    success: true,
    message: 'Message envoyé avec succès',
    messageId: '123',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useContactForm())

    expect(result.current.isSubmitting).toBe(false)
    expect(result.current.response).toBe(null)
    expect(result.current.hasErrors).toBe(false)
    expect(result.current.isSuccess).toBe(false)
    expect(result.current.errors).toEqual([])
    expect(result.current.message).toBe('')
  })

  it('should submit contact form successfully', async () => {
    mockApiRequest.mockResolvedValueOnce(mockSuccessResponse)

    const { result } = renderHook(() => useContactForm())

    let response
    await act(async () => {
      response = await result.current.submitForm(mockContactData)
    })

    expect(response).toEqual(mockSuccessResponse)
    expect(result.current.isSuccess).toBe(true)
    expect(result.current.hasErrors).toBe(false)
  })

  it('should call contact endpoint with payload', async () => {
    mockApiRequest.mockResolvedValueOnce(mockSuccessResponse)

    const { result } = renderHook(() => useContactForm())

    await act(async () => {
      await result.current.submitForm(mockContactData)
    })

    expect(mockApiRequest).toHaveBeenCalledWith(
      apiConfig.API_ENDPOINTS.contact,
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"formType":"contact"'),
      })
    )
  })

  it('should surface server errors without fallback', async () => {
    const serverError = new Response(null, { status: 503 })
    mockApiRequest.mockRejectedValueOnce(serverError)

    const { result } = renderHook(() => useContactForm())

    await act(async () => {
      await result.current.submitForm(mockContactData)
    })

    expect(mockApiRequest).toHaveBeenCalledTimes(1)
    expect(result.current.hasErrors).toBe(true)
    expect(result.current.isSuccess).toBe(false)
  })

  it('should handle validation errors', async () => {
    const validationError = new Error('Email invalide')
    mockApiRequest.mockRejectedValue(validationError)

    const { result } = renderHook(() => useContactForm())

    await act(async () => {
      await result.current.submitForm(mockContactData)
    })

    expect(result.current.hasErrors).toBe(true)
    expect(result.current.message).toBe('Email invalide')
  })

  it('should clear response', async () => {
    mockApiRequest.mockResolvedValueOnce(mockSuccessResponse)

    const { result } = renderHook(() => useContactForm())

    await act(async () => {
      await result.current.submitForm(mockContactData)
    })

    expect(result.current.response).not.toBe(null)

    act(() => {
      result.current.clearResponse()
    })

    expect(result.current.response).toBe(null)
  })

  it('should handle minimal contact data', async () => {
    mockApiRequest.mockResolvedValueOnce(mockSuccessResponse)

    const minimalData: ContactFormData = {
      name: 'Jane',
      email: 'jane@test.com',
      message: 'Hello',
    }

    const { result } = renderHook(() => useContactForm())

    await act(async () => {
      await result.current.submitForm(minimalData)
    })

    expect(result.current.isSuccess).toBe(true)
  })
})
