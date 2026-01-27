import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import Checkout from '../Checkout'

const mockNavigate = vi.fn()
const mockRedirectToCheckout = vi.fn()
const mockGetToken = vi.fn().mockResolvedValue('token')

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [new URLSearchParams('plan=professional')],
  }
})

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    getToken: mockGetToken,
    loading: false,
  }),
}))

vi.mock('@/utils/polar', () => ({
  redirectToCheckout: (...args: unknown[]) => mockRedirectToCheckout(...args),
}))

describe('Checkout page', () => {
  it('renders the checkout header', () => {
    render(
      <MemoryRouter>
        <Checkout />
      </MemoryRouter>
    )

    expect(
      screen.getByRole('heading', { name: /Finaliser votre abonnement/i })
    ).toBeInTheDocument()
  })

  it('triggers checkout with selected plan', async () => {
    const user = userEvent.setup()
    mockRedirectToCheckout.mockResolvedValue({})

    render(
      <MemoryRouter>
        <Checkout />
      </MemoryRouter>
    )

    await user.click(
      screen.getByRole('button', { name: /Procéder au paiement sécurisé/i })
    )

    expect(mockRedirectToCheckout).toHaveBeenCalledWith(
      'professional',
      mockGetToken
    )
  })
})
