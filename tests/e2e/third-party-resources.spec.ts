import {
  type ConsoleMessage,
  type Page,
  type Request,
  expect,
  test,
} from '@playwright/test'

/**
 * E2E tests to verify third-party resource loading with COEP/COOP headers
 * Tests Sentry, Vercel Analytics, and Facebook SDK integration
 * Note: Payment processing uses Polar.sh (server-side, no client-side SDK)
 */

interface ResourceTestContext {
  errors: string[]
  failedRequests: string[]
  listeners: Array<
    | { event: 'console'; handler: (msg: ConsoleMessage) => void }
    | { event: 'requestfailed'; handler: (request: Request) => void }
  >
}

// Map to store resource test context for each page
const resourceContextMap = new Map<Page, ResourceTestContext>()

test.describe('Third-Party Resource Loading', () => {
  test.beforeEach(async ({ page }) => {
    // Create a fresh context for this page
    const context: ResourceTestContext = {
      errors: [],
      failedRequests: [],
      listeners: [],
    }
    resourceContextMap.set(page, context)

    // Monitor console errors and network failures
    const consoleHandler = (msg: ConsoleMessage) => {
      if (msg.type() === 'error') {
        context.errors.push(msg.text())
      }
    }
    page.on('console', consoleHandler)
    context.listeners.push({ event: 'console', handler: consoleHandler })

    const requestFailedHandler = (request: Request) => {
      context.failedRequests.push(`${request.method()} ${request.url()}`)
    }
    page.on('requestfailed', requestFailedHandler)
    context.listeners.push({
      event: 'requestfailed',
      handler: requestFailedHandler,
    })
  })

  test.afterEach(async ({ page }) => {
    // Remove all event listeners and clean up context to prevent memory leaks
    const context = resourceContextMap.get(page)
    if (context) {
      // Remove all registered listeners
      for (const { event, handler } of context.listeners) {
        page.off(event, handler)
      }
      // Delete the context from the map
      resourceContextMap.delete(page)
    }
  })

  test('should not report COEP blocking errors when Sentry is unavailable', async ({
    page,
  }) => {
    await page.goto('/')
    await page.waitForTimeout(1000)

    const context = resourceContextMap.get(page)
    const errors = context?.errors || []
    const coepErrors = errors.filter(
      (error: string) =>
        error.includes('Cross-Origin-Embedder-Policy') ||
        error.includes('COEP') ||
        error.includes('require-corp')
    )

    expect(coepErrors.length).toBe(0)
  })

  test('should keep Vercel analytics optional in dev while avoiding COEP errors', async ({
    page,
  }) => {
    await page.goto('/')
    await page.waitForTimeout(1000)

    const context = resourceContextMap.get(page)
    const errors = context?.errors || []
    const coepErrors = errors.filter(
      (error: string) =>
        error.includes('Cross-Origin-Embedder-Policy') ||
        error.includes('COEP') ||
        error.includes('vercel-insights')
    )

    expect(coepErrors.length).toBe(0)
  })

  test('should make Facebook SDK checks conditional by environment', async ({
    page,
  }) => {
    await page.goto('/')
    await page.waitForTimeout(1000)

    const shouldIncludeThirdParties =
      process.env.E2E_INCLUDE_THIRD_PARTIES === 'true'
    const fbLoaded = await page.evaluate(() => {
      return typeof (window as { FB?: unknown }).FB !== 'undefined'
    })
    if (shouldIncludeThirdParties) expect(fbLoaded).toBe(true)

    const context = resourceContextMap.get(page)
    const errors = context?.errors || []
    const coepErrors = errors.filter(
      (error: string) =>
        error.includes('Cross-Origin-Embedder-Policy') ||
        error.includes('COEP') ||
        error.includes('connect.facebook.net')
    )

    expect(coepErrors.length).toBe(0)
  })

  test('should verify COEP header configuration', async ({ page }) => {
    const response = await page.goto('/')

    if (!response) {
      throw new Error('Failed to load page')
    }

    const headers = response.headers()
    const coep = headers['cross-origin-embedder-policy']
    const coop = headers['cross-origin-opener-policy']

    if (coep) {
      expect(['credentialless', 'require-corp']).toContain(coep.toLowerCase())
    }

    if (coop) {
      expect(coop.toLowerCase()).toBe('same-origin')
    }
  })

  test('should avoid third-party hard failures unless explicitly enabled', async ({
    page,
  }) => {
    await page.goto('/')
    await page.waitForTimeout(1200)

    const shouldIncludeThirdParties =
      process.env.E2E_INCLUDE_THIRD_PARTIES === 'true'
    const context = resourceContextMap.get(page)
    const failedRequests = context?.failedRequests || []
    const thirdPartyFailures = failedRequests.filter(
      (req: string) =>
        req.includes('sentry.io') ||
        req.includes('vercel-insights.com') ||
        req.includes('connect.facebook.net')
    )
    if (shouldIncludeThirdParties) {
      expect(thirdPartyFailures.length).toBe(0)
    }

    const errors = context?.errors || []
    const coepErrors = errors.filter(
      (error: string) =>
        error.toLowerCase().includes('coep') ||
        error.toLowerCase().includes('cross-origin-embedder-policy')
    )

    expect(coepErrors.length).toBe(0)
  })
})
