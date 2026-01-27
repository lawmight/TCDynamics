import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import GetStarted from '../GetStarted'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock useProactiveSupport hook
vi.mock('@/hooks/useProactiveSupport', () => ({
  useProactiveSupport: () => ({
    struggle: null,
    dismissHelp: vi.fn(),
    handleResourceClick: vi.fn(),
    handleFeedback: vi.fn(),
    onCooldown: false,
  }),
}))

describe('GetStarted page', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_DEMO_URL', '/demo')
  })

  it('submits the form and navigates to demo', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <GetStarted />
      </MemoryRouter>
    )

    const submitButton = screen.getByRole('button', {
      name: /Réserver la démo/i,
    })
    const form = submitButton.closest('form') as HTMLFormElement
    const formScope = form ? within(form) : screen

    const firstNameInput = formScope.getByLabelText(/^Prénom/i)
    const lastNameInput = formScope.getByLabelText(/^Nom\s*\*?$/i)
    const emailInput = formScope.getByLabelText(/Email professionnel/i)
    const companyInput = formScope.getByLabelText(/Entreprise/i)

    await user.type(firstNameInput, 'Jean')
    await user.type(lastNameInput, 'Dupont')
    await user.type(emailInput, 'jean@example.com')
    await user.type(companyInput, 'Acme')

    // Bypass HTML5 validation in jsdom so the submit event fires and onSubmit runs
    if (form) form.noValidate = true

    await user.click(submitButton)

    await waitFor(
      () => {
        expect(mockNavigate).toHaveBeenCalledWith('/demo?plan=starter')
      },
      { timeout: 5000 }
    )
  })
})
