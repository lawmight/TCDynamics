import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import ApiKeyManager from '../ApiKeyManager'

// Mock the useApiKeys hook
const mockCreateKey = vi.fn()
const mockRevokeKey = vi.fn()
const mockClearCreatedKey = vi.fn()

vi.mock('@/hooks/useApiKeys', () => ({
  useApiKeys: () => ({
    keys: [
      {
        id: '1',
        key_prefix: 'tc_abc123...',
        name: 'Production Server',
        created_at: '2024-01-01T00:00:00Z',
        revoked_at: null,
        last_used_at: '2024-01-02T00:00:00Z',
      },
      {
        id: '2',
        key_prefix: 'tc_def456...',
        name: null,
        created_at: '2024-01-03T00:00:00Z',
        revoked_at: null,
        last_used_at: null,
      },
    ],
    isLoading: false,
    error: null,
    createKey: mockCreateKey,
    revokeKey: mockRevokeKey,
    isCreating: false,
    isRevoking: false,
    createdKey: null,
    clearCreatedKey: mockClearCreatedKey,
  }),
}))

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Key: () => <span data-testid="key-icon" />,
  Plus: () => <span data-testid="plus-icon" />,
  Trash2: () => <span data-testid="trash-icon" />,
  AlertTriangle: () => <span data-testid="alert-icon" />,
  Loader2: () => <span data-testid="loader-icon" />,
  Calendar: () => <span data-testid="calendar-icon" />,
  Clock: () => <span data-testid="clock-icon" />,
  CheckCircle2: () => <span data-testid="check-icon" />,
  Copy: () => <span data-testid="copy-icon" />,
  X: () => <span data-testid="x-icon" />,
}))

describe('ApiKeyManager', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Helper function to render with Router context
  const renderApiKeyManager = () =>
    render(
      <MemoryRouter>
        <ApiKeyManager />
      </MemoryRouter>
    )

  it('renders key list with correct data', () => {
    renderApiKeyManager()

    // Check for named key
    expect(screen.getByText('Production Server')).toBeInTheDocument()
    expect(screen.getByText('tc_abc123...')).toBeInTheDocument()

    // Check for unnamed key
    expect(screen.getByText('Unnamed key')).toBeInTheDocument()
    expect(screen.getByText('tc_def456...')).toBeInTheDocument()
  })

  it('shows create button when keys exist', () => {
    renderApiKeyManager()

    const createButton = screen.getByRole('button', { name: /create key/i })
    expect(createButton).toBeInTheDocument()
  })

  it('opens revoke confirmation dialog when revoke button is clicked', async () => {
    const user = userEvent.setup()
    renderApiKeyManager()

    // Find and click first revoke button
    const revokeButtons = screen.getAllByRole('button', { name: /revoke key/i })
    await user.click(revokeButtons[0])

    // Check dialog content appears
    await waitFor(() => {
      expect(screen.getByText(/Revoke API Key/)).toBeInTheDocument()
      expect(screen.getByText(/Immediate Impact/)).toBeInTheDocument()
    })
  })

  it('displays key context in revocation dialog', async () => {
    const user = userEvent.setup()
    renderApiKeyManager()

    // Click revoke on first key
    const revokeButtons = screen.getAllByRole('button', { name: /revoke key/i })
    await user.click(revokeButtons[0])

    // Check key prefix is shown in dialog
    await waitFor(() => {
      expect(screen.getByText('Key Prefix:')).toBeInTheDocument()
    })
  })
})
