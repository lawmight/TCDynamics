import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AIDemo from '../AIDemo'

describe('AIDemo Component', () => {
  it('should render demo interface', () => {
    render(<AIDemo />)

    expect(screen.getByText(/Essayez l'IA maintenant/i)).toBeInTheDocument()
    expect(
      screen.getByText(/Traitement automatique de documents/i)
    ).toBeInTheDocument()
  })

  it('should show demo features', () => {
    render(<AIDemo />)

    expect(screen.getByText(/Traitement de factures/i)).toBeInTheDocument()
    expect(screen.getByText(/Extraction de données/i)).toBeInTheDocument()
    expect(screen.getByText(/Validation automatique/i)).toBeInTheDocument()
  })

  it('should have interactive demo buttons', () => {
    render(<AIDemo />)

    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)

    // Should have demo action buttons
    const demoButton = screen.getByText(/Démarrer la démo/i)
    expect(demoButton).toBeInTheDocument()
  })

  it('should show processing animation when demo starts', async () => {
    render(<AIDemo />)

    const demoButton = screen.getByText(/Démarrer la démo/i)
    fireEvent.click(demoButton)

    await waitFor(() => {
      expect(screen.getByText(/Traitement en cours/i)).toBeInTheDocument()
    })
  })

  it('should display demo results', async () => {
    render(<AIDemo />)

    const demoButton = screen.getByText(/Démarrer la démo/i)
    fireEvent.click(demoButton)

    await waitFor(
      () => {
        expect(screen.getByText(/Résultats/i)).toBeInTheDocument()
      },
      { timeout: 3000 }
    )
  })

  it('should show confidence scores', async () => {
    render(<AIDemo />)

    const demoButton = screen.getByText(/Démarrer la démo/i)
    fireEvent.click(demoButton)

    await waitFor(
      () => {
        expect(screen.getByText(/Précision/i)).toBeInTheDocument()
        expect(screen.getByText(/99\.7%/i)).toBeInTheDocument()
      },
      { timeout: 3000 }
    )
  })

  it('should handle demo reset', async () => {
    render(<AIDemo />)

    const demoButton = screen.getByText(/Démarrer la démo/i)
    fireEvent.click(demoButton)

    await waitFor(
      () => {
        const resetButton = screen.getByText(/Réinitialiser/i)
        expect(resetButton).toBeInTheDocument()

        fireEvent.click(resetButton)
        expect(screen.getByText(/Démarrer la démo/i)).toBeInTheDocument()
      },
      { timeout: 3000 }
    )
  })

  it('should be accessible', () => {
    render(<AIDemo />)

    const demoSection = screen.getByRole('region')
    expect(demoSection).toHaveAttribute('aria-labelledby')
  })

  it('should have proper loading states', async () => {
    render(<AIDemo />)

    const demoButton = screen.getByText(/Démarrer la démo/i)
    fireEvent.click(demoButton)

    // Should show loading state
    expect(screen.getByText(/Chargement/i)).toBeInTheDocument()
  })

  it('should display sample data', () => {
    render(<AIDemo />)

    expect(screen.getByText(/Exemple de facture/i)).toBeInTheDocument()
    expect(screen.getByText(/Total: 1 250,00 €/i)).toBeInTheDocument()
  })
})
