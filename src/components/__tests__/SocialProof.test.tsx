import { render, screen } from '@testing-library/react'
import SocialProof from '../SocialProof'

describe('SocialProof Component', () => {
  it('should render social proof section', () => {
    render(<SocialProof />)

    // Should render a section element
    expect(screen.getByRole('region')).toBeInTheDocument()
  })

  it('should display testimonials or reviews', () => {
    render(<SocialProof />)

    // Look for common social proof elements
    expect(screen.getByText(/Ils nous font confiance/i)).toBeInTheDocument()
  })

  it('should have proper structure', () => {
    render(<SocialProof />)

    // Component should render without errors
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
  })

  it('should be accessible', () => {
    render(<SocialProof />)

    // Check that content is accessible
    const section = screen.getByRole('region')
    expect(section).toHaveAttribute('aria-labelledby')
  })
})
