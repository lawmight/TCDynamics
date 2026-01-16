import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import GetStarted from '../GetStarted'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>(
    'react-router-dom'
  )
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

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

    const firstNameInput = screen.getByLabelText(/Prénom/i)
    const lastNameInputs = screen.getAllByLabelText(/Nom/i)
    const emailInput = screen.getByLabelText(/Email professionnel/i)
    const companyInput = screen.getByLabelText(/Entreprise/i)

    await user.type(firstNameInput, 'Jean')
    await user.type(lastNameInputs[0], 'Dupont')
    await user.type(emailInput, 'jean@example.com')
    await user.type(companyInput, 'Acme')

    const submitButton = screen.getByRole('button', {
      name: /Réserver la démo/i,
    })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/demo?plan=starter')
    })
  })
})
