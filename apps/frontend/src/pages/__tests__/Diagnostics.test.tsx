import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import Diagnostics from '../Diagnostics'

class MockPerformanceObserver {
  observe() {}
  disconnect() {}
}

describe('Diagnostics page', () => {
  it('renders diagnostics table headers', () => {
    Object.defineProperty(window, 'PerformanceObserver', {
      value: MockPerformanceObserver,
      writable: true,
    })
    Object.defineProperty(window, 'PerformanceObserverEntryList', {
      value: {},
      writable: true,
    })

    render(<Diagnostics />)

    expect(
      screen.getByRole('heading', { name: /Diagnostics/i })
    ).toBeInTheDocument()
    expect(screen.getByText(/Duration \(ms\)/i)).toBeInTheDocument()
  })
})
