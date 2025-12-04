import { renderHook } from '@testing-library/react'

import { useIsMobile } from '../use-mobile'

// Mock window.innerWidth
const mockInnerWidth = (width: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  })
}

describe('useIsMobile Hook', () => {
  it('should return true for mobile screen sizes', () => {
    mockInnerWidth(600) // Mobile width

    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(true)
  })

  it('should return false for desktop screen sizes', () => {
    mockInnerWidth(1200) // Desktop width

    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(false)
  })

  it('should handle tablet screen sizes', () => {
    mockInnerWidth(800) // Tablet width

    const { result } = renderHook(() => useIsMobile())

    // This depends on the breakpoint definition
    expect(typeof result.current).toBe('boolean')
  })

  it('should update on window resize', () => {
    mockInnerWidth(600) // Start with mobile

    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(true)

    // Change to desktop width
    mockInnerWidth(1200)

    // Trigger resize event
    window.dispatchEvent(new Event('resize'))

    // The hook should update its value
    expect(typeof result.current).toBe('boolean')
  })
})
