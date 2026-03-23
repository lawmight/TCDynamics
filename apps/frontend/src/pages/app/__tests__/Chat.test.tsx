import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { TooltipProvider } from '@/components/ui/tooltip'

import Chat from '../Chat'

const { fetchMock, getTokenMock } = vi.hoisted(() => ({
  fetchMock: vi.fn(),
  getTokenMock: vi.fn(),
}))

vi.mock('@/api/analytics', () => ({
  recordEvent: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      primaryEmailAddress: { emailAddress: 'tester@example.com' },
      emailAddresses: [{ emailAddress: 'tester@example.com' }],
    },
    getToken: getTokenMock,
    loading: false,
  }),
}))

globalThis.fetch = fetchMock

describe('Chat page', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    getTokenMock.mockReset()
    vi.clearAllMocks()

    getTokenMock.mockResolvedValue('test-clerk-token')
    fetchMock.mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      json: () => Promise.resolve({ response: 'Hello from OpenRouter' }),
      text: () =>
        Promise.resolve(JSON.stringify({ response: 'Hello from OpenRouter' })),
    })
  })

  it('renders chat UI and sends a message', async () => {
    render(
      <TooltipProvider>
        <Chat />
      </TooltipProvider>
    )

    const input = screen.getByPlaceholderText(/Ecrivez votre message/)
    await userEvent.type(input, 'Hello AI')

    await userEvent.click(
      screen.getByRole('button', { name: /Envoyer le message/i })
    )

    await waitFor(() =>
      expect(screen.getByText(/Hello from OpenRouter/)).toBeInTheDocument()
    )

    const [url, requestInit] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/ai?action=chat')
    expect(requestInit.headers).toMatchObject({
      'Content-Type': 'application/json',
      Authorization: 'Bearer test-clerk-token',
    })
    expect(JSON.parse(String(requestInit.body))).toMatchObject({
      message: 'Hello AI',
      sessionId: expect.any(String),
      temperature: 0.3,
      userEmail: 'tester@example.com',
    })
  })

  it('shows the backend error message when the request fails', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 401,
      headers: { get: () => 'application/json' },
      json: () => Promise.resolve({ error: 'Unauthorized' }),
      text: () => Promise.resolve(JSON.stringify({ error: 'Unauthorized' })),
    })

    render(
      <TooltipProvider>
        <Chat />
      </TooltipProvider>
    )

    const input = screen.getByPlaceholderText(/Ecrivez votre message/)
    await userEvent.type(input, 'Hello AI')

    await userEvent.click(
      screen.getByRole('button', { name: /Envoyer le message/i })
    )

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Unauthorized')
    )
  })

  it('shows a setup hint when AI service is not configured', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 503,
      headers: { get: () => 'application/json' },
      json: () => Promise.resolve({ error: 'Service IA non configuré' }),
      text: () => Promise.resolve(JSON.stringify({ error: 'Service IA non configuré' })),
    })

    render(
      <TooltipProvider>
        <Chat />
      </TooltipProvider>
    )

    const input = screen.getByPlaceholderText(/Ecrivez votre message/)
    await userEvent.type(input, 'Hello AI')

    await userEvent.click(
      screen.getByRole('button', { name: /Envoyer le message/i })
    )

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        /OPENROUTER_API_KEY/i
      )
    )
  })

  it('shows an auth error before calling the API when no token is available', async () => {
    getTokenMock.mockResolvedValueOnce(null)

    render(
      <TooltipProvider>
        <Chat />
      </TooltipProvider>
    )

    const input = screen.getByPlaceholderText(/Ecrivez votre message/)
    await userEvent.type(input, 'Hello AI')

    await userEvent.click(
      screen.getByRole('button', { name: /Envoyer le message/i })
    )

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        /Authentification requise/i
      )
    )
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('refreshes token and retries once when JWT is expired', async () => {
    getTokenMock
      .mockResolvedValueOnce('expired-token')
      .mockResolvedValueOnce('fresh-token')

    fetchMock
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        headers: { get: () => 'application/json' },
        text: () =>
          Promise.resolve(
            JSON.stringify({
              error:
                'Token verification failed: JWT is expired. Expiry date: Sun, 22 Mar 2026 13:53:10 GMT, Current date: Sun, 22 Mar 2026 13:53:27 GMT.',
            })
          ),
      })
      .mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({ response: 'Retry succeeded' }),
        text: () => Promise.resolve(JSON.stringify({ response: 'Retry succeeded' })),
      })

    render(
      <TooltipProvider>
        <Chat />
      </TooltipProvider>
    )

    const input = screen.getByPlaceholderText(/Ecrivez votre message/)
    await userEvent.type(input, 'Hello AI')

    await userEvent.click(
      screen.getByRole('button', { name: /Envoyer le message/i })
    )

    await waitFor(() =>
      expect(screen.getByText(/Retry succeeded/)).toBeInTheDocument()
    )
    expect(getTokenMock).toHaveBeenCalledTimes(2)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
