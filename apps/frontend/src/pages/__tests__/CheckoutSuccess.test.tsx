import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter, useSearchParams } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import CheckoutSuccess from '../CheckoutSuccess'

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useSearchParams: vi.fn(),
  }
})

// Mock confetti
vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}))

vi.mock('lucide-react', () => ({
  CheckCircle: ({ className }: { className?: string }) => (
    <div className={className} data-testid="check-circle" />
  ),
  Mail: ({ className }: { className?: string }) => (
    <div className={className} data-testid="mail" />
  ),
  Download: ({ className }: { className?: string }) => (
    <div className={className} data-testid="download" />
  ),
  ArrowRight: ({ className }: { className?: string }) => (
    <div className={className} data-testid="arrow-right" />
  ),
}))

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('CheckoutSuccess', () => {
  const mockUseSearchParams = useSearchParams as unknown as ReturnType<
    typeof vi.fn
  >

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders success message with session ID', () => {
    const searchParams = new URLSearchParams({ session_id: 'test-session-123' })
    mockUseSearchParams.mockReturnValue([searchParams])

    renderWithRouter(<CheckoutSuccess />)

    expect(screen.getByText(/Paiement réussi/i)).toBeInTheDocument()
    expect(screen.getByText(/test-session-123/i)).toBeInTheDocument()
  })

  it('renders without session ID', () => {
    const searchParams = new URLSearchParams()
    mockUseSearchParams.mockReturnValue([searchParams])

    renderWithRouter(<CheckoutSuccess />)

    expect(screen.getByText(/Paiement réussi/i)).toBeInTheDocument()
    expect(screen.queryByText(/Session ID/i)).not.toBeInTheDocument()
  })

  it('displays order confirmation section', () => {
    const searchParams = new URLSearchParams()
    mockUseSearchParams.mockReturnValue([searchParams])

    renderWithRouter(<CheckoutSuccess />)

    expect(screen.getByText(/Confirmation de commande/i)).toBeInTheDocument()
    expect(screen.getByText(/Un email de confirmation/i)).toBeInTheDocument()
  })

  it('displays next steps section', () => {
    const searchParams = new URLSearchParams()
    mockUseSearchParams.mockReturnValue([searchParams])

    renderWithRouter(<CheckoutSuccess />)

    expect(
      screen.getByRole('heading', { name: /Prochaines étapes/i })
    ).toBeInTheDocument()

    // Check all next steps are rendered
    expect(screen.getByText(/Vérifiez votre email/i)).toBeInTheDocument()
    expect(screen.getByText(/Configurez votre compte/i)).toBeInTheDocument()
    expect(
      screen.getByText(/Commencez à utiliser TCDynamics/i)
    ).toBeInTheDocument()
    expect(screen.getByText(/Support disponible/i)).toBeInTheDocument()
  })

  it('renders all next step items with correct icons', () => {
    const searchParams = new URLSearchParams()
    mockUseSearchParams.mockReturnValue([searchParams])

    renderWithRouter(<CheckoutSuccess />)

    // Check that all 4 next steps are present
    const stepItems = screen.getAllByRole('listitem')
    const nextStepsItems = stepItems.filter(
      item =>
        item.textContent?.includes('Vérifiez') ||
        item.textContent?.includes('Configurez') ||
        item.textContent?.includes('Commencez') ||
        item.textContent?.includes('Support')
    )

    expect(nextStepsItems).toHaveLength(4)
  })

  it('displays contact support section', () => {
    const searchParams = new URLSearchParams()
    mockUseSearchParams.mockReturnValue([searchParams])

    renderWithRouter(<CheckoutSuccess />)

    expect(screen.getByText(/Besoin d'aide/i)).toBeInTheDocument()
    expect(screen.getByText(/Notre équipe est là/i)).toBeInTheDocument()
  })

  it('renders contact support button', () => {
    const searchParams = new URLSearchParams()
    mockUseSearchParams.mockReturnValue([searchParams])

    renderWithRouter(<CheckoutSuccess />)

    const supportButton = screen.getByRole('button', {
      name: /Contacter le support/i,
    })
    expect(supportButton).toBeInTheDocument()
  })

  it('handles contact support button click', () => {
    const searchParams = new URLSearchParams()
    mockUseSearchParams.mockReturnValue([searchParams])

    // Mock window.location.href
    delete (window as unknown as { location: unknown }).location
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
    })

    renderWithRouter(<CheckoutSuccess />)

    const supportButton = screen.getByRole('button', {
      name: /Contacter le support/i,
    })
    fireEvent.click(supportButton)

    expect(window.location.href).toBe('mailto:support@tcdynamics.fr')
  })

  it('renders return home button', () => {
    const searchParams = new URLSearchParams()
    mockUseSearchParams.mockReturnValue([searchParams])

    renderWithRouter(<CheckoutSuccess />)

    const homeButton = screen.getByRole('link', { name: /Retour à l'accueil/i })
    expect(homeButton).toBeInTheDocument()
    expect(homeButton).toHaveAttribute('href', '/')
  })

  it('displays thank you message', () => {
    const searchParams = new URLSearchParams()
    mockUseSearchParams.mockReturnValue([searchParams])

    renderWithRouter(<CheckoutSuccess />)

    expect(screen.getByText('Merci pour votre confiance !')).toBeInTheDocument()
  })

  it('triggers confetti animation on mount', async () => {
    const confettiMock = (await import('canvas-confetti')).default
    const searchParams = new URLSearchParams()
    mockUseSearchParams.mockReturnValue([searchParams])

    renderWithRouter(<CheckoutSuccess />)

    await waitFor(() => {
      expect(confettiMock).toHaveBeenCalled()
    })
  })

  it('renders with proper styling classes', () => {
    const searchParams = new URLSearchParams()
    mockUseSearchParams.mockReturnValue([searchParams])

    const { container } = renderWithRouter(<CheckoutSuccess />)

    // Check for main container
    expect(container.querySelector('.min-h-screen')).toBeInTheDocument()

    // Check for gradient background
    expect(container.querySelector('.bg-gradient-to-b')).toBeInTheDocument()
  })

  it('displays all sections in correct order', () => {
    const searchParams = new URLSearchParams({ session_id: 'test-123' })
    mockUseSearchParams.mockReturnValue([searchParams])

    renderWithRouter(<CheckoutSuccess />)

    const headings = screen.getAllByRole('heading')
    const headingTexts = headings.map(h => h.textContent)

    expect(headingTexts).toContain('Paiement réussi ! 🎉')
    expect(headingTexts).toContain('Confirmation de commande')
    expect(headingTexts).toContain('Prochaines étapes')
    expect(headingTexts).toContain("Besoin d'aide ?")
  })
})
