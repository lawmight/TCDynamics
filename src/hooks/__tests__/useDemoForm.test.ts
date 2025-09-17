import { renderHook, act } from '@testing-library/react'
import { vi } from 'vitest'
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

    ;(fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    const { result } = renderHook(() => useDemoForm())

    await act(async () => {
      await result.current.submitForm({
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean.dupont@example.com',
        company: 'Test Company',
        phone: '01 23 45 67 89',
        employees: '25',
        needs: "Besoin d'automatisation",
      })
    })

    expect(result.current.response).toEqual(mockResponse)
    expect(result.current.isSubmitting).toBe(false)
  })

  it('should handle network errors', async () => {
    ;(fetch as any).mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useDemoForm())

    await act(async () => {
      await result.current.submitForm({
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean.dupont@example.com',
        company: 'Test Company',
      })
    })

    expect(result.current.response?.success).toBe(false)
    expect(result.current.response?.message).toContain('Erreur de connexion')
  })

  it('should handle server validation errors', async () => {
    const mockResponse = {
      success: false,
      message: 'Données invalides',
      errors: ['Email invalide', 'Entreprise requise'],
    }

    ;(fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    const { result } = renderHook(() => useDemoForm())

    await act(async () => {
      await result.current.submitForm({
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'invalid-email',
        company: '',
      })
    })

    expect(result.current.response).toEqual(mockResponse)
    expect(result.current.isSubmitting).toBe(false)
  })
})
