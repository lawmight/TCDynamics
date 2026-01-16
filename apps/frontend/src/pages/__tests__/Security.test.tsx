import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import Security from '../Security'

describe('Security page', () => {
  it('renders security header and contact link', () => {
    render(
      <MemoryRouter>
        <Security />
      </MemoryRouter>
    )

    expect(
      screen.getByRole('heading', { name: /Sécurité, conformité/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /Parler à un expert/i })
    ).toBeInTheDocument()
  })
})
