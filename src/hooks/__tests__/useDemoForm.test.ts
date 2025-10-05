import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useDemoForm } from '../useDemoForm'

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

describe('useDemoForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should submit demo form successfully', async () => {
    const mockResponse = {
      success: true,
      message: 'Demande de démo enregistrée',
    }

    ;(
      fetch as ReturnType<typeof vi.mocked<typeof fetch>>
    ).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response)

    const { result } = renderHook(() => useDemoForm())

    await act(async () => {
      await result.current.submitForm({
        name: 'Jean Dupont',
        email: 'jean.dupont@example.com',
        company: 'Test Company',
        phone: '01 23 45 67 89',
        employeeCount: '25',
        message: "Besoin d'automatisation",
      })
    })

    expect(result.current.response).toEqual(mockResponse)
    expect(result.current.isSubmitting).toBe(false)
  })

  it('should handle network errors', async () => {
    // Mock both Azure Functions and Node.js backend to fail
    vi.mocked(fetch).mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useDemoForm())

    await act(async () => {
      await result.current.submitForm({
        name: 'Jean Dupont',
        email: 'jean.dupont@example.com',
        company: 'Test Company',
      })
    })

    expect(result.current.response?.success).toBe(false)
    expect(result.current.response?.message).toContain('Network error')
  })

  it('should handle server validation errors', async () => {
    const mockResponse = {
      success: false,
      message:
        "Validation error: email: Adresse email invalide, company: Le nom de l'entreprise doit contenir au moins 2 caractères",
      errors: [
        'email: Adresse email invalide',
        "company: Le nom de l'entreprise doit contenir au moins 2 caractères",
      ],
    }

    ;(
      fetch as ReturnType<typeof vi.mocked<typeof fetch>>
    ).mockResolvedValueOnce({
      ok: false,
      json: async () => mockResponse,
    } as Response)

    const { result } = renderHook(() => useDemoForm())

    await act(async () => {
      await result.current.submitForm({
        name: 'Jean Dupont',
        email: 'jean.dupont@example.com',
        company: 'Test Company',
      })
    })

    expect(result.current.response?.success).toBe(false)
    expect(result.current.response?.errors).toBeDefined()
    expect(result.current.isSubmitting).toBe(false)
  })
})
