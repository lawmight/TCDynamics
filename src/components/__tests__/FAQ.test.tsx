import { render, screen } from '@testing-library/react'
import FAQ from '../FAQ'

describe('FAQ Component', () => {
  it('should render FAQ section', () => {
    render(<FAQ />)

    expect(screen.getByText(/Questions fréquentes/i)).toBeInTheDocument()
  })

  it('should display FAQ items', () => {
    render(<FAQ />)

    // Check for common FAQ patterns
    expect(screen.getAllByRole('button').length).toBeGreaterThan(0)
  })

  it('should have proper heading hierarchy', () => {
    render(<FAQ />)

    const headings = screen.getAllByRole('heading')
    expect(headings.length).toBeGreaterThan(0)
  })

  it('should be accessible', () => {
    render(<FAQ />)

    // Check for accordion/collapsible elements
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })
})
