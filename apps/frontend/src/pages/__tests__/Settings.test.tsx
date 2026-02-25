import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import Settings from '../Settings'

const renderSettings = () =>
  render(
    <MemoryRouter>
      <Settings />
    </MemoryRouter>
  )

const mockUseRequireAuth = vi.fn()
const mockSuccess = vi.fn()
const mockError = vi.fn()

vi.mock('@/hooks/useAuth', () => ({
  useRequireAuth: () => mockUseRequireAuth(),
}))

vi.mock('@clerk/clerk-react', () => ({
  useUser: () => ({
    user: {
      firstName: 'Test',
      lastName: 'User',
      primaryEmailAddress: { emailAddress: 'test@example.com' },
      emailAddresses: [{ emailAddress: 'test@example.com' }],
    },
  }),
}))

vi.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => mockSuccess(...args),
    error: (...args: unknown[]) => mockError(...args),
  },
}))

vi.mock('@/components/app/ApiKeyManager', () => ({
  default: () => <div data-testid="api-key-manager" />,
}))

describe('Settings page', () => {
  it('renders settings with tabs when signed in', () => {
    mockUseRequireAuth.mockReturnValue({ isSignedIn: true, loading: false })

    renderSettings()

    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Profile/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /API Keys/i })).toBeInTheDocument()
  })

  it('saves RUM settings on developer tab', async () => {
    const user = userEvent.setup()
    mockUseRequireAuth.mockReturnValue({ isSignedIn: true, loading: false })

    renderSettings()

    await user.click(screen.getByRole('tab', { name: /Developer/i }))
    await user.type(screen.getByLabelText(/Project ID/i), 'project-1')
    await user.type(screen.getByLabelText(/Public Write Key/i), 'pk_123')
    await user.click(screen.getByRole('button', { name: /Save Configuration/i }))

    expect(localStorage.getItem('rum.projectId:v1')).toBe('project-1')
    expect(localStorage.getItem('rum.writeKey:v1')).toBe('pk_123')
    expect(mockSuccess).toHaveBeenCalled()
  })
})
