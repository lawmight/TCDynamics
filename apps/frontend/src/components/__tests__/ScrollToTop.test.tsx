import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import ScrollToTop from '../ScrollToTop'

describe('ScrollToTop component', () => {
  it('scrolls to top when no hash is present', () => {
    Object.defineProperty(window, 'requestAnimationFrame', {
      value: (cb: FrameRequestCallback) => {
        cb(0)
        return 0
      },
      writable: true,
    })
    const scrollSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})

    render(
      <MemoryRouter>
        <ScrollToTop />
      </MemoryRouter>
    )

    expect(scrollSpy).toHaveBeenCalledWith(0, 0)
  })

  it('scrolls to the hash target when present', () => {
    vi.useFakeTimers()
    const element = document.createElement('div')
    element.id = 'target'
    document.body.appendChild(element)
    const scrollIntoViewSpy = vi.spyOn(element, 'scrollIntoView')

    render(
      <MemoryRouter initialEntries={['/path#target']}>
        <ScrollToTop />
      </MemoryRouter>
    )

    vi.advanceTimersByTime(120)
    expect(scrollIntoViewSpy).toHaveBeenCalled()
    document.body.removeChild(element)
    vi.useRealTimers()
  })
})
