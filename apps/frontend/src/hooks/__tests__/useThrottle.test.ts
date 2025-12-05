import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useThrottle } from '../useThrottle'

describe('useThrottle', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('should call the callback immediately on first call', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useThrottle(callback, 100))

    result.current()

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('should throttle rapid calls', async () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useThrottle(callback, 100))

    // Call multiple times rapidly
    result.current()
    result.current()
    result.current()

    // Should only be called once immediately
    expect(callback).toHaveBeenCalledTimes(1)

    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(50)
    })
    expect(callback).toHaveBeenCalledTimes(1)

    // After delay, should be called again
    act(() => {
      vi.advanceTimersByTime(50)
    })
    await waitFor(() => {
      expect(callback).toHaveBeenCalledTimes(2)
    })
  })

  it('should pass arguments to the callback', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useThrottle(callback, 100))

    result.current('arg1', 'arg2', 123)

    expect(callback).toHaveBeenCalledWith('arg1', 'arg2', 123)
  })

  it('should clear timeout on unmount', () => {
    const callback = vi.fn()
    const { result, unmount } = renderHook(() => useThrottle(callback, 100))

    result.current()
    result.current() // This should schedule a delayed call

    unmount()

    // Fast-forward time - callback should not be called after unmount
    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('should allow calls after throttle delay', async () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useThrottle(callback, 100))

    result.current()
    expect(callback).toHaveBeenCalledTimes(1)

    // Wait for throttle delay
    act(() => {
      vi.advanceTimersByTime(100)
    })

    // Now should allow another immediate call
    result.current()
    expect(callback).toHaveBeenCalledTimes(2)
  })
})
