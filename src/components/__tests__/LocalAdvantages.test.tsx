import { render, screen } from '@testing-library/react'
import LocalAdvantages from '../LocalAdvantages'

describe('LocalAdvantages Component', () => {
  it('should render local advantages section', () => {
    render(<LocalAdvantages />)

    expect(screen.getByText(/Vos avantages locaux/i)).toBeInTheDocument()
  })

  it('should display key advantages', () => {
    render(<LocalAdvantages />)

    expect(screen.getByText(/Support en français/i)).toBeInTheDocument()
    expect(screen.getByText(/Données en France/i)).toBeInTheDocument()
    expect(screen.getByText(/Conformité RGPD/i)).toBeInTheDocument()
  })

  it('should show French hosting benefits', () => {
    render(<LocalAdvantages />)

    expect(screen.getByText(/Données en France/i)).toBeInTheDocument()
    expect(screen.getByText(/Support local/i)).toBeInTheDocument()
  })

  it('should display contact information', () => {
    render(<LocalAdvantages />)

    expect(
      screen.getByText(/78180 Montigny-le-Bretonneux/i)
    ).toBeInTheDocument()
  })

  it('should display security badges', () => {
    render(<LocalAdvantages />)

    expect(screen.getAllByText(/ISO 27001/i)[0]).toBeInTheDocument()
    expect(screen.getByText(/RGPD/i)).toBeInTheDocument()
  })

  it('should show compliance information', () => {
    render(<LocalAdvantages />)

    expect(screen.getByText(/RGPD/i)).toBeInTheDocument()
    expect(screen.getByText(/Données en France/i)).toBeInTheDocument()
  })
})
