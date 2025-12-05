import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useDemoForm, type DemoFormData } from '../useDemoForm'

import * as apiConfig from '@/utils/apiConfig'

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

describe('useDemoForm', () => {
  const mockApiRequest = apiConfig.apiRequest as unknown as ReturnType<
    typeof vi.fn
  >

  const mockDemoData: DemoFormData = {
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+33987654321',
    company: 'Demo Corp',
    employeeCount: '50-200',
    industry: 'Technology',
    message: 'Interested in demo',
  }

  const mockSuccessResponse = {
    success: true,
    message: 'Demande de démo envoyée avec succès',
    messageId: '456',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useDemoForm())

    expect(result.current.isSubmitting).toBe(false)
    expect(result.current.response).toBe(null)
    expect(result.current.hasErrors).toBe(false)
    expect(result.current.isSuccess).toBe(false)
    expect(result.current.errors).toEqual([])
    expect(result.current.message).toBe('')
  })

  it('should submit demo form successfully', async () => {
    mockApiRequest.mockResolvedValueOnce(mockSuccessResponse)

    const { result } = renderHook(() => useDemoForm())

    let response
    await act(async () => {
      response = await result.current.submitForm(mockDemoData)
    })

    expect(response).toEqual(mockSuccessResponse)
    expect(result.current.isSuccess).toBe(true)
    expect(result.current.hasErrors).toBe(false)
  })

  it('should call demo endpoint with payload', async () => {
    mockApiRequest.mockResolvedValueOnce(mockSuccessResponse)

    const { result } = renderHook(() => useDemoForm())

    await act(async () => {
      await result.current.submitForm(mockDemoData)
    })

    expect(mockApiRequest).toHaveBeenCalledWith(
      apiConfig.API_ENDPOINTS.demo,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(mockDemoData),
      })
    )
  })

  it('should surface server errors without fallback', async () => {
    const serverError = new Response(null, { status: 500 })
    mockApiRequest.mockRejectedValueOnce(serverError)

    const { result } = renderHook(() => useDemoForm())

    await act(async () => {
      await result.current.submitForm(mockDemoData)
    })

    expect(mockApiRequest).toHaveBeenCalledTimes(1)
    expect(result.current.hasErrors).toBe(true)
    expect(result.current.isSuccess).toBe(false)
  })

  it('should handle validation errors', async () => {
    const validationError = new Error('Email invalide')
    mockApiRequest.mockRejectedValue(validationError)

    const { result } = renderHook(() => useDemoForm())

    await act(async () => {
      await result.current.submitForm(mockDemoData)
    })

    expect(result.current.hasErrors).toBe(true)
    expect(result.current.message).toBe('Email invalide')
  })

  it('should clear response', async () => {
    mockApiRequest.mockResolvedValueOnce(mockSuccessResponse)

    const { result } = renderHook(() => useDemoForm())

    await act(async () => {
      await result.current.submitForm(mockDemoData)
    })

    expect(result.current.response).not.toBe(null)

    act(() => {
      result.current.clearResponse()
    })

    expect(result.current.response).toBe(null)
  })

  it('should handle minimal demo data', async () => {
    mockApiRequest.mockResolvedValueOnce(mockSuccessResponse)

    const minimalData: DemoFormData = {
      name: 'John',
      email: 'john@test.com',
    }

    const { result } = renderHook(() => useDemoForm())

    await act(async () => {
      await result.current.submitForm(minimalData)
    })

    expect(result.current.isSuccess).toBe(true)
  })

  it('should handle all optional fields', async () => {
    mockApiRequest.mockResolvedValueOnce(mockSuccessResponse)

    const fullData: DemoFormData = {
      name: 'Full Name',
      email: 'full@test.com',
      phone: '+33111111111',
      company: 'Full Company',
      employeeCount: '1000+',
      industry: 'Finance',
      message: 'Full message here',
    }

    const { result } = renderHook(() => useDemoForm())

    await act(async () => {
      await result.current.submitForm(fullData)
    })

    expect(mockApiRequest).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: JSON.stringify(fullData),
      })
    )
  })
})
