import { render, screen } from '@testing-library/react'
import Pricing from '../Pricing'

describe('Pricing Component', () => {
  it('should render all pricing plans', () => {
    render(<Pricing />)

    // Vérifier les 3 plans
    expect(screen.getByText('Starter')).toBeInTheDocument()
    expect(screen.getByText('Professional')).toBeInTheDocument()
    expect(screen.getByText('Enterprise')).toBeInTheDocument()
  })

  it('should display correct prices', () => {
    render(<Pricing />)

    expect(screen.getByText('29€')).toBeInTheDocument()
    expect(screen.getByText('79€')).toBeInTheDocument()
    expect(screen.getByText('Sur mesure')).toBeInTheDocument()
  })

  it('should mark Professional as popular', () => {
    render(<Pricing />)

    expect(screen.getByText('Plus populaire')).toBeInTheDocument()
  })

  it('should show feature comparison', () => {
    render(<Pricing />)

    // Vérifier quelques features
    expect(
      screen.getByText(/Traitement de 50 documents\/mois/i)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Traitement de 500 documents\/mois/i)
    ).toBeInTheDocument()
    expect(screen.getByText(/Traitement illimité/i)).toBeInTheDocument()
  })

  it('should display support information', () => {
    render(<Pricing />)

    expect(screen.getByText('Support Local')).toBeInTheDocument()
    expect(
      screen.getByText(/Équipe basée à Montigny-le-Bretonneux/i)
    ).toBeInTheDocument()
  })

  it('should have CTA buttons', () => {
    render(<Pricing />)

    expect(screen.getByText("S'abonner - 29€")).toBeInTheDocument()
    expect(screen.getByText("S'abonner - 79€")).toBeInTheDocument()
    expect(screen.getByText('Contactez-nous')).toBeInTheDocument()
  })
})
