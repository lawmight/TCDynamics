import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Contact from '../Contact'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
})

const ContactWrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
)

describe('Contact Component', () => {
  it('should render contact form', () => {
    render(
      <ContactWrapper>
        <Contact />
      </ContactWrapper>
    )
    
    expect(screen.getByText(/Contactez-nous/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Prénom/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/votre@email.fr/i)).toBeInTheDocument()
  })

  it('should have all form fields', () => {
    render(
      <ContactWrapper>
        <Contact />
      </ContactWrapper>
    )
    
    // Check for form labels (there are multiple forms, so we use getAllByText)
    expect(screen.getAllByText(/Prénom/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Email/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Téléphone/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Entreprise/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Message/i).length).toBeGreaterThan(0)
  })

  it('should validate required fields', async () => {
    render(
      <ContactWrapper>
        <Contact />
      </ContactWrapper>
    )
    
    const submitButton = screen.getByText(/Envoyer le message/i)
    fireEvent.click(submitButton)
    
    // Le formulaire ne devrait pas être soumis sans les champs requis
    await waitFor(() => {
      const emailInputs = screen.getAllByPlaceholderText(/email/i)
      const emailInput = emailInputs[emailInputs.length - 1] as HTMLInputElement
      expect(emailInput.validity.valid).toBe(false)
    })
  })

  it('should display contact information', () => {
    render(
      <ContactWrapper>
        <Contact />
      </ContactWrapper>
    )
    
    expect(screen.getByText(/78180 Montigny-le-Bretonneux/i)).toBeInTheDocument()
  })

  it('should show business hours', () => {
    render(
      <ContactWrapper>
        <Contact />
      </ContactWrapper>
    )
    
    expect(screen.getByText(/Lundi-Vendredi 8h-19h/i)).toBeInTheDocument()
  })
})