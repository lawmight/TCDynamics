import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import Login from '../Login'

const signInWithGoogle = vi.fn()

vi.mock('lucide-react', () => ({
  LogIn: () => null,
  ShieldCheck: () => null,
}))

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    signInWithGoogle,
  }),
}))

describe('Login page', () => {
  it('renders Google login button', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )
    expect(
      screen.getByRole('button', { name: /Continue with Google/i })
    ).toBeInTheDocument()
  })
})
