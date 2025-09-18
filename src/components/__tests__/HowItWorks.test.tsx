import { render, screen } from '@testing-library/react'
import HowItWorks from '../HowItWorks'

describe('HowItWorks Component', () => {
  it('should render how it works section', () => {
    render(<HowItWorks />)

    expect(screen.getByText(/Comment ça marche/i)).toBeInTheDocument()
  })

  it('should display the three main steps', () => {
    render(<HowItWorks />)

    expect(screen.getByText(/Connectez vos outils/i)).toBeInTheDocument()
    expect(screen.getByText(/Configurez l'IA/i)).toBeInTheDocument()
    expect(screen.getByText(/Automatisez et économisez/i)).toBeInTheDocument()
  })

  it('should show step descriptions', () => {
    render(<HowItWorks />)

    expect(
      screen.getByText(/Intégrez facilement vos emails/i)
    ).toBeInTheDocument()
    expect(screen.getByText(/Personnalisez vos workflows/i)).toBeInTheDocument()
    expect(screen.getByText(/Profitez des résultats/i)).toBeInTheDocument()
  })

  it('should have proper step icons', () => {
    render(<HowItWorks />)

    // Check for step indicators
    const stepNumbers = screen.getAllByText(/\d/)
    expect(stepNumbers.length).toBeGreaterThan(0)
  })

  it('should be accessible', () => {
    render(<HowItWorks />)

    const section = screen.getByRole('heading', { level: 2 })
    expect(section).toBeInTheDocument()
  })

  it('should have proper heading hierarchy', () => {
    render(<HowItWorks />)

    const mainHeading = screen.getByRole('heading', { level: 2 })
    expect(mainHeading).toHaveTextContent(/Comment ça marche/i)
  })
})
