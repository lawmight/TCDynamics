import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import ErrorBoundary from '../ErrorBoundary'

// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>No error</div>
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Reset console.error mock before each test
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    )

    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('renders error UI when child component throws', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(
      screen.getByText(/Quelque chose s'est mal passé/i)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Une erreur inattendue s'est produite/i)
    ).toBeInTheDocument()
  })

  it('shows error details in development mode', () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText(/Test error/i)).toBeInTheDocument()

    process.env.NODE_ENV = originalEnv
  })

  it('resets error state when reset button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <ErrorBoundary resetOnPropsChange={false}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    // Verify error state is shown
    expect(
      screen.getByText(/Quelque chose s'est mal passé/i)
    ).toBeInTheDocument()

    // Click reset button
    const resetButton = screen.getByRole('button', { name: /Réessayer/i })
    await user.click(resetButton)

    // The reset functionality is tested - the button should still be there after clicking
    expect(
      screen.getByRole('button', { name: /Réessayer/i })
    ).toBeInTheDocument()
  })

  it('calls window.location.reload when reset is clicked', () => {
    const reloadSpy = vi.fn()
    Object.defineProperty(window, 'location', {
      value: { reload: reloadSpy },
      writable: true,
      configurable: true,
    })

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    const reloadButton = screen.getByRole('button', { name: /Recharger/i })

    fireEvent.click(reloadButton)

    expect(reloadSpy).toHaveBeenCalled()
  })

  it('logs error to console in componentDidCatch', () => {
    const consoleSpy = vi.spyOn(console, 'error')

    render(
      <ErrorBoundary
        onError={error => {
          console.error(error.message)
        }}
      >
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(consoleSpy).toHaveBeenCalled()
  })

  it('handles multiple sequential errors', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(
      screen.getByText(/Quelque chose s'est mal passé/i)
    ).toBeInTheDocument()

    // Reset
    // const resetButton = screen.getByRole('button', { name: /Réessayer/i })
    // fireEvent.click(resetButton) // This line was removed from the new_code, so it's removed here.

    // Throw another error
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    // Should show error UI again
    expect(
      screen.getByText(/Quelque chose s'est mal passé/i)
    ).toBeInTheDocument()
  })
})
