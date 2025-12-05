import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import Features from '../Features'

const renderWithRouter = () =>
  render(
    <MemoryRouter>
      <Features />
    </MemoryRouter>
  )

describe('Features Component', () => {
  it('should render all feature cards', () => {
    renderWithRouter()

    // Vérifier le titre principal
    expect(screen.getByText(/Modules IA pour/i)).toBeInTheDocument()
    expect(screen.getByText(/Entreprises Françaises/i)).toBeInTheDocument()

    // Vérifier les 4 modules principaux
    expect(screen.getByText('IA Documentaire')).toBeInTheDocument()
    expect(screen.getByText('Service Client IA')).toBeInTheDocument()
    expect(screen.getByText('Analytics Métier')).toBeInTheDocument()
    expect(screen.getByText('Conformité RGPD')).toBeInTheDocument()
  })

  it('should display feature benefits', () => {
    renderWithRouter()

    // Vérifier quelques bénéfices clés
    expect(screen.getByText('99.7% de précision')).toBeInTheDocument()
    expect(screen.getByText('24h/7j disponible')).toBeInTheDocument()
    expect(screen.getByText('Hébergement France')).toBeInTheDocument()
  })

  it('should render CTA section', () => {
    renderWithRouter()

    expect(
      screen.getByText(/Prêt à transformer votre entreprise/i)
    ).toBeInTheDocument()
    expect(screen.getByText("DÉMARRER L'ESSAI")).toBeInTheDocument()
    expect(screen.getByText('PARLER À UN EXPERT')).toBeInTheDocument()
  })

  it('should have security badge', () => {
    renderWithRouter()

    expect(
      screen.getByText(/DONNÉES SÉCURISÉES EN FRANCE/i)
    ).toBeInTheDocument()
  })
})
