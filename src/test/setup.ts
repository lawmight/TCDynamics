import '@testing-library/jest-dom'
import * as matchers from '@testing-library/jest-dom/matchers'
import { cleanup } from '@testing-library/react'
import { afterEach, expect, vi } from 'vitest'
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

// jsdom provides window.location by default - no need to mock it
// Tests that need specific location values should set them in the test itself

// Mock window.scrollTo
window.scrollTo = vi.fn()

// Mock window.scroll
window.scroll = vi.fn()

// Mock Element.prototype.scrollIntoView
Element.prototype.scrollIntoView = vi.fn()

// Mock document.getElementById
const originalGetElementById = document.getElementById.bind(document)
document.getElementById = vi.fn((id: string) => {
  const element = originalGetElementById(id)
  if (!element) {
    // Return a mock element with scrollIntoView
    return {
      scrollIntoView: vi.fn(),
    } as unknown as HTMLElement
  }
  return element
})

// Cleanup after each test
afterEach(() => {
  cleanup()
})
