import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import NotFound from '../NotFound'

// Mock console.log to avoid noise in tests
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {})

describe('NotFound Page', () => {
  beforeEach(() => {
    mockConsoleLog.mockClear()
  })

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
    expect(screen.getByText('Oops! Page not found')).toBeInTheDocument()
  })

  it('should render return to home link', () => {
    renderNotFound()

    const homeLink = screen.getByRole('link', { name: /return to home/i })
    expect(homeLink).toBeInTheDocument()
    expect(homeLink).toHaveAttribute('href', '/')
  })

  it('should have correct layout and styling', () => {
    renderNotFound()

    const container = screen.getByText('404').closest('div')
    expect(container).toHaveClass('text-center')

    const parentDiv = container?.parentElement
    expect(parentDiv).toHaveClass(
      'flex',
      'min-h-screen',
      'items-center',
      'justify-center',
      'bg-gray-100'
    )
  })

  it('should track 404 in development mode', () => {
    // Mock import.meta.env.DEV
    vi.stubGlobal('import', {
      meta: {
        env: {
          DEV: true,
        },
      },
    })

    renderNotFound('/test-path')

    // Should log the 404 error in development
    expect(mockConsoleLog).toHaveBeenCalled()

    vi.unstubAllGlobals()
  })

  it('should not track 404 in production mode', () => {
    // Mock import.meta.env.DEV as false
    vi.stubGlobal('import', {
      meta: {
        env: {
          DEV: false,
        },
      },
    })

    renderNotFound('/test-path')

    // Should not log in production
    expect(mockConsoleLog).not.toHaveBeenCalled()

    vi.unstubAllGlobals()
  })

  it('should use location pathname in effect', () => {
    const mockLocation = { pathname: '/test-path' }

    // Mock useLocation hook
    vi.mock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom')
      return {
        ...actual,
        useLocation: () => mockLocation,
      }
    })

    renderNotFound()

    expect(mockConsoleLog).toHaveBeenCalled()

    vi.restoreAllMocks()
  })
})
