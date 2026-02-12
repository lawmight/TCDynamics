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

    // Vérifier le paragraphe de description (story-driven)
    const descriptionElement = screen.getByText(/Finies les heures perdues/i)
    expect(descriptionElement).toBeInTheDocument()
    expect(descriptionElement).toHaveTextContent('10h')

    // Vérifier les boutons CTA
    expect(screen.getByText('VOIR LA DÉMO')).toBeInTheDocument()
    expect(screen.getByText('PARLER À UN EXPERT')).toBeInTheDocument()
  })

  it('should render MCP in overline with tooltip', () => {
    renderWithRouter()

    const mcpElement = screen.getByTitle(/Model Context Protocol/i)
    expect(mcpElement).toBeInTheDocument()
    expect(mcpElement).toHaveTextContent('MCP')
    expect(mcpElement).toHaveAttribute('title')
  })

  it('should render trust indicators', () => {
    renderWithRouter()

    expect(screen.getByText(/Données hébergées en France/i)).toBeInTheDocument()
    expect(screen.getByText(/RGPD prêt \+ chiffrement/i)).toBeInTheDocument()
    expect(
      screen.getByText(/Disponibilité 99\.9% \(SLA\)/i)
    ).toBeInTheDocument()
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

  describe('Video accessibility', () => {
    it('should render video with proper accessibility attributes', () => {
      renderWithRouter()

      const video = screen.getByLabelText(
        /Démonstration en direct de l'automatisation des workflows avec l'IA/i
      )
      expect(video).toBeInTheDocument()
      // autoplay is conditional (hasUserInteracted && !isMobile) in Hero
      expect(video).toHaveProperty('muted', true)
      expect(video).toHaveAttribute('playsinline')
      expect(video).toHaveAttribute('controls')
      expect(video).not.toHaveAttribute('loop')
    })

    it('should not render custom pause/play control button', () => {
      renderWithRouter()

      // Ensure no custom play/pause button exists
      expect(
        screen.queryByRole('button', {
          name: /Mettre en pause la vidéo de démonstration/i,
        })
      ).not.toBeInTheDocument()
      expect(
        screen.queryByRole('button', {
          name: /Reprendre la lecture de la vidéo de démonstration/i,
        })
      ).not.toBeInTheDocument()
    })
  })
})
