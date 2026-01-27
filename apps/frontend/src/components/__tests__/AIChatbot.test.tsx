import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

import AIChatbot from '../AIChatbot'

// Mock the chat API
vi.mock('@/api/azureServices', () => ({
  chatAPI: {
    sendSimpleMessage: vi.fn().mockImplementation(async (message: string) => {
      // Simulate async delay
      await new Promise(resolve => setTimeout(resolve, 100))
      return {
        success: true,
        data: {
          message: `Response to: ${message}`,
          usage: { totalTokens: 100 },
        },
      }
    }),
  },
}))

describe('AIChatbot Component', () => {
  it('should render floating button', () => {
    render(<AIChatbot />)

    // Should show floating button initially
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should open chatbot when button clicked', () => {
    render(<AIChatbot />)

    const floatingButton = screen.getByRole('button')
    fireEvent.click(floatingButton)

    expect(screen.getByText(/TCDynamics Assistant/i)).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText(/Posez votre question/i)
    ).toBeInTheDocument()
  })

  it('should show welcome message', () => {
    render(<AIChatbot />)

    const floatingButton = screen.getByRole('button')
    fireEvent.click(floatingButton)

    expect(
      screen.getByText(/Bonjour! Je suis votre assistant IA/i)
    ).toBeInTheDocument()
  })

  it('should allow typing messages', () => {
    render(<AIChatbot />)

    const floatingButton = screen.getByRole('button')
    fireEvent.click(floatingButton)

    const input = screen.getByPlaceholderText(/Posez votre question/i)
    fireEvent.change(input, { target: { value: 'Test message' } })

    expect(input).toHaveValue('Test message')
  })

  it('should send message when button clicked', async () => {
    render(<AIChatbot />)

    // Open the chatbot
    const floatingButton = screen.getByRole('button')
    fireEvent.click(floatingButton)

    // Wait for chatbot to open
    await waitFor(() => {
      expect(screen.getByText(/TCDynamics Assistant/i)).toBeInTheDocument()
    })

    const input = screen.getByPlaceholderText(/Posez votre question/i)
    const buttons = screen.getAllByRole('button')
    const sendButton = buttons[2] // Send button is the 3rd button (0-indexed: floating, close, send)

    fireEvent.change(input, { target: { value: 'Hello AI' } })
    fireEvent.click(sendButton)

    // Wait for the user message and response to appear in chat
    await waitFor(() => {
      expect(screen.getByText('Hello AI')).toBeInTheDocument()
      expect(
        screen.getByText('Réponse reçue du service IA.')
      ).toBeInTheDocument()
    })
  })

  it('should show typing indicator when processing', async () => {
    render(<AIChatbot />)

    // Open the chatbot
    const floatingButton = screen.getByRole('button')
    fireEvent.click(floatingButton)

    // Wait for chatbot to open
    await waitFor(() => {
      expect(screen.getByText(/TCDynamics Assistant/i)).toBeInTheDocument()
    })

    const input = screen.getByPlaceholderText(/Posez votre question/i)
    const buttons = screen.getAllByRole('button')
    const sendButton = buttons[2] // Send button is the 3rd button

    fireEvent.change(input, { target: { value: 'Test' } })
    fireEvent.click(sendButton)

    // Should show loading state (button disabled; Loader2 typing indicator uses real ~icons)
    await waitFor(() => {
      expect(sendButton).toBeDisabled()
    })
  })

  it('should clear input after sending', async () => {
    render(<AIChatbot />)

    // Open the chatbot
    const floatingButton = screen.getByRole('button')
    fireEvent.click(floatingButton)

    // Wait for chatbot to open
    await waitFor(() => {
      expect(screen.getByText(/TCDynamics Assistant/i)).toBeInTheDocument()
    })

    const input = screen.getByPlaceholderText(/Posez votre question/i)
    const buttons = screen.getAllByRole('button')
    const sendButton = buttons[2] // Send button is the 3rd button

    fireEvent.change(input, { target: { value: 'Test message' } })
    fireEvent.click(sendButton)

    await waitFor(() => {
      expect(input).toHaveValue('')
    })
  })

  it('should handle Enter key to send message', async () => {
    const user = userEvent.setup()
    render(<AIChatbot />)

    const floatingButton = screen.getByRole('button')
    await user.click(floatingButton)

    const input = screen.getByPlaceholderText(/Posez votre question/i)

    await user.type(input, 'Enter test')
    await user.keyboard('{Enter}')

    // Wait for the message and response to appear in chat
    await waitFor(() => {
      expect(screen.getByText('Enter test')).toBeInTheDocument()
      expect(
        screen.getByText('Réponse reçue du service IA.')
      ).toBeInTheDocument()
    })
  })

  it('should have accessibility features', () => {
    render(<AIChatbot />)

    const floatingButton = screen.getByRole('button')
    fireEvent.click(floatingButton)

    const input = screen.getByPlaceholderText(/Posez votre question/i)
    expect(input).toHaveAttribute('aria-label')
  })

  it('should display conversation history', () => {
    render(<AIChatbot />)

    const floatingButton = screen.getByRole('button')
    fireEvent.click(floatingButton)

    // Should display welcome message
    expect(
      screen.getByText(/Bonjour! Je suis votre assistant IA/i)
    ).toBeInTheDocument()
  })
})
