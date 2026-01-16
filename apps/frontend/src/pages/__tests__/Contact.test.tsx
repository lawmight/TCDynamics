import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import ContactPage from '../Contact'

vi.mock('@/components/Contact', () => ({
  default: () => <div data-testid="contact-component" />,
}))

describe('Contact page', () => {
  it('renders the contact component', () => {
    render(<ContactPage />)

    expect(screen.getByTestId('contact-component')).toBeInTheDocument()
  })
})
