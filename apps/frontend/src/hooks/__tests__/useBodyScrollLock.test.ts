import { renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useBodyScrollLock } from '../useBodyScrollLock'

describe('useBodyScrollLock', () => {
  const originalScrollY = window.scrollY
  const originalBodyStyle = {
    position: document.body.style.position,
    top: document.body.style.top,
    width: document.body.style.width,
    overflowY: document.body.style.overflowY,
  }

  beforeEach(() => {
    // Reset body styles
    document.body.style.position = ''
    document.body.style.top = ''
    document.body.style.width = ''
    document.body.style.overflowY = ''

    // Mock scrollY
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 100,
    })

    // Mock scrollTo
    window.scrollTo = vi.fn()
  })

  afterEach(() => {
    // Restore original styles
    document.body.style.position = originalBodyStyle.position
    document.body.style.top = originalBodyStyle.top
    document.body.style.width = originalBodyStyle.width
    document.body.style.overflowY = originalBodyStyle.overflowY

    // Restore scrollY
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: originalScrollY,
    })
  })

  it('should lock body scroll when isLocked is true', () => {
    renderHook(() => useBodyScrollLock(true))

    expect(document.body.style.position).toBe('fixed')
    expect(document.body.style.top).toBe('-100px')
    expect(document.body.style.width).toBe('100%')
    expect(document.body.style.overflowY).toBe('scroll')
  })

  it('should not lock body scroll when isLocked is false', () => {
    renderHook(() => useBodyScrollLock(false))

    expect(document.body.style.position).toBe('')
    expect(document.body.style.top).toBe('')
    expect(document.body.style.width).toBe('')
    expect(document.body.style.overflowY).toBe('')
  })

  it('should restore scroll position on unmount', () => {
    const { unmount } = renderHook(() => useBodyScrollLock(true))

    unmount()

    expect(document.body.style.position).toBe('')
    expect(document.body.style.top).toBe('')
    expect(document.body.style.width).toBe('')
    expect(document.body.style.overflowY).toBe('')
    expect(window.scrollTo).toHaveBeenCalledWith(0, 100)
  })

  it('should update when isLocked changes from false to true', () => {
    const { rerender } = renderHook(
      ({ isLocked }) => useBodyScrollLock(isLocked),
      {
        initialProps: { isLocked: false },
      }
    )

    expect(document.body.style.position).toBe('')

    rerender({ isLocked: true })

    expect(document.body.style.position).toBe('fixed')
    expect(document.body.style.top).toBe('-100px')
  })

  it('should update when isLocked changes from true to false', () => {
    const { rerender } = renderHook(
      ({ isLocked }) => useBodyScrollLock(isLocked),
      {
        initialProps: { isLocked: true },
      }
    )

    expect(document.body.style.position).toBe('fixed')

    rerender({ isLocked: false })

    expect(document.body.style.position).toBe('')
    expect(window.scrollTo).toHaveBeenCalledWith(0, 100)
  })
})
