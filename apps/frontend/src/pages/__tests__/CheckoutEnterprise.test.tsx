import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import CheckoutEnterprise from '../CheckoutEnterprise'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('CheckoutEnterprise page', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
    })
  })

  it('shows validation error for amounts below minimum', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <CheckoutEnterprise />
      </MemoryRouter>
    )

    const input = screen.getByLabelText(/Montant/i)
    await user.type(input, '1000')

    expect(screen.getByText(/Le montant minimum est de/i)).toBeInTheDocument()
  })

  it('submits and redirects on valid amount', async () => {
    const user = userEvent.setup()
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, url: 'https://checkout.test' }),
    })
    Object.defineProperty(global, 'fetch', {
      value: mockFetch,
      writable: true,
    })

    render(
      <MemoryRouter>
        <CheckoutEnterprise />
      </MemoryRouter>
    )

    await user.type(screen.getByLabelText(/Montant/i), '2160')
    const form = screen
      .getByRole('button', { name: /Continuer/i })
      .closest('form')
    fireEvent.submit(form!)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled()
      expect(window.location.href).toBe('https://checkout.test')
    })
  })
})
