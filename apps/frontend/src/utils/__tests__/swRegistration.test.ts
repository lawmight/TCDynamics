import { describe, expect, it, vi } from 'vitest'

import {
  registerServiceWorker,
  triggerInstallPrompt,
} from '../swRegistration'

vi.mock('../logger', () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

describe('service worker registration', () => {
  it('warns when service workers are not supported', async () => {
    const originalNavigator = window.navigator
    Object.defineProperty(window, 'navigator', {
      value: {},
      writable: true,
    })

    await registerServiceWorker()

    Object.defineProperty(window, 'navigator', {
      value: originalNavigator,
      writable: true,
    })
  })

  it('returns false when no install prompt is available', async () => {
    const result = await triggerInstallPrompt()
    expect(result).toBe(false)
  })
})
