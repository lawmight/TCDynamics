import { renderHook } from '@testing-library/react'
import { useIntersectionObserver } from '../useIntersectionObserver'

describe('useIntersectionObserver Hook', () => {
  it('should return ref and intersection state', () => {
    const { result } = renderHook(() => useIntersectionObserver())

    expect(result.current).toHaveProperty('ref')
    expect(result.current).toHaveProperty('isIntersecting')
    expect(result.current).toHaveProperty('hasIntersected')
    expect(typeof result.current.isIntersecting).toBe('boolean')
    expect(typeof result.current.hasIntersected).toBe('boolean')
  })

  it('should accept custom options', () => {
    const options = { threshold: 0.5, rootMargin: '10px' }
    const { result } = renderHook(() => useIntersectionObserver(options))

    expect(result.current.ref).toBeDefined()
  })

  it('should handle threshold option', () => {
    const { result } = renderHook(() => useIntersectionObserver({ threshold: 0.8 }))

    expect(result.current).toHaveProperty('ref')
    expect(result.current).toHaveProperty('isIntersecting')
  })

  it('should provide a ref for element attachment', () => {
    const { result } = renderHook(() => useIntersectionObserver())

    // The ref should be a function or object that can be attached to a DOM element
    expect(result.current.ref).toBeDefined()
  })
})
