import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import FeaturesPage from '../Features'

import { featureModules } from '@/data/productHighlights'

const renderWithRouter = () =>
  render(
    <MemoryRouter>
      <FeaturesPage />
    </MemoryRouter>
  )

describe('Features Page', () => {
  it('renders page hero and context', () => {
    renderWithRouter()

    expect(
      screen.getByRole('heading', {
        name: /Toute la profondeur produit/i,
      })
    ).toBeInTheDocument()
    expect(screen.getByText(/Modules IA WorkFlowAI/i)).toBeInTheDocument()
  })

  it('renders every module from the shared data source', () => {
    renderWithRouter()

    featureModules.forEach(module => {
      expect(screen.getByText(module.title)).toBeInTheDocument()
      module.detail.integrations.forEach(integration => {
        const matches = screen.getAllByText(integration, { exact: false })
        expect(matches.length).toBeGreaterThan(0)
      })
    })
  })

  it('highlights integrations and reliability commitments', () => {
    renderWithRouter()

    expect(
      screen.getByText(/Intégrations prêtes à déployer/i)
    ).toBeInTheDocument()
    expect(screen.getByText(/Polar \+ Node\.js/)).toBeInTheDocument()
    expect(screen.getByText(/Fiabilité prouvée/)).toBeInTheDocument()
  })
})
