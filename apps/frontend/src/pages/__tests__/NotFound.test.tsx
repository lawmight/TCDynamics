import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import NotFound from '../NotFound'

describe('NotFound Page', () => {
  const renderNotFound = (initialPath = '/unknown-path') => {
    return render(
      <MemoryRouter initialEntries={[initialPath]}>
        <NotFound />
      </MemoryRouter>
    )
  }

  it('should render 404 error message', () => {
    renderNotFound()

    expect(screen.getByText('404')).toBeInTheDocument()
    expect(
      screen.getByText('Oups, cette page est introuvable.')
    ).toBeInTheDocument()
  })

  it('should render return to home link', () => {
    renderNotFound()

    const homeLink = screen.getByRole('link', { name: /Retour à l'accueil/i })
    expect(homeLink).toBeInTheDocument()
    expect(homeLink).toHaveAttribute('href', '/')
  })

  it('should have correct layout and styling', () => {
    renderNotFound()

    const contentContainer = screen.getByText('404').closest('div')
    expect(contentContainer).toHaveClass('text-center')

    const parentDiv = contentContainer?.parentElement
    expect(parentDiv).toHaveClass(
      'flex',
      'min-h-screen',
      'items-center',
      'justify-center',
      'bg-background'
    )
  })
})
