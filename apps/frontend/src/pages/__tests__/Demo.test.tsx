import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import Demo from '../Demo'

const mockSubmitForm = vi.fn().mockResolvedValue({ success: true })
const mockClearResponse = vi.fn()

vi.mock('@/hooks/useDemoForm', () => ({
  useDemoForm: () => ({
    submitForm: mockSubmitForm,
    clearResponse: mockClearResponse,
    response: null,
    isSubmitting: false,
  }),
}))

describe('Demo page', () => {
  it('renders the demo hero content', () => {
    render(
      <MemoryRouter>
        <Demo />
      </MemoryRouter>
    )

    expect(
      screen.getByRole('heading', { name: /Découvrez TCDynamics/i })
    ).toBeInTheDocument()
  })

  it('submits the demo request form', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <Demo />
      </MemoryRouter>
    )

    const submitButton = screen.getByRole('button', {
      name: /Réserver ma démo gratuite/i,
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
        expect(mockSubmitForm).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Jean Dupont',
            email: 'jean@example.com',
            company: 'Acme',
          })
        )
      },
      { timeout: 5000 }
    )
  })
})
