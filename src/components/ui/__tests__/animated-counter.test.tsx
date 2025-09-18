import { render, screen, waitFor } from '@testing-library/react'
import { AnimatedCounter } from '../animated-counter'

// Mock the intersection observer
const mockIntersectionObserver = vi.fn()
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
})
window.IntersectionObserver = mockIntersectionObserver

describe('AnimatedCounter Component', () => {
  beforeEach(() => {
    // Mock the intersection observer to always return true
    mockIntersectionObserver.mockImplementation(callback => {
      // Call the callback immediately with isIntersecting: true
      setTimeout(() => callback([{ isIntersecting: true }]), 0)
      return {
        observe: () => null,
        unobserve: () => null,
        disconnect: () => null,
      }
    })
  })

  it('should render with initial value', async () => {
    render(<AnimatedCounter end={42} />)

    // Wait for the counter to reach close to the final value
    await waitFor(
      () => {
        const counterText = screen.getByText(/\d+/)
        const value = parseInt(
          counterText.textContent?.replace(/\s/g, '') || '0'
        )
        expect(value).toBeGreaterThanOrEqual(40) // Allow some tolerance
      },
      { timeout: 3000 }
    )
  })

  it('should handle zero value', async () => {
    render(<AnimatedCounter end={0} />)

    await waitFor(() => {
      expect(screen.getByText('0')).toBeInTheDocument()
    })
  })

  it('should handle large numbers', async () => {
    render(<AnimatedCounter end={1000000} />)

    await waitFor(
      () => {
        const counterText = screen.getByText(/\d+/)
        const value = parseInt(
          counterText.textContent?.replace(/\s/g, '') || '0'
        )
        expect(value).toBeGreaterThan(900000) // Allow some tolerance for animation
      },
      { timeout: 3000 }
    )
  })

  it('should accept custom className', async () => {
    render(<AnimatedCounter end={123} className="custom-class" />)

    await waitFor(
      () => {
        const counterText = screen.getByText(/\d+/)
        const value = parseInt(
          counterText.textContent?.replace(/\s/g, '') || '0'
        )
        expect(value).toBeGreaterThanOrEqual(120)
        expect(counterText).toHaveClass('custom-class')
      },
      { timeout: 3000 }
    )
  })

  it('should handle decimal numbers', async () => {
    render(<AnimatedCounter end={99.7} />)

    await waitFor(
      () => {
        const counterText = screen.getByText(/\d+/)
        const value = parseInt(
          counterText.textContent?.replace(/\s/g, '') || '0'
        )
        expect(value).toBeGreaterThanOrEqual(95)
      },
      { timeout: 3000 }
    )
  })

  it('should format currency values', async () => {
    render(<AnimatedCounter end={1250} suffix="€" />)

    await waitFor(
      () => {
        const counterText = screen.getByText(/\d+€/)
        const value = parseInt(
          counterText.textContent?.replace(/\s|€/g, '') || '0'
        )
        expect(value).toBeGreaterThan(1200)
      },
      { timeout: 3000 }
    )
  })

  it('should handle percentage values', async () => {
    render(<AnimatedCounter end={95} suffix="%" />)

    await waitFor(
      () => {
        const counterText = screen.getByText(/\d+%/)
        const value = parseInt(
          counterText.textContent?.replace(/\s|%/g, '') || '0'
        )
        expect(value).toBeGreaterThanOrEqual(90)
      },
      { timeout: 3000 }
    )
  })
})
