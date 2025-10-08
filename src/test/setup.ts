import '@testing-library/jest-dom'
import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'
import './mocks/styles.css'

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers)

// Mock lucide-react before any component imports
vi.mock('lucide-react', async () => {
  return import('./mocks/lucide-react')
})

// Mock des images
Object.defineProperty(window.HTMLImageElement.prototype, 'src', {
  set(src) {
    // Mock pour éviter les erreurs de chargement d'images
    this.setAttribute('src', src)
  },
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock performance.now for happy-dom
Object.defineProperty(global, 'performance', {
  writable: true,
  value: {
    now: () => Date.now(),
  },
})

// Mock window.location for React Router tests
Object.defineProperty(window, 'location', {
  writable: true,
  value: {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    protocol: 'http:',
    host: 'localhost:3000',
    hostname: 'localhost',
    port: '3000',
    pathname: '/',
    search: '',
    hash: '',
    assign: vi.fn(),
    replace: vi.fn(),
    reload: vi.fn(),
  },
})

// Cleanup after each test
afterEach(() => {
  cleanup()
})
