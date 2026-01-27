import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ErrorBoundary, monitoring } from '../monitoring'

const ThrowError = () => {
  throw new Error('boom')
}

const Fallback = ({
  error,
  resetError,
}: {
  error?: Error
  resetError: () => void
}) => (
  <div>
    <p>{error?.message}</p>
    <button onClick={resetError}>Reset</button>
  </div>
)

describe('monitoring ErrorBoundary', () => {
  it('renders fallback and resets on action', async () => {
    const user = userEvent.setup()
    const spy = vi.spyOn(monitoring, 'captureError')

    render(
      <ErrorBoundary fallback={Fallback}>
        <ThrowError />
      </ErrorBoundary>
    )

    expect(screen.getByText('boom')).toBeInTheDocument()
    expect(spy).toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: /Reset/i }))
  })
})
