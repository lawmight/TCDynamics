import { render, screen } from '@testing-library/react'

import Hero from '../Hero'

describe('Hero Component', () => {
  it('should render hero section', () => {
    render(<Hero />)

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
    expect(screen.getByText('GET COMPUTE')).toBeInTheDocument()
    expect(screen.getByText('VOIR LA DÉMO')).toBeInTheDocument()
  })

  it('should render trust indicators', () => {
    render(<Hero />)

    expect(screen.getByText(/Hébergement France/i)).toBeInTheDocument()
    expect(screen.getByText(/Sécurité Bancaire/i)).toBeInTheDocument()
    expect(screen.getByText(/4\.9\/5 sur 200\+ avis/i)).toBeInTheDocument()
  })

  it('should render hero image with alt text', () => {
    render(<Hero />)

    const heroImage = screen.getByAltText(/Réseau d'intelligence artificielle/i)
    expect(heroImage).toBeInTheDocument()
    expect(heroImage.tagName).toBe('IMG')
  })

  it('should have proper semantic structure', () => {
    render(<Hero />)

    // Vérifier la structure sémantique
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()

    // Vérifier que les boutons sont des boutons
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('should render network background elements', () => {
    render(<Hero />)

    // Vérifier que le SVG de fond est présent
    const svgElement = document.querySelector('svg')
    expect(svgElement).toBeInTheDocument()
  })
})
