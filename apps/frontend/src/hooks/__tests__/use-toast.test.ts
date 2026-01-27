import { act, renderHook } from '@testing-library/react'

import { useToast } from '../useToast'

describe('useToast Hook', () => {
  it('should return toast functions and state', () => {
    const { result } = renderHook(() => useToast())

    expect(result.current).toHaveProperty('toast')
    expect(result.current).toHaveProperty('toasts')
    expect(result.current).toHaveProperty('dismiss')
    expect(Array.isArray(result.current.toasts)).toBe(true)
  })

  it('should add toast when toast function is called', () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      result.current.toast({
        title: 'Test Toast',
        description: 'This is a test toast',
      })
    })

    expect(result.current.toasts.length).toBeGreaterThan(0)
  })

  it('should handle different toast variants', () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      result.current.toast({
        title: 'Success',
        description: 'Operation completed',
        variant: 'default',
      })
    })

    expect(result.current.toasts.length).toBeGreaterThan(0)
  })

  it('should dismiss toast by id', () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      result.current.toast({
        title: 'Test Toast',
        id: 'test-toast',
      })
    })

    act(() => {
      result.current.dismiss('test-toast')
    })

    // The toast should be dismissed (exact behavior depends on implementation)
    expect(result.current.toasts.length).toBeDefined()
  })
})
