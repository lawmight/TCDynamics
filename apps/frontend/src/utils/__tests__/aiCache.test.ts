import { describe, expect, it, vi } from 'vitest'

import { callOpenAIWithCache, getFreeTierStatus } from '../aiCache'

describe('aiCache utilities', () => {
  it('caches OpenAI responses between calls', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      json: async () => ({
        choices: [{ message: { content: 'hello' } }],
        usage: { total_tokens: 10 },
      }),
    })
    Object.defineProperty(global, 'fetch', {
      value: mockFetch,
      writable: true,
    })

    const first = await callOpenAIWithCache('prompt')
    const second = await callOpenAIWithCache('prompt')

    expect(first.cached).toBe(false)
    expect(second.cached).toBe(true)
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it('reports free tier usage from localStorage', () => {
    localStorage.setItem('current_month_tokens', '1000')

    const status = getFreeTierStatus()

    expect(status.tokensUsed).toBe(1000)
    expect(status.tokensRemaining).toBeGreaterThan(0)
    expect(status.withinFreeLimit).toBe(true)
  })
})
