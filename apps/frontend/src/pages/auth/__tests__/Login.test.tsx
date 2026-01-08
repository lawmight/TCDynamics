import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import Login from '../Login'

vi.mock('lucide-react', () => ({
  LogIn: () => null,
  ShieldCheck: () => null,
}))

// Mock Clerk hooks directly since component uses @clerk/clerk-react
vi.mock('@clerk/clerk-react', async () => {
  const actual = await vi.importActual('@clerk/clerk-react')
  return {
    ...actual,
    useAuth: () => ({
      isSignedIn: false,
      isLoaded: true,
      user: null,
    }),
    SignedIn: ({ children }: { children: React.ReactNode }) => null,
    SignedOut: ({ children }: { children: React.ReactNode }) => children,
    SignInButton: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
  }
})

describe('Login page', () => {
  it('renders Sign In button', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument()
  })
})
