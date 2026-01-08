import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import Pricing from '../Pricing'

describe('Pricing Component', () => {
  const renderPricing = () =>
    render(
      <MemoryRouter>
        <Pricing />
      </MemoryRouter>
    )

  it('should render all pricing plans', () => {
    renderPricing()

    // Vérifier les 3 plans
    expect(screen.getByText('Starter')).toBeInTheDocument()
    expect(screen.getByText('Professional')).toBeInTheDocument()
    expect(screen.getByText('Enterprise')).toBeInTheDocument()
  })

  it('should display correct prices', () => {
    renderPricing()

    // Starter: 29€, Professional: 79€, Enterprise: Sur mesure
    expect(screen.getByText('29€')).toBeInTheDocument()
    expect(screen.getByText('79€')).toBeInTheDocument()
    expect(screen.getByText('Sur mesure')).toBeInTheDocument()
  })

  it('should mark Professional as popular', () => {
    renderPricing()

    expect(screen.getByText('Plus populaire')).toBeInTheDocument()
  })

  it('should show feature comparison', () => {
    renderPricing()

    // Vérifier quelques features
    expect(
      screen.getByText(/Traitez 50 documents\/mois automatiquement/i)
    ).toBeInTheDocument()
    expect(screen.getByText(/Traitez 500 documents\/mois/i)).toBeInTheDocument()
    expect(
      screen.getByText(/Traitez un volume illimité de documents/i)
    ).toBeInTheDocument()
  })

  it('should display support information', () => {
    renderPricing()

    expect(screen.getByText('Support Local')).toBeInTheDocument()
    expect(
      screen.getByText(/Équipe basée à Montigny-le-Bretonneux/i)
    ).toBeInTheDocument()
  })

  it('should have CTA buttons', () => {
    renderPricing()

    expect(
      screen.getAllByText("Démarrer l'essai gratuit", { exact: false })
    ).not.toHaveLength(0)
    expect(screen.getByText('Nous contacter')).toBeInTheDocument()
  })
})
