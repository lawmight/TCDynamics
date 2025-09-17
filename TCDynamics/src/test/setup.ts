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

// Cleanup after each test
afterEach(() => {
  cleanup()
})
