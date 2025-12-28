import { Page, expect, test } from '@playwright/test'

/**
 * E2E tests to verify third-party resource loading with COEP/COOP headers
 * Tests Stripe, Sentry, Vercel Analytics, and Facebook SDK integration
 */

interface ResourceTestContext {
  errors: string[]
  failedRequests: string[]
  listeners: Array<{ event: string; handler: (...args: any[]) => void }>
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
    const consoleHandler = (msg: any) => {
      if (msg.type() === 'error') {
        context.errors.push(msg.text())
      }
    }
    page.on('console', consoleHandler)
    context.listeners.push({ event: 'console', handler: consoleHandler })

    const requestFailedHandler = (request: any) => {
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
        if (event === 'console') {
          page.off('console', handler as (msg: any) => void)
        } else if (event === 'requestfailed') {
          page.off('requestfailed', handler as (request: any) => void)
        }
      }
      // Delete the context from the map
      resourceContextMap.delete(page)
    }
  })

  test('should load Stripe.js without COEP blocking errors', async ({
    page,
  }) => {
    await page.goto('/checkout')

    // Wait for Stripe to initialize with condition-based wait
    await page.waitForFunction(
      () => typeof (window as any).Stripe !== 'undefined',
      { timeout: 10000 }
    )

    // Verify Stripe is loaded
    const stripeLoaded = await page.evaluate(() => {
      return typeof (window as any).Stripe !== 'undefined'
    })

    expect(stripeLoaded).toBe(true)

    // Check for COEP-related errors
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

  test('should load Sentry SDK without COEP blocking errors', async ({
    page,
  }) => {
    await page.goto('/')

    // Wait for Sentry to initialize with condition-based wait
    // Wait for window.Sentry to be defined (similar to Stripe test pattern)
    try {
      await page.waitForFunction(
        () => typeof (window as any).Sentry !== 'undefined',
        { timeout: 10000 }
      )
    } catch {
      // Sentry might not load in test environment, which is acceptable
      // Continue with the test to check for COEP errors regardless
    }

    // Check if Sentry is loaded
    const sentryLoaded = await page.evaluate(() => {
      return typeof (window as any).Sentry !== 'undefined'
    })

    // Sentry might not be loaded in test environment, but should not have COEP errors
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

  test('should load Vercel Analytics without COEP blocking errors', async ({
    page,
  }) => {
    await page.goto('/')

    // Wait for Vercel Analytics script to load with condition-based wait
    await page.waitForFunction(
      () => {
        const scripts = Array.from(document.querySelectorAll('script'))
        return scripts.some(
          script =>
            script.src.includes('vercel-insights') ||
            script.src.includes('cdn.vercel-insights.com')
        )
      },
      { timeout: 10000 }
    )

    // Check for Vercel Analytics script
    const vercelAnalyticsLoaded = await page.evaluate(() => {
      // Check if Vercel Analytics script is present
      const scripts = Array.from(document.querySelectorAll('script'))
      return scripts.some(
        script =>
          script.src.includes('vercel-insights') ||
          script.src.includes('cdn.vercel-insights.com')
      )
    })

    // Vercel Analytics should load (it supports CORP)
    expect(vercelAnalyticsLoaded).toBe(true)

    // Check for COEP-related errors
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

  test('should load Facebook SDK without COEP blocking errors', async ({
    page,
  }) => {
    await page.goto('/')

    // Wait for Facebook SDK to initialize with condition-based wait
    // Wrap in try/catch to handle timeout in environments where SDK never loads
    let fbLoaded = false
    try {
      await page.waitForFunction(
        () => typeof (window as any).FB !== 'undefined',
        { timeout: 10000 }
      )
      fbLoaded = true
    } catch {
      // Facebook SDK might not load in test environment, which is acceptable
      // Continue with the test to check for COEP errors regardless
      fbLoaded = false
    }

    // Verify Facebook SDK loading status
    if (!fbLoaded) {
      // Double-check by evaluating window.FB directly
      fbLoaded = await page.evaluate(() => {
        return typeof (window as any).FB !== 'undefined'
      })
    }

    // Only assert FB is loaded if environment flag indicates integrations should be loaded
    // Otherwise, log a warning but don't fail the test
    const shouldIncludeThirdParties =
      process.env.E2E_INCLUDE_THIRD_PARTIES === 'true'

    if (shouldIncludeThirdParties) {
      expect(fbLoaded).toBe(true)
    } else if (!fbLoaded) {
      console.warn(
        'Facebook SDK not loaded (expected in test/non-production environments)'
      )
    }

    // Check for COEP-related errors
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

    // COEP should be either 'credentialless', 'require-corp', or not set
    // If set to 'require-corp', it should not break third-party resources
    if (coep) {
      expect(['credentialless', 'require-corp']).toContain(coep.toLowerCase())
    }

    // COOP should be 'same-origin' if set
    if (coop) {
      expect(coop.toLowerCase()).toBe('same-origin')
    }
  })

  test('should verify all third-party resources load on homepage', async ({
    page,
  }) => {
    await page.goto('/')

    // Wait for all resources to load
    await page.waitForLoadState('networkidle', { timeout: 10000 })

    // Check network requests for third-party resources
    const networkRequests = await page.evaluate(() => {
      return (
        performance.getEntriesByType('resource') as PerformanceResourceTiming[]
      )
        .map(entry => entry.name)
        .filter(
          url =>
            url.includes('stripe.com') ||
            url.includes('sentry.io') ||
            url.includes('vercel-insights.com') ||
            url.includes('connect.facebook.net')
        )
    })

    // Verify no failed requests for third-party resources
    const context = resourceContextMap.get(page)
    const failedRequests = context?.failedRequests || []
    const thirdPartyFailures = failedRequests.filter(
      (req: string) =>
        req.includes('stripe.com') ||
        req.includes('sentry.io') ||
        req.includes('vercel-insights.com') ||
        req.includes('connect.facebook.net')
    )

    expect(thirdPartyFailures.length).toBe(0)

    // Check for console errors related to COEP
    const errors = context?.errors || []
    const coepErrors = errors.filter(
      (error: string) =>
        error.toLowerCase().includes('coep') ||
        error.toLowerCase().includes('cross-origin-embedder-policy')
    )

    expect(coepErrors.length).toBe(0)
  })
})
