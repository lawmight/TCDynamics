import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import PerformanceMonitor from '../PerformanceMonitor'

import { getWithMigration } from '@/utils/storageMigration'

// Mock performance API (re-applied in beforeEach so global setup does not override)
const mockPerformance = {
  getEntriesByType: vi.fn(),
  memory: {
    usedJSHeapSize: 50 * 1024 * 1024, // 50MB
  },
}

// Mock storage migration so effect runs in CI regardless of import.meta.env
vi.mock('@/utils/storageMigration', () => ({
  getWithMigration: vi.fn().mockReturnValue('true'),
  LS: { SHOW_PERF_MONITOR: 'showPerfMonitor:v1' },
}))

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

    // Re-apply full performance mock so global setup does not override it
    Object.defineProperty(global, 'performance', {
      value: mockPerformance,
      writable: true,
      configurable: true,
    })

    // Ensure effect runs (metrics computed) regardless of CI env
    ;(getWithMigration as ReturnType<typeof vi.fn>).mockReturnValue('true')

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
    vi.stubEnv('NODE_ENV', 'production')
    ;(getWithMigration as ReturnType<typeof vi.fn>).mockReturnValue('false')

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
      expect(
        screen.getByText((content) => content.includes('Performance Monitor'))
      ).toBeInTheDocument()
      expect(screen.getByText(/Load: \d+ms/)).toBeInTheDocument()
      expect(screen.getByText(/Render: \d+ms/)).toBeInTheDocument()
      expect(screen.getByText(/Memory: \d+MB/)).toBeInTheDocument()
    })
  })

  it('should show metrics when showPerfMonitor is stored in localStorage', async () => {
    mockLocalStorage.getItem.mockReturnValue('true')

    render(<PerformanceMonitor />)

    await waitFor(() => {
      expect(
        screen.getByText((content) => content.includes('Performance Monitor'))
      ).toBeInTheDocument()
    })
  })

  it('should hide metrics when showPerfMonitor is false in localStorage', () => {
    ;(getWithMigration as ReturnType<typeof vi.fn>).mockReturnValue('false')

    const { container } = render(<PerformanceMonitor />)

    expect(container.firstChild).toBeNull()
  })

  it('should handle missing memory information gracefully', async () => {
    interface MockPerformance {
      getEntriesByType: ReturnType<typeof vi.fn>
      memory?: {
        usedJSHeapSize: number
        totalJSHeapSize: number
        jsHeapSizeLimit: number
      }
    }
    const perfMock = mockPerformance as MockPerformance
    delete perfMock.memory

    render(<PerformanceMonitor />)

    await waitFor(() => {
      expect(
        screen.getByText((content) => content.includes('Performance Monitor'))
      ).toBeInTheDocument()
    })
    expect(screen.queryByText(/Memory:/)).not.toBeInTheDocument()
  })

  it('should handle missing paint entries gracefully', async () => {
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

    await waitFor(() => {
      expect(
        screen.getByText((content) => content.includes('Performance Monitor'))
      ).toBeInTheDocument()
      expect(screen.getByText('Render: 0ms')).toBeInTheDocument()
    })
  })

  it('should toggle visibility with Ctrl+Shift+P', async () => {
    render(<PerformanceMonitor />)

    await waitFor(() => {
      expect(
        screen.getByText((content) => content.includes('Performance Monitor'))
      ).toBeInTheDocument()
    })

    fireEvent.keyDown(window, {
      key: 'P',
      ctrlKey: true,
      shiftKey: true,
    })

    await waitFor(() => {
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'showPerfMonitor:v1',
        'false'
      )
    })
  })

  it('should add keyboard event listener on mount', async () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener')

    render(<PerformanceMonitor />)

    await waitFor(() => {
      expect(
        screen.getByText((content) => content.includes('Performance Monitor'))
      ).toBeInTheDocument()
    })
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function)
    )
  })

  it('should remove keyboard event listener on unmount', async () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

    const { unmount } = render(<PerformanceMonitor />)

    await waitFor(() => {
      expect(
        screen.getByText((content) => content.includes('Performance Monitor'))
      ).toBeInTheDocument()
    })
    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function)
    )
  })

  it('should handle close button click', async () => {
    render(<PerformanceMonitor />)

    await waitFor(() => {
      expect(
        screen.getByText((content) => content.includes('Performance Monitor'))
      ).toBeInTheDocument()
    })
    const closeButton = screen.getByRole('button', {
      name: 'Close performance monitor',
    })

    fireEvent.click(closeButton)

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'showPerfMonitor:v1',
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
      expect(screen.getByText(/Load: 1400ms/)).toBeInTheDocument()
      expect(screen.getByText(/Render: 250ms/)).toBeInTheDocument()
    })
  })
})
