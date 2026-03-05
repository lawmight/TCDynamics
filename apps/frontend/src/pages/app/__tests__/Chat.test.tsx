import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { TooltipProvider } from '@/components/ui/tooltip'

import Chat from '../Chat'

vi.mock('@/api/analytics', () => ({
  recordEvent: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { email: 'tester@example.com' }, loading: false }),
}))

const fetchMock = vi.fn()
globalThis.fetch = fetchMock

describe('Chat page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fetchMock.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ message: 'Hello from OpenRouter' }),
      text: () => Promise.resolve('Hello from OpenRouter'),
    })
  })

  it('renders chat UI and sends a message', async () => {
    render(
      <TooltipProvider>
        <Chat />
      </TooltipProvider>
    )

    const input = screen.getByPlaceholderText(/Type a message/)
    await userEvent.type(input, 'Hello AI')

    await userEvent.click(screen.getByRole('button', { name: /Send/i }))

    await waitFor(() =>
      expect(screen.getByText(/Hello from OpenRouter/)).toBeInTheDocument()
    )
  })
})
