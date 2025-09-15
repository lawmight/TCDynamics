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
    expect(screen.getByPlaceholderText(/Votre nom/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/votre@email.com/i)).toBeInTheDocument()
  })

  it('should have all form fields', () => {
    render(
      <ContactWrapper>
        <Contact />
      </ContactWrapper>
    )
    
    expect(screen.getByLabelText(/Nom complet/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Téléphone/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Entreprise/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Message/i)).toBeInTheDocument()
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
      const nameInput = screen.getByPlaceholderText(/Votre nom/i) as HTMLInputElement
      expect(nameInput.validity.valid).toBe(false)
    })
  })

  it('should display contact information', () => {
    render(
      <ContactWrapper>
        <Contact />
      </ContactWrapper>
    )
    
    expect(screen.getByText(/Montigny-le-Bretonneux/i)).toBeInTheDocument()
    expect(screen.getByText(/78180 Yvelines, France/i)).toBeInTheDocument()
  })

  it('should show business hours', () => {
    render(
      <ContactWrapper>
        <Contact />
      </ContactWrapper>
    )
    
    expect(screen.getByText(/Lundi - Vendredi/i)).toBeInTheDocument()
    expect(screen.getByText(/9h00 - 18h00/i)).toBeInTheDocument()
  })
})