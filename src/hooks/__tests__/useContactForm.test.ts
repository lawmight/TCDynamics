import { renderHook, act } from '@testing-library/react'
import { vi } from 'vitest'
import { useContactForm } from '../useContactForm'

// Mock fetch
global.fetch = vi.fn()

// Mock environment variables
vi.mock('import.meta', () => ({
  env: {
    VITE_API_URL: 'http://localhost:3001',
  },
}))

// Mock the CSRF token function
vi.mock('../../utils/csrf', () => ({
  getCsrfToken: vi.fn().mockResolvedValue('mock-csrf-token'),
}))

describe('useContactForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should submit form successfully', async () => {
    const mockResponse = {
      success: true,
      message: 'Message envoyé avec succès',
    }

    ;(fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    const { result } = renderHook(() => useContactForm())

    await act(async () => {
      await result.current.submitForm({
        name: 'Test User',
        email: 'test@example.com',
        message: 'Test message',
      })
    })

    expect(result.current.response).toEqual(mockResponse)
    expect(result.current.isSubmitting).toBe(false)
  })

  it('should handle errors', async () => {
    ;(fetch as any).mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useContactForm())

    await act(async () => {
      await result.current.submitForm({
        name: 'Test User',
        email: 'test@example.com',
        message: 'Test message',
      })
    })

    expect(result.current.response?.success).toBe(false)
    expect(result.current.response?.message).toContain('Network error')
  })

  it('should handle validation errors', async () => {
    const mockResponse = {
      success: false,
      message: 'Validation error: response.text is not a function',
      errors: ['response.text is not a function'],
    }

    ;(fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => mockResponse,
    })

    const { result } = renderHook(() => useContactForm())

    await act(async () => {
      await result.current.submitForm({
        name: 'Test User',
        email: 'test@example.com',
        message: 'Test message',
      })
    })

    expect(result.current.response?.success).toBe(false)
    expect(result.current.response?.errors).toBeDefined()
    expect(result.current.isSubmitting).toBe(false)
  })
})
