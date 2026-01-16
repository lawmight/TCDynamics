import { render, screen, waitFor } from '@testing-library/react'
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
      screen.getByRole('heading', { name: /Découvrez WorkFlowAI/i })
    ).toBeInTheDocument()
  })

  it('submits the demo request form', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <Demo />
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
      name: /Réserver ma démo gratuite/i,
    })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockSubmitForm).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Jean Dupont',
          email: 'jean@example.com',
          company: 'Acme',
        })
      )
    })
  })
})
