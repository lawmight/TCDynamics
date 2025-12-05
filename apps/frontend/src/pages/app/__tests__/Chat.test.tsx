import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import Chat from '../Chat'

vi.mock('@/api/vertex', () => ({
  sendVertexChat: vi.fn().mockResolvedValue({ message: 'Hello from Vertex' }),
}))

vi.mock('@/api/analytics', () => ({
  recordEvent: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { email: 'tester@example.com' }, loading: false }),
}))

describe('Chat page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders chat UI and sends a message', async () => {
    render(<Chat />)

    const input = screen.getByPlaceholderText(/Ask anything/)
    await userEvent.type(input, 'Hello AI')

    await userEvent.click(screen.getByRole('button', { name: /Send/i }))

    await waitFor(() =>
      expect(screen.getByText(/Hello from Vertex/)).toBeInTheDocument()
    )
  })
})
