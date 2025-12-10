import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import PerformanceMonitor from '../PerformanceMonitor'

// Mock performance API
const mockPerformance = {
  getEntriesByType: vi.fn(),
  memory: {
    usedJSHeapSize: 50 * 1024 * 1024, // 50MB
  },
}

// Mock performance object
Object.defineProperty(global, 'performance', {
  value: mockPerformance,
  writable: true,
})

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
}
Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
})

// Mock process.env
vi.mock('process', () => ({
  env: {
    NODE_ENV: 'development',
  },
}))

describe('PerformanceMonitor Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.stubEnv('NODE_ENV', 'test')
    vi.stubEnv('VITEST', 'true')

    // Reset performance mock with navigation + paint entries
    mockPerformance.memory = {
      usedJSHeapSize: 50 * 1024 * 1024,
    }
    mockPerformance.getEntriesByType.mockImplementation(type => {
      if (type === 'navigation') {
        return [
          {
            loadEventEnd: 1000,
            fetchStart: 100,
          },
        ]
      }
      if (type === 'paint') {
        return [
          {
            name: 'first-contentful-paint',
            startTime: 200,
          },
        ]
      }
      return []
    })

    mockLocalStorage.getItem.mockReturnValue(null)

    // Default document state
    Object.defineProperty(document, 'readyState', {
      value: 'complete',
      writable: true,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should not render when not in development and showPerfMonitor is false', () => {
    // Mock production environment
    vi.stubEnv('NODE_ENV', 'production')

    mockLocalStorage.getItem.mockReturnValue('false')

    const { container } = render(<PerformanceMonitor />)

    expect(container.firstChild).toBeNull()
  })

  it('should not render when metrics are not available', () => {
    mockPerformance.getEntriesByType.mockReturnValue([])

    const { container } = render(<PerformanceMonitor />)

    expect(container.firstChild).toBeNull()
  })

  it('should render performance metrics in development mode', async () => {
    render(<PerformanceMonitor />)

    await waitFor(() => {
      expect(screen.getByText('Performance Monitor')).toBeInTheDocument()
      expect(screen.getByText(/Load: \d+ms/)).toBeInTheDocument()
      expect(screen.getByText(/Render: \d+ms/)).toBeInTheDocument()
      expect(screen.getByText(/Memory: \d+MB/)).toBeInTheDocument()
    })
  })

  it('should show metrics when showPerfMonitor is stored in localStorage', () => {
    mockLocalStorage.getItem.mockReturnValue('true')

    render(<PerformanceMonitor />)

    expect(screen.getByText('Performance Monitor')).toBeInTheDocument()
  })

  it('should hide metrics when showPerfMonitor is false in localStorage', () => {
    mockLocalStorage.getItem.mockReturnValue('false')

    const { container } = render(<PerformanceMonitor />)

    expect(container.firstChild).toBeNull()
  })

  it('should handle missing memory information gracefully', () => {
    // Remove memory from performance mock
    delete (mockPerformance as any).memory

    render(<PerformanceMonitor />)

    expect(screen.getByText('Performance Monitor')).toBeInTheDocument()
    expect(screen.queryByText(/Memory:/)).not.toBeInTheDocument()
  })

  it('should handle missing paint entries gracefully', () => {
    mockPerformance.getEntriesByType.mockImplementation(type => {
      if (type === 'navigation') {
        return [
          {
            loadEventEnd: 1000,
            fetchStart: 100,
          },
        ]
      }
      return []
    })

    render(<PerformanceMonitor />)

    expect(screen.getByText('Performance Monitor')).toBeInTheDocument()
    expect(screen.getByText('Render: 0ms')).toBeInTheDocument()
  })

  it('should toggle visibility with Ctrl+Shift+P', async () => {
    render(<PerformanceMonitor />)

    // Initially visible in development
    expect(screen.getByText('Performance Monitor')).toBeInTheDocument()

    // Press Ctrl+Shift+P
    fireEvent.keyDown(window, {
      key: 'P',
      ctrlKey: true,
      shiftKey: true,
    })

    await waitFor(() => {
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'showPerfMonitor',
        'false'
      )
    })
  })

  it('should add keyboard event listener on mount', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener')

    render(<PerformanceMonitor />)

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function)
    )
  })

  it('should remove keyboard event listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

    const { unmount } = render(<PerformanceMonitor />)

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function)
    )
  })

  it('should handle close button click', () => {
    render(<PerformanceMonitor />)

    const closeButton = screen.getByRole('button', { name: /close/i })

    fireEvent.click(closeButton)

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'showPerfMonitor',
      'false'
    )
  })

  it('should measure performance on page load', async () => {
    // Mock document.readyState as complete
    Object.defineProperty(document, 'readyState', {
      value: 'complete',
      writable: true,
    })

    render(<PerformanceMonitor />)

    await waitFor(() => {
      expect(mockPerformance.getEntriesByType).toHaveBeenCalledWith(
        'navigation'
      )
      expect(mockPerformance.getEntriesByType).toHaveBeenCalledWith('paint')
    })
  })

  it('should add load event listener when document is not ready', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener')

    // Mock document.readyState as loading
    Object.defineProperty(document, 'readyState', {
      value: 'loading',
      writable: true,
    })

    render(<PerformanceMonitor />)

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'load',
      expect.any(Function)
    )
  })

  it('should cleanup load event listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

    // Mock document.readyState as loading
    Object.defineProperty(document, 'readyState', {
      value: 'loading',
      writable: true,
    })

    const { unmount } = render(<PerformanceMonitor />)

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'load',
      expect.any(Function)
    )
  })

  it('should display correct performance values', async () => {
    // Mock specific performance values
    mockPerformance.getEntriesByType.mockImplementation(type => {
      if (type === 'navigation') {
        return [
          {
            loadEventEnd: 1500,
            fetchStart: 100,
          },
        ]
      }
      if (type === 'paint') {
        return [
          {
            name: 'first-contentful-paint',
            startTime: 250,
          },
        ]
      }
      return []
    })

    render(<PerformanceMonitor />)

    await waitFor(() => {
      expect(screen.getByText('Load: 1400ms')).toBeInTheDocument()
      expect(screen.getByText('Render: 250ms')).toBeInTheDocument()
    })
  })
})
