import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, fireEvent, act, within } from '@testing-library/react'
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'

import Contact from '../Contact'

const getDemoForm = () =>
  screen.getByRole('form', {
    name: /Formulaire de demande de démonstration/i,
  })

const getContactForm = () => {
  const contactField = document.getElementById('contact-firstName')
  return contactField?.closest('form') as HTMLFormElement
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
})

const ContactWrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

describe('Contact Component - Enhanced Validation', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Demo Form Validation', () => {
    it('should validate required fields in demo form', async () => {
      render(
        <ContactWrapper>
          <Contact />
        </ContactWrapper>
      )

      const demoForm = getDemoForm()
      const submitButton = within(demoForm).getByRole('button', {
        name: /Réserver ma démonstration gratuite/i,
      })
      await act(async () => {
        fireEvent.click(submitButton)
      })

      expect(
        screen.getAllByText(/Ce champ est requis/i).length
      ).toBeGreaterThan(0)
    })

    it('should validate name length in demo form', async () => {
      render(
        <ContactWrapper>
          <Contact />
        </ContactWrapper>
      )

      const demoForm = getDemoForm()
      const firstNameInput = within(demoForm).getByLabelText(/^Prénom \*/)
      await act(async () => {
        fireEvent.change(firstNameInput, { target: { value: 'A' } })
      })

      expect(
        screen.getByText(/Le nom doit contenir au moins 2 caractères/i)
      ).toBeInTheDocument()
    })

    it('should validate email format in demo form', async () => {
      render(
        <ContactWrapper>
          <Contact />
        </ContactWrapper>
      )

      const demoForm = getDemoForm()
      const emailInput = within(demoForm).getByLabelText(/Email professionnel/i)
      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
      })

      expect(
        screen.getByText(/Veuillez entrer une adresse email valide/i)
      ).toBeInTheDocument()
    })

    it('should validate message length in demo form', async () => {
      render(
        <ContactWrapper>
          <Contact />
        </ContactWrapper>
      )

      const demoForm = getDemoForm()
      const messageInput =
        within(demoForm).getByLabelText(/Besoins spécifiques/i)
      await act(async () => {
        fireEvent.change(messageInput, { target: { value: 'short' } })
      })

      expect(
        screen.getByText(/Minimum 10 caractères requis/i)
      ).toBeInTheDocument()
    })

    it('should show validation success when all fields are valid', async () => {
      render(
        <ContactWrapper>
          <Contact />
        </ContactWrapper>
      )

      const demoForm = getDemoForm()
      const firstNameInput = within(demoForm).getByLabelText(/^Prénom \*/)
      const lastNameInput = within(demoForm).getByLabelText(/^Nom \*/)
      const emailInput = within(demoForm).getByLabelText(/Email professionnel/i)
      const messageInput =
        within(demoForm).getByLabelText(/Besoins spécifiques/i)

      await act(async () => {
        fireEvent.change(firstNameInput, { target: { value: 'Jean' } })
        fireEvent.change(lastNameInput, { target: { value: 'Dupont' } })
        fireEvent.change(emailInput, {
          target: { value: 'jean.dupont@example.com' },
        })
        fireEvent.change(messageInput, {
          target: {
            value: 'This is a valid message with more than 10 characters',
          },
        })
      })

      // After filling valid data, no validation errors should be shown
      expect(screen.queryByText(/Ce champ est requis/i)).not.toBeInTheDocument()
      expect(
        screen.queryByText(/Le nom doit contenir au moins 2 caractères/i)
      ).not.toBeInTheDocument()
    })

    it('should handle focus management for invalid fields', async () => {
      render(
        <ContactWrapper>
          <Contact />
        </ContactWrapper>
      )

      const demoForm = getDemoForm()
      const firstNameInput = within(demoForm).getByLabelText(/^Prénom \*/)
      const lastNameInput = within(demoForm).getByLabelText(/^Nom \*/)
      const emailInput = within(demoForm).getByLabelText(/Email professionnel/i)
      const messageInput =
        within(demoForm).getByLabelText(/Besoins spécifiques/i)

      await act(async () => {
        fireEvent.change(firstNameInput, { target: { value: 'Jean' } })
        fireEvent.change(lastNameInput, { target: { value: 'Dupont' } })
        fireEvent.change(emailInput, {
          target: { value: 'jean.dupont@example.com' },
        })
      })

      const submitButton = within(demoForm).getByRole('button', {
        name: /Réserver ma démonstration gratuite/i,
      })
      await act(async () => {
        fireEvent.click(submitButton)
      })

      expect(messageInput).toHaveFocus()
    })
  })

  describe('Contact Form Validation', () => {
    it('should validate required fields in contact form', async () => {
      render(
        <ContactWrapper>
          <Contact />
        </ContactWrapper>
      )

      const submitButton = screen.getByText(/Envoyer le message/i)
      await act(async () => {
        fireEvent.click(submitButton)
      })

      expect(
        screen.getAllByText(/Ce champ est requis/i).length
      ).toBeGreaterThan(0)
    })

    it('should validate email format in contact form', async () => {
      render(
        <ContactWrapper>
          <Contact />
        </ContactWrapper>
      )

      const contactForm = getContactForm()
      const emailInput = within(contactForm).getByLabelText('Email *')
      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
      })

      expect(
        screen.getByText(/Veuillez entrer une adresse email valide/i)
      ).toBeInTheDocument()
    })

    it('should validate message length in contact form', async () => {
      render(
        <ContactWrapper>
          <Contact />
        </ContactWrapper>
      )

      const contactForm = getContactForm()
      const messageInput = within(contactForm).getByLabelText(/Message/i)
      await act(async () => {
        fireEvent.change(messageInput, { target: { value: 'short' } })
      })

      expect(
        screen.getByText(/Minimum 10 caractères requis/i)
      ).toBeInTheDocument()
    })

    it('should show character count for message field', async () => {
      render(
        <ContactWrapper>
          <Contact />
        </ContactWrapper>
      )

      const contactForm = getContactForm()
      const messageInput = within(contactForm).getByLabelText(/Message/i)
      await act(async () => {
        fireEvent.change(messageInput, { target: { value: 'Hello' } })
      })

      expect(screen.getByText(/5\/5000 caractères/i)).toBeInTheDocument()
    })
  })

  describe('Accessibility Features', () => {
    it('should have proper aria attributes', () => {
      render(
        <ContactWrapper>
          <Contact />
        </ContactWrapper>
      )

      const demoForm = getDemoForm()
      const firstNameInput = within(demoForm).getByLabelText(/^Prénom \*/)
      expect(firstNameInput).toHaveAttribute('aria-required', 'true')
      expect(firstNameInput).toHaveAttribute('aria-invalid')

      const emailInput = within(demoForm).getByLabelText(/Email professionnel/i)
      expect(emailInput).toHaveAttribute('aria-required', 'true')
      expect(emailInput).toHaveAttribute('aria-invalid')
    })

    it('should have error messages with proper roles', async () => {
      render(
        <ContactWrapper>
          <Contact />
        </ContactWrapper>
      )

      const demoForm = getDemoForm()
      const emailInput = within(demoForm).getByLabelText(/Email professionnel/i)
      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
      })

      const errorMessage = screen.getByText(
        /Veuillez entrer une adresse email valide/i
      )
      expect(errorMessage).toHaveAttribute('role', 'status')
      expect(errorMessage).toHaveAttribute('aria-live', 'polite')
    })

    it('should have proper form structure', () => {
      render(
        <ContactWrapper>
          <Contact />
        </ContactWrapper>
      )

      expect(getDemoForm()).toBeInTheDocument()
      expect(getContactForm()).toBeInTheDocument()
    })
  })

  describe('Form Submission', () => {
    beforeEach(() => {
      vi.stubGlobal('fetch', vi.fn())
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('should prevent submission with validation errors', async () => {
      render(
        <ContactWrapper>
          <Contact />
        </ContactWrapper>
      )

      const demoForm = getDemoForm()
      const submitButton = within(demoForm).getByRole('button', {
        name: /Réserver ma démonstration gratuite/i,
      })
      await act(async () => {
        fireEvent.click(submitButton)
      })

      expect(global.fetch).not.toHaveBeenCalled()
    })

    it('should submit form when all fields are valid', async () => {
      const mockResponse = {
        ok: true,
        json: () =>
          Promise.resolve({ success: true, message: 'Form submitted' }),
      }

      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockResponse
      )

      render(
        <ContactWrapper>
          <Contact />
        </ContactWrapper>
      )

      const demoForm = getDemoForm()
      const firstNameInput = within(demoForm).getByLabelText(/^Prénom \*/)
      const lastNameInput = within(demoForm).getByLabelText(/^Nom \*/)
      const emailInput = within(demoForm).getByLabelText(/Email professionnel/i)
      const messageInput =
        within(demoForm).getByLabelText(/Besoins spécifiques/i)

      await act(async () => {
        fireEvent.change(firstNameInput, { target: { value: 'Jean' } })
        fireEvent.change(lastNameInput, { target: { value: 'Dupont' } })
        fireEvent.change(emailInput, {
          target: { value: 'jean.dupont@example.com' },
        })
        fireEvent.change(messageInput, {
          target: {
            value:
              'This is a valid message with more than 10 characters for testing',
          },
        })
      })

      const submitButton = within(demoForm).getByRole('button', {
        name: /Réserver ma démonstration gratuite/i,
      })
      await act(async () => {
        fireEvent.click(submitButton)
      })

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: expect.any(String),
        })
      )
    })
  })

  describe('Real-time Validation', () => {
    it('should update validation state on input change', async () => {
      render(
        <ContactWrapper>
          <Contact />
        </ContactWrapper>
      )

      const demoForm = getDemoForm()
      const firstNameInput = within(demoForm).getByLabelText(/^Prénom \*/)

      await act(async () => {
        fireEvent.change(firstNameInput, { target: { value: 'A' } })
      })
      expect(
        screen.getByText(/Le nom doit contenir au moins 2 caractères/i)
      ).toBeInTheDocument()

      await act(async () => {
        fireEvent.change(firstNameInput, { target: { value: 'Jean' } })
      })
      expect(
        screen.queryByText(/Le nom doit contenir au moins 2 caractères/i)
      ).not.toBeInTheDocument()
    })

    // Frontend validation does not show spam warnings - that is backend-only
  })
})
