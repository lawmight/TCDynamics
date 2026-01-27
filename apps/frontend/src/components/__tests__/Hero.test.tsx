import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
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
      expect(video).toHaveAttribute('autoplay')
      // Check muted property instead of attribute (boolean attributes in JSX)
      expect(video).toHaveProperty('muted', true)
      expect(video).toHaveAttribute('playsinline')
      expect(video).toHaveAttribute('controls')
      // Video should NOT have loop attribute for accessibility
      expect(video).not.toHaveAttribute('loop')
    })

    it('should render accessible pause/play control button', () => {
      renderWithRouter()

      const pauseButton = screen.getByRole('button', {
        name: /Mettre en pause la vidéo de démonstration/i,
      })
      expect(pauseButton).toBeInTheDocument()
      expect(pauseButton).toHaveAttribute('type', 'button')
    })

    it('should toggle play/pause when button is clicked', async () => {
      renderWithRouter()

      const toggleButton = screen.getByRole('button', {
        name: /Mettre en pause la vidéo de démonstration/i,
      })

      // Initially should show pause button
      expect(toggleButton).toHaveTextContent('Pause')

      // Click to pause
      await act(async () => {
        fireEvent.click(toggleButton)
      })

      // Should now show play button
      await waitFor(() => {
        const playButton = screen.getByRole('button', {
          name: /Reprendre la lecture de la vidéo de démonstration/i,
        })
        expect(playButton).toHaveTextContent('Play')
      })

      // Click to play again
      const playButton = screen.getByRole('button', {
        name: /Reprendre la lecture de la vidéo de démonstration/i,
      })
      await act(async () => {
        fireEvent.click(playButton)
      })

      // Should show pause button again
      await waitFor(() => {
        expect(
          screen.getByRole('button', {
            name: /Mettre en pause la vidéo de démonstration/i,
          })
        ).toHaveTextContent('Pause')
      })
    })

    it('should support keyboard interaction for pause/play control', async () => {
      renderWithRouter()

      const toggleButton = screen.getByRole('button', {
        name: /Mettre en pause la vidéo de démonstration/i,
      })

      // Should be keyboard focusable
      toggleButton.focus()
      expect(toggleButton).toHaveFocus()

      // Should toggle on Enter key
      await act(async () => {
        fireEvent.keyDown(toggleButton, { key: 'Enter', code: 'Enter' })
      })
      await waitFor(() => {
        expect(
          screen.getByRole('button', {
            name: /Reprendre la lecture de la vidéo de démonstration/i,
          })
        ).toBeInTheDocument()
      })

      // Should toggle on Space key
      const playButton = screen.getByRole('button', {
        name: /Reprendre la lecture de la vidéo de démonstration/i,
      })
      await act(async () => {
        fireEvent.keyDown(playButton, { key: ' ', code: 'Space' })
      })
      await waitFor(() => {
        expect(
          screen.getByRole('button', {
            name: /Mettre en pause la vidéo de démonstration/i,
          })
        ).toBeInTheDocument()
      })
    })
  })
})
