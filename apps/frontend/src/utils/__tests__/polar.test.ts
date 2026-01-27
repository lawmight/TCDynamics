import { describe, expect, it, vi } from 'vitest'

describe('polar utilities', () => {
  it('formats prices and handles missing auth', async () => {
    vi.stubEnv('VITE_POLAR_PRODUCT_STARTER', 'prod_starter')
    vi.stubEnv('VITE_POLAR_PRODUCT_PROFESSIONAL', 'prod_pro')

    const polar = await import('../polar')

    expect(polar.formatPrice(null)).toBe('Sur mesure')
    expect(polar.formatPrice(29, 'USD')).toBe('$29.00')

    const result = await polar.redirectToCheckout('starter', async () => null)
    expect(result.authRequired).toBe(true)
  })
})
