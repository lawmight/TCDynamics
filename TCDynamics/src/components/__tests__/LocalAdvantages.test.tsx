import { render, screen } from '@testing-library/react'
import LocalAdvantages from '../LocalAdvantages'

describe('LocalAdvantages Component', () => {
  it('should render local advantages section', () => {
    render(<LocalAdvantages />)

    expect(screen.getByText(/Avantages locaux/i)).toBeInTheDocument()
  })

  it('should display key advantages', () => {
    render(<LocalAdvantages />)

    expect(screen.getByText(/Hébergement en France/i)).toBeInTheDocument()
    expect(screen.getByText(/Support local/i)).toBeInTheDocument()
    expect(screen.getByText(/Conformité RGPD/i)).toBeInTheDocument()
  })

  it('should show French hosting benefits', () => {
    render(<LocalAdvantages />)

    expect(screen.getByText(/Données sécurisées/i)).toBeInTheDocument()
    expect(screen.getByText(/Performance optimisée/i)).toBeInTheDocument()
  })

  it('should display contact information', () => {
    render(<LocalAdvantages />)

    expect(
      screen.getByText(/78180 Montigny-le-Bretonneux/i)
    ).toBeInTheDocument()
    expect(screen.getByText(/Lundi-Vendredi 8h-19h/i)).toBeInTheDocument()
  })

  it('should have proper accessibility', () => {
    render(<LocalAdvantages />)

    const section = screen.getByRole('region')
    expect(section).toHaveAttribute('aria-labelledby')
  })

  it('should display security badges', () => {
    render(<LocalAdvantages />)

    expect(screen.getByText(/ISO 27001/i)).toBeInTheDocument()
    expect(screen.getByText(/HDS/i)).toBeInTheDocument()
  })

  it('should show compliance information', () => {
    render(<LocalAdvantages />)

    expect(screen.getByText(/RGPD compliant/i)).toBeInTheDocument()
    expect(screen.getByText(/Données en France/i)).toBeInTheDocument()
  })
})
