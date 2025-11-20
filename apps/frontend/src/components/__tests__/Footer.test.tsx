import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import Footer from '../Footer'

const renderFooter = () =>
  render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>
  )

describe('Footer', () => {
  it('exposes company and product routes', () => {
    renderFooter()

    expect(screen.getByRole('link', { name: /About/i })).toHaveAttribute(
      'href',
      '/about'
    )
    expect(screen.getByRole('link', { name: /Features/i })).toHaveAttribute(
      'href',
      '/features'
    )
    expect(screen.getByRole('link', { name: /Contact/i })).toHaveAttribute(
      'href',
      '/contact'
    )
  })

  it('shows trust signals required by marketing', () => {
    renderFooter()

    expect(screen.getByText(/Réponse sous 2h/i)).toBeInTheDocument()
    expect(screen.getByText(/RGPD conforme/i)).toBeInTheDocument()
  })
})
