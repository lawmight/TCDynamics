import { render, screen } from '@testing-library/react'
import HowItWorks from '../HowItWorks'

describe('HowItWorks Component', () => {
  it('should render how it works section', () => {
    render(<HowItWorks />)

    expect(screen.getByText(/Comment ça marche/i)).toBeInTheDocument()
  })

  it('should display the three main steps', () => {
    render(<HowItWorks />)

    expect(screen.getByText(/1\. Importez vos documents/i)).toBeInTheDocument()
    expect(
      screen.getByText(/2\. L'IA analyse automatiquement/i)
    ).toBeInTheDocument()
    expect(screen.getByText(/3\. Consultez vos résultats/i)).toBeInTheDocument()
  })

  it('should show step descriptions', () => {
    render(<HowItWorks />)

    expect(screen.getByText(/Téléchargez vos factures/i)).toBeInTheDocument()
    expect(
      screen.getByText(/Notre IA extrait les données/i)
    ).toBeInTheDocument()
    expect(screen.getByText(/Visualisez les informations/i)).toBeInTheDocument()
  })

  it('should have proper step icons', () => {
    render(<HowItWorks />)

    // Check for step indicators
    const stepNumbers = screen.getAllByText(/\d/)
    expect(stepNumbers.length).toBeGreaterThan(0)
  })

  it('should be accessible', () => {
    render(<HowItWorks />)

    const section = screen.getByRole('region')
    expect(section).toHaveAttribute('aria-labelledby')
  })

  it('should have proper heading hierarchy', () => {
    render(<HowItWorks />)

    const mainHeading = screen.getByRole('heading', { level: 2 })
    expect(mainHeading).toHaveTextContent(/Comment ça marche/i)
  })
})
