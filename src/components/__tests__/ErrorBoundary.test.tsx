import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ErrorBoundary from '../ErrorBoundary'
import React from 'react'

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

  it('resets error state when reset button is clicked', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    // Verify error state is shown
    expect(
      screen.getByText(/Quelque chose s'est mal passé/i)
    ).toBeInTheDocument()

    // Click reset button
    const resetButton = screen.getByRole('button', { name: /Réessayer/i })
    fireEvent.click(resetButton)

    // Re-render with non-throwing component
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    )

    // Verify normal content is shown
    expect(screen.getByText('No error')).toBeInTheDocument()
    expect(
      screen.queryByText(/Quelque chose s'est mal passé/i)
    ).not.toBeInTheDocument()
  })

  it('calls window.location.reload when reset is clicked', () => {
    const reloadSpy = vi.fn()
    Object.defineProperty(window, 'location', {
      value: { reload: reloadSpy },
      writable: true,
    })

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    const resetButton = screen.getByRole('button', { name: /Réessayer/i })
    fireEvent.click(resetButton)

    expect(reloadSpy).toHaveBeenCalled()
  })

  it('logs error to console in componentDidCatch', () => {
    const consoleSpy = vi.spyOn(console, 'error')

    render(
      <ErrorBoundary>
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
    const resetButton = screen.getByRole('button', { name: /Réessayer/i })
    fireEvent.click(resetButton)

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
