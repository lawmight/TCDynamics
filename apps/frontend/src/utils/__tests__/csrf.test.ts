import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'

import { getCsrfToken, clearCsrfToken } from '../csrf'

describe('CSRF Token Utilities', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    clearCsrfToken()
    global.fetch = vi.fn()
  })

  afterEach(() => {
    global.fetch = originalFetch
    clearCsrfToken()
  })

  it('should fetch and cache CSRF token', async () => {
    const mockToken = 'test-csrf-token-123'
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ csrfToken: mockToken }),
    })

    const token = await getCsrfToken()

    expect(token).toBe(mockToken)
    expect(global.fetch).toHaveBeenCalledWith('/api/csrf-token')
  })

  it('should return cached token on subsequent calls', async () => {
    const mockToken = 'test-csrf-token-456'
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ csrfToken: mockToken }),
    })

    const token1 = await getCsrfToken()
    const token2 = await getCsrfToken()

    expect(token1).toBe(mockToken)
    expect(token2).toBe(mockToken)
    // Should only fetch once
    expect(global.fetch).toHaveBeenCalledTimes(1)
  })

  it('should return empty string on fetch error', async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Network error')
    )

    const token = await getCsrfToken()

    expect(token).toBe('')
  })

  it('should return empty string on non-ok response', async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 500,
    })

    const token = await getCsrfToken()

    expect(token).toBe('')
  })

  it('should clear cached token', async () => {
    const mockToken = 'test-csrf-token-789'
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ csrfToken: mockToken }),
    })

    await getCsrfToken()
    clearCsrfToken()

    // After clearing, should fetch again
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ csrfToken: 'new-token' }),
    })

    const newToken = await getCsrfToken()

    expect(newToken).toBe('new-token')
    expect(global.fetch).toHaveBeenCalledTimes(2)
  })
})
