import { render, screen } from '@testing-library/react'
import { OptimizedImage } from '../OptimizedImage'

describe('OptimizedImage Component', () => {
  it('should render container with loading placeholder', () => {
    render(<OptimizedImage src="/test.jpg" alt="Test image" />)

    // Should render the container div
    const container = screen.getByText('', { selector: 'div.relative' })
    expect(container).toBeInTheDocument()
  })

  it('should render loading placeholder initially', () => {
    render(<OptimizedImage src="/test.jpg" alt="Test image" />)

    // Should show loading animation initially
    const loadingDiv = document.querySelector('.animate-pulse')
    expect(loadingDiv).toBeInTheDocument()
  })

  it('should support priority loading', () => {
    render(<OptimizedImage src="/test.jpg" alt="Test image" priority />)

    // With priority, should render immediately
    const container = screen.getByText('', { selector: 'div.relative' })
    expect(container).toBeInTheDocument()
  })

  it('should accept custom className', () => {
    render(<OptimizedImage src="/test.jpg" alt="Test image" className="custom-class" />)

    const container = screen.getByText('', { selector: 'div.relative' })
    expect(container).toHaveClass('custom-class')
  })
})
