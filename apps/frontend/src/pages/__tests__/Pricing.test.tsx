import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import PricingPage from '../Pricing'

vi.mock('@/components/Pricing', () => ({
  default: () => <div data-testid="pricing-component" />,
}))

describe('Pricing page', () => {
  it('renders pricing section', () => {
    render(<PricingPage />)

    expect(screen.getByTestId('pricing-component')).toBeInTheDocument()
  })
})
