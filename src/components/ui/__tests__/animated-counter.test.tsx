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

    await waitFor(() => {
      expect(screen.getByText('42')).toBeInTheDocument()
    })
  })

  it('should handle zero value', async () => {
    render(<AnimatedCounter end={0} />)

    await waitFor(() => {
      expect(screen.getByText('0')).toBeInTheDocument()
    })
  })

  it('should handle large numbers', async () => {
    render(<AnimatedCounter end={1000000} />)

    await waitFor(() => {
      expect(screen.getByText('1 000 000')).toBeInTheDocument()
    })
  })

  it('should accept custom className', async () => {
    render(<AnimatedCounter end={123} className="custom-class" />)

    await waitFor(() => {
      const counter = screen.getByText('123')
      expect(counter).toHaveClass('custom-class')
    })
  })

  it('should handle decimal numbers', async () => {
    render(<AnimatedCounter end={99.7} />)

    await waitFor(() => {
      expect(screen.getByText('99')).toBeInTheDocument()
    })
  })

  it('should format currency values', async () => {
    render(<AnimatedCounter end={1250} suffix="€" />)

    await waitFor(() => {
      expect(screen.getByText('1 250€')).toBeInTheDocument()
    })
  })

  it('should handle percentage values', async () => {
    render(<AnimatedCounter end={95} suffix="%" />)

    await waitFor(() => {
      expect(screen.getByText('95%')).toBeInTheDocument()
    })
  })
})
