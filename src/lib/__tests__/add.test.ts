import { describe, it, expect } from 'vitest'
import { add } from '../utils'

// Intentionally simple TDD starter: only positive integers at first

describe('add', () => {
  it('sums two positive numbers', () => {
    expect(add(2, 3)).toBe(5)
  })

  it('handles zero', () => {
    expect(add(0, 7)).toBe(7)
  })
})
