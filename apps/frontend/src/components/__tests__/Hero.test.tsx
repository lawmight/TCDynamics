import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import Hero from '../Hero'

const renderWithRouter = () =>
  render(
    <MemoryRouter>
      <Hero />
    </MemoryRouter>
  )

describe('Hero Component', () => {
  it('should render hero section', () => {
    renderWithRouter()

    // Vérifier que le titre principal existe et contient le texte clé
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeInTheDocument()
    expect(heading).toHaveTextContent('Automatisez Votre')
    expect(heading).toHaveTextContent("Entreprise avec l'IA")

    // Vérifier le paragraphe de description
    const descriptionElement = screen.getByText(/Gagnez/i)
    expect(descriptionElement).toBeInTheDocument()
    expect(descriptionElement).toHaveTextContent('10h par semaine')

    // Vérifier les boutons CTA
    expect(screen.getByText('VOIR LA DÉMO')).toBeInTheDocument()
    expect(screen.getByText('PARLER À UN EXPERT')).toBeInTheDocument()
  })

  it('should render trust indicators', () => {
    renderWithRouter()

    expect(screen.getByText(/Données hébergées en France/i)).toBeInTheDocument()
    expect(screen.getByText(/RGPD prêt \+ chiffrement/i)).toBeInTheDocument()
    expect(
      screen.getByText(/Disponibilité 99\.9% \(SLA\)/i)
    ).toBeInTheDocument()
  })

  it('should render hero image with alt text', () => {
    renderWithRouter()

    const heroImage = screen.getByAltText(/Aperçu produit WorkFlowAI/i)
    expect(heroImage).toBeInTheDocument()
    expect(heroImage.tagName).toBe('IMG')
  })

  it('should have proper semantic structure', () => {
    renderWithRouter()

    // Vérifier la structure sémantique
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()

    // Vérifier que les boutons sont des boutons
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('should render network background elements', () => {
    renderWithRouter()

    // Vérifier que le SVG de fond est présent
    const svgElement = document.querySelector('svg')
    expect(svgElement).toBeInTheDocument()
  })
})
