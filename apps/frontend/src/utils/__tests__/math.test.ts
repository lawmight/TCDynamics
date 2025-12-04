import { describe, it, expect } from 'vitest'

import { add } from '@/utils/math'

describe('add', () => {
  it('sums two positive integers', () => {
    expect(add(1, 2)).toBe(3)
  })

  it('handles zero and negatives', () => {
    expect(add(0, 5)).toBe(5)
    expect(add(-2, 2)).toBe(0)
  })

  it('handles floating point numbers', () => {
    expect(add(0.1, 0.2)).toBeCloseTo(0.3, 5)
  })
})
