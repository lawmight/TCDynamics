import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import About from '../About'

vi.mock('@/components/ui/animated-counter', () => ({
  AnimatedCounter: ({ className }: { className?: string }) => (
    <span data-testid="animated-counter" className={className}>
      110
    </span>
  ),
}))

const renderWithRouter = () =>
  render(
    <MemoryRouter>
      <About />
    </MemoryRouter>
  )

describe('About Page', () => {
  it('renders hero information sourced from PROJECT_MASTER', () => {
    renderWithRouter()

    expect(
      screen.getByRole('heading', {
        name: /IA opérationnelle pensée pour les PME françaises/i,
      })
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Frontend \+ backend live sur Vercel/i)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Azure Functions Python 3\.11 actives/i)
    ).toBeInTheDocument()
  })

  it('lists mission pillars and compliance commitments', () => {
    renderWithRouter()

    expect(screen.getByText('Automatisation locale')).toBeInTheDocument()
    expect(screen.getByText('Support humain')).toBeInTheDocument()
    expect(screen.getByText('Hébergement souverain')).toBeInTheDocument()
    expect(screen.getByText('Gouvernance RGPD')).toBeInTheDocument()
  })

  it('shows milestones and stats', () => {
    renderWithRouter()

    expect(screen.getByText('Phase Tinker')).toBeInTheDocument()
    expect(screen.getByText(/Customer Validation/i)).toBeInTheDocument()
    expect(
      screen.getAllByTestId('animated-counter').length
    ).toBeGreaterThanOrEqual(1)
  })
})
