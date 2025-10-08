import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Index from '../Index'

// Mock all the component imports
vi.mock('@/components/Hero', () => ({
  default: () => <div data-testid="hero">Hero Component</div>,
}))

vi.mock('@/components/Features', () => ({
  default: () => <div data-testid="features">Features Component</div>,
}))

vi.mock('@/components/HowItWorks', () => ({
  default: () => <div data-testid="how-it-works">HowItWorks Component</div>,
}))

vi.mock('@/components/LocalAdvantages', () => ({
  default: () => (
    <div data-testid="local-advantages">LocalAdvantages Component</div>
  ),
}))

vi.mock('@/components/SocialProof', () => ({
  default: () => <div data-testid="social-proof">SocialProof Component</div>,
}))

vi.mock('@/components/Pricing', () => ({
  default: () => <div data-testid="pricing">Pricing Component</div>,
}))

vi.mock('@/components/FAQ', () => ({
  default: () => <div data-testid="faq">FAQ Component</div>,
}))

vi.mock('@/components/Contact', () => ({
  default: () => <div data-testid="contact">Contact Component</div>,
}))

describe('Index Page', () => {
  it('should render all main sections', () => {
    render(<Index />)

    expect(screen.getByTestId('hero')).toBeInTheDocument()
    expect(screen.getByTestId('features')).toBeInTheDocument()
    expect(screen.getByTestId('how-it-works')).toBeInTheDocument()
    expect(screen.getByTestId('local-advantages')).toBeInTheDocument()
    expect(screen.getByTestId('social-proof')).toBeInTheDocument()
    expect(screen.getByTestId('pricing')).toBeInTheDocument()
    expect(screen.getByTestId('faq')).toBeInTheDocument()
    expect(screen.getByTestId('contact')).toBeInTheDocument()
  })

  it('should render with correct semantic structure', () => {
    render(<Index />)

    const main = screen.getByRole('main')
    expect(main).toBeInTheDocument()
    expect(main).toHaveAttribute('id', 'main')

    const sections = screen.getAllByRole('region')
    expect(sections).toHaveLength(8) // All section components

    // Check specific section IDs
    expect(screen.getByTestId('hero').closest('section')).toHaveAttribute(
      'id',
      'hero'
    )
    expect(screen.getByTestId('features').closest('section')).toHaveAttribute(
      'id',
      'features'
    )
    expect(
      screen.getByTestId('how-it-works').closest('section')
    ).toHaveAttribute('id', 'how-it-works')
    expect(
      screen.getByTestId('local-advantages').closest('section')
    ).toHaveAttribute('id', 'local-advantages')
    expect(
      screen.getByTestId('social-proof').closest('section')
    ).toHaveAttribute('id', 'social-proof')
    expect(screen.getByTestId('pricing').closest('section')).toHaveAttribute(
      'id',
      'pricing'
    )
    expect(screen.getByTestId('faq').closest('section')).toHaveAttribute(
      'id',
      'faq'
    )
    expect(screen.getByTestId('contact').closest('section')).toHaveAttribute(
      'id',
      'contact'
    )
  })

  it('should have proper accessibility labels', () => {
    render(<Index />)

    const heroSection = screen.getByTestId('hero').closest('section')
    expect(heroSection).toHaveAttribute('aria-label', 'Présentation WorkFlowAI')
  })
})
