import { render, screen } from '@testing-library/react'
import { AnimatedCounter } from '../animated-counter'

describe('AnimatedCounter Component', () => {
  it('should render with initial value', () => {
    render(<AnimatedCounter value={42} />)

    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('should handle zero value', () => {
    render(<AnimatedCounter value={0} />)

    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('should handle large numbers', () => {
    render(<AnimatedCounter value={1000000} />)

    expect(screen.getByText('1,000,000')).toBeInTheDocument()
  })

  it('should accept custom className', () => {
    render(<AnimatedCounter value={123} className="custom-class" />)

    const counter = screen.getByText('123')
    expect(counter).toHaveClass('custom-class')
  })

  it('should handle decimal numbers', () => {
    render(<AnimatedCounter value={99.7} />)

    expect(screen.getByText('99.7')).toBeInTheDocument()
  })

  it('should be accessible', () => {
    render(<AnimatedCounter value={50} />)

    const counter = screen.getByRole('text')
    expect(counter).toHaveAttribute('aria-live', 'polite')
  })

  it('should format currency values', () => {
    render(<AnimatedCounter value={1250} suffix="€" />)

    expect(screen.getByText('1,250€')).toBeInTheDocument()
  })

  it('should handle percentage values', () => {
    render(<AnimatedCounter value={95} suffix="%" />)

    expect(screen.getByText('95%')).toBeInTheDocument()
  })
})
