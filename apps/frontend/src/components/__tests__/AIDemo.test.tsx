import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import AIDemo from '../AIDemo'

const renderWithRouter = () =>
  render(
    <MemoryRouter>
      <AIDemo />
    </MemoryRouter>
  )

describe('AIDemo Component', () => {
  it('should render demo interface', () => {
    renderWithRouter()

    expect(
      screen.getByText(/Essayez gratuitement dès maintenant/i)
    ).toBeInTheDocument()
    // Check for the tab text specifically
    expect(
      screen.getByRole('tab', { name: /Assistant IA Conversationnel/i })
    ).toBeInTheDocument()
  })

  it('should show demo features', async () => {
    const user = userEvent.setup()
    renderWithRouter()

    // Switch to documents tab
    const documentsTab = screen.getByRole('tab', {
      name: /Traitement de Documents/i,
    })
    await user.click(documentsTab)

    // Wait for the tab content to update
    await waitFor(() => {
      expect(screen.getByText(/Traitement de factures/i)).toBeInTheDocument()
      expect(screen.getByText(/Extraction de données/i)).toBeInTheDocument()
      expect(
        screen.getByText(/Classification automatique/i)
      ).toBeInTheDocument()
    })
  })

  it('should have interactive demo buttons', () => {
    renderWithRouter()

    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)

    // Should have demo action buttons
    const demoButton = screen.getByRole('button', {
      name: /Démarrer l'Essai Gratuit/i,
    })
    expect(demoButton).toBeInTheDocument()
  })

  it('should show demo features correctly', async () => {
    const user = userEvent.setup()
    renderWithRouter()

    // Check for the main heading with span content
    expect(screen.getByText(/Découvrez l'IA en/i)).toBeInTheDocument()
    expect(screen.getByText(/Action/i)).toBeInTheDocument()
    expect(
      screen.getByRole('tab', { name: /Assistant IA Conversationnel/i })
    ).toBeInTheDocument()

    // Switch to documents tab for document-specific features
    const documentsTab = screen.getByRole('tab', {
      name: /Traitement de Documents/i,
    })
    await user.click(documentsTab)

    // Wait for the tab content to update
    await waitFor(() => {
      // Look for the heading specifically in the content area
      const headings = screen.getAllByText(/Traitement de Documents IA/i)
      expect(headings.length).toBeGreaterThan(0)
      expect(
        screen.getByText(/Extraction de texte précise/i)
      ).toBeInTheDocument()
      expect(screen.getByText(/Extraction de données/i)).toBeInTheDocument()
      expect(
        screen.getByText(/Classification automatique/i)
      ).toBeInTheDocument()
    })
  })

  it('should display call-to-action buttons', () => {
    renderWithRouter()

    expect(
      screen.getByRole('button', { name: /Démarrer l'Essai Gratuit/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Planifier une Démo/i })
    ).toBeInTheDocument()
  })

  it('should display precision information', async () => {
    const user = userEvent.setup()
    renderWithRouter()

    // Switch to documents tab where precision information is displayed
    const documentsTab = screen.getByRole('tab', {
      name: /Traitement de Documents/i,
    })
    await user.click(documentsTab)

    // Wait for the tab content to update
    await waitFor(() => {
      expect(screen.getByText(/précision de 99\.7%/i)).toBeInTheDocument()
    })
  })

  it('should display sample conversations', () => {
    renderWithRouter()

    expect(screen.getByText(/Exemples de Conversations/i)).toBeInTheDocument()
    expect(
      screen.getByText(/Comment configurer l'automatisation/i)
    ).toBeInTheDocument()
  })

  it('should be accessible', () => {
    renderWithRouter()

    // Check that the section has proper heading structure
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Découvrez l'IA en Action/i,
      })
    ).toBeInTheDocument()
  })

  it('should have working tabs', () => {
    renderWithRouter()

    // Should have tabs for different demo features
    const chatbotTab = screen.getByRole('tab', {
      name: /Assistant IA Conversationnel/i,
    })
    const documentsTab = screen.getByRole('tab', {
      name: /Traitement de Documents/i,
    })

    expect(chatbotTab).toBeInTheDocument()
    expect(documentsTab).toBeInTheDocument()
  })

  it('should display sample data', () => {
    renderWithRouter()

    expect(screen.getByText(/Exemples de Conversations/i)).toBeInTheDocument()
    // The component shows conversation examples, not invoice data
  })
})
