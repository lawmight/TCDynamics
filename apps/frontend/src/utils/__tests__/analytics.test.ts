import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { analytics, useEventTracking, usePageTracking } from '../analytics'

describe('analytics utilities', () => {
  it('pushes events to Matomo when enabled', () => {
    const matomoSpy = vi.fn()
    Object.assign(analytics as unknown as { enabled: boolean }, { enabled: true })
    Object.defineProperty(window, '_paq', {
      value: { push: matomoSpy },
      writable: true,
    })

    analytics.trackEvent({
      category: 'Test',
      action: 'Click',
      label: 'Button',
      value: 1,
    })

    expect(matomoSpy).toHaveBeenCalledWith([
      'trackEvent',
      'Test',
      'Click',
      'Button',
      1,
    ])
  })

  it('tracks page view and time on page', () => {
    Object.assign(analytics as unknown as { enabled: boolean }, { enabled: true })
    const trackSpy = vi.spyOn(analytics, 'trackEvent')

    const { unmount } = renderHook(() => usePageTracking('Home'))
    act(() => {
      unmount()
    })

    expect(trackSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        category: 'Navigation',
        action: 'PageView',
        label: 'Home',
      })
    )
    expect(trackSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        category: 'Engagement',
        action: 'TimeOnPage',
        label: 'Home',
      })
    )
  })

  it('exposes event tracking helpers', () => {
    Object.assign(analytics as unknown as { enabled: boolean }, { enabled: true })
    const trackSpy = vi.spyOn(analytics, 'trackEvent')

    const { result } = renderHook(() => useEventTracking())
    result.current.trackClick('CTA')
    result.current.trackFormSubmit('Form')
    result.current.trackScroll(50)

    expect(trackSpy).toHaveBeenCalledTimes(3)
  })
})
