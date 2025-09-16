import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AIChatbot from '../AIChatbot'

describe('AIChatbot Component', () => {
  it('should render chatbot interface', () => {
    render(<AIChatbot />)

    expect(screen.getByText(/Assistant IA/i)).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText(/Tapez votre message/i)
    ).toBeInTheDocument()
  })

  it('should show welcome message', () => {
    render(<AIChatbot />)

    expect(
      screen.getByText(/Bonjour ! Je suis votre assistant IA/i)
    ).toBeInTheDocument()
  })

  it('should allow typing messages', () => {
    render(<AIChatbot />)

    const input = screen.getByPlaceholderText(/Tapez votre message/i)
    fireEvent.change(input, { target: { value: 'Test message' } })

    expect(input).toHaveValue('Test message')
  })

  it('should send message when button clicked', async () => {
    render(<AIChatbot />)

    const input = screen.getByPlaceholderText(/Tapez votre message/i)
    const sendButton = screen.getByRole('button', { name: /envoyer/i })

    fireEvent.change(input, { target: { value: 'Hello AI' } })
    fireEvent.click(sendButton)

    // Wait for the message to appear in chat
    await waitFor(() => {
      expect(screen.getByText('Hello AI')).toBeInTheDocument()
    })
  })

  it('should show typing indicator when processing', () => {
    render(<AIChatbot />)

    const input = screen.getByPlaceholderText(/Tapez votre message/i)
    const sendButton = screen.getByRole('button', { name: /envoyer/i })

    fireEvent.change(input, { target: { value: 'Test' } })
    fireEvent.click(sendButton)

    // Should show typing indicator briefly
    expect(screen.getByText(/écrit/i)).toBeInTheDocument()
  })

  it('should clear input after sending', async () => {
    render(<AIChatbot />)

    const input = screen.getByPlaceholderText(/Tapez votre message/i)
    const sendButton = screen.getByRole('button', { name: /envoyer/i })

    fireEvent.change(input, { target: { value: 'Test message' } })
    fireEvent.click(sendButton)

    await waitFor(() => {
      expect(input).toHaveValue('')
    })
  })

  it('should handle Enter key to send message', () => {
    render(<AIChatbot />)

    const input = screen.getByPlaceholderText(/Tapez votre message/i)

    fireEvent.change(input, { target: { value: 'Enter test' } })
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

    expect(screen.getByText('Enter test')).toBeInTheDocument()
  })

  it('should have accessibility features', () => {
    render(<AIChatbot />)

    const input = screen.getByPlaceholderText(/Tapez votre message/i)
    expect(input).toHaveAttribute('aria-label')
  })

  it('should display conversation history', () => {
    render(<AIChatbot />)

    const messages = screen.getAllByRole('listitem')
    expect(messages.length).toBeGreaterThan(0)
  })
})
