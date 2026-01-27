import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import Settings from '../Settings'

const mockUseRequireAuth = vi.fn()
const mockSuccess = vi.fn()
const mockError = vi.fn()

vi.mock('@/hooks/useAuth', () => ({
  useRequireAuth: () => mockUseRequireAuth(),
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
  it('renders configuration fields when signed in', () => {
    mockUseRequireAuth.mockReturnValue({ isSignedIn: true, loading: false })

    render(<Settings />)

    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.getByTestId('api-key-manager')).toBeInTheDocument()
  })

  it('saves settings to localStorage', async () => {
    const user = userEvent.setup()
    mockUseRequireAuth.mockReturnValue({ isSignedIn: true, loading: false })

    render(<Settings />)

    await user.type(screen.getByLabelText(/Project ID/i), 'project-1')
    await user.type(screen.getByLabelText(/Public Write Key/i), 'pk_123')
    await user.click(screen.getByRole('button', { name: /Save/i }))

    expect(localStorage.getItem('rum.projectId:v1')).toBe('project-1')
    expect(localStorage.getItem('rum.writeKey:v1')).toBe('pk_123')
    expect(mockSuccess).toHaveBeenCalled()
  })
})
