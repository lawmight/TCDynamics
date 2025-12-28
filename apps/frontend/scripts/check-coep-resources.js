/**
 * Browser console script to check third-party resource loading with COEP headers
 * Run this in the browser console on staging/production to verify resource loading
 *
 * Usage:
 * 1. Open browser DevTools (F12)
 * 2. Navigate to Console tab
 * 3. Copy and paste this entire script
 * 4. Review the results
 */

;(function checkCOEPResources() {
  console.log('🔍 Checking Third-Party Resource Loading with COEP Headers...\n')

  const results = {
    headers: {},
    resources: {},
    errors: [],
    warnings: [],
  }

  // Check response headers
  try {
    const coepMeta = document.querySelector(
      'meta[http-equiv="Cross-Origin-Embedder-Policy"]'
    )?.content
    const coopMeta = document.querySelector(
      'meta[http-equiv="Cross-Origin-Opener-Policy"]'
    )?.content

    const headers = {
      coep: coepMeta || 'Not set in meta tag (check response headers)',
      coop: coopMeta || 'Not set in meta tag (check response headers)',
    }
    results.headers = headers
    console.log('📋 Headers (from meta tags):', headers)

    // Always provide guidance about checking actual HTTP headers
    console.log(
      '\n⚠️  IMPORTANT: Meta tags may not reflect actual HTTP response headers!\n' +
        '   To verify the true COEP/COOP values set by your server:\n' +
        '   • Open DevTools → Network tab → Reload page\n' +
        '   • Click on the main document request (usually the first entry)\n' +
        '   • Check the "Response Headers" section for:\n' +
        '     - Cross-Origin-Embedder-Policy\n' +
        '     - Cross-Origin-Opener-Policy\n' +
        '   • Or use curl: curl -I <your-url> | grep -i "cross-origin"\n' +
        '   • Server-set headers take precedence over meta tags\n'
    )
  } catch (e) {
    results.errors.push(`Failed to check headers: ${e.message}`)
  }

  // Check Stripe
  try {
    const stripeLoaded = typeof window.Stripe !== 'undefined'
    const stripeScript = Array.from(document.querySelectorAll('script')).find(
      s => s.src.includes('stripe.com')
    )
    results.resources.stripe = {
      loaded: stripeLoaded,
      scriptFound: !!stripeScript,
      scriptUrl: stripeScript?.src || 'Not found',
    }
    console.log(
      `💳 Stripe: ${stripeLoaded ? '✅ Loaded' : '❌ Not loaded'} ${stripeScript ? `(${stripeScript.src})` : ''}`
    )
  } catch (e) {
    results.errors.push(`Stripe check failed: ${e.message}`)
  }

  // Check Sentry
  try {
    const sentryLoaded = typeof window.Sentry !== 'undefined'
    const sentryScript = Array.from(document.querySelectorAll('script')).find(
      s => s.src.includes('sentry')
    )
    results.resources.sentry = {
      loaded: sentryLoaded,
      scriptFound: !!sentryScript,
      scriptUrl: sentryScript?.src || 'Not found',
    }
    console.log(
      `🐛 Sentry: ${sentryLoaded ? '✅ Loaded' : '⚠️ Not loaded (may be disabled in dev)'} ${sentryScript ? `(${sentryScript.src})` : ''}`
    )
  } catch (e) {
    results.errors.push(`Sentry check failed: ${e.message}`)
  }

  // Check Vercel Analytics
  try {
    const vercelScript = Array.from(document.querySelectorAll('script')).find(
      s =>
        s.src.includes('vercel-insights') ||
        s.src.includes('cdn.vercel-insights.com')
    )
    const vercelLoaded = !!vercelScript
    results.resources.vercelAnalytics = {
      loaded: vercelLoaded,
      scriptFound: !!vercelScript,
      scriptUrl: vercelScript?.src || 'Not found',
    }
    console.log(
      `📊 Vercel Analytics: ${vercelLoaded ? '✅ Loaded' : '❌ Not loaded'} ${vercelScript ? `(${vercelScript.src})` : ''}`
    )
  } catch (e) {
    results.errors.push(`Vercel Analytics check failed: ${e.message}`)
  }

  // Check Facebook SDK
  try {
    const fbLoaded = typeof window.FB !== 'undefined'
    const fbScript = Array.from(document.querySelectorAll('script')).find(s =>
      s.src.includes('connect.facebook.net')
    )
    results.resources.facebook = {
      loaded: fbLoaded,
      scriptFound: !!fbScript,
      scriptUrl: fbScript?.src || 'Not found',
    }
    console.log(
      `📘 Facebook SDK: ${fbLoaded ? '✅ Loaded' : '❌ Not loaded'} ${fbScript ? `(${fbScript.src})` : ''}`
    )
  } catch (e) {
    results.errors.push(`Facebook SDK check failed: ${e.message}`)
  }

  // Check for COEP-related console errors
  try {
    // Note: This only checks current console, not historical errors
    // Check network requests for failures
    const resources = performance.getEntriesByType('resource')
    const thirdPartyResources = resources.filter(
      r =>
        r.name.includes('stripe.com') ||
        r.name.includes('sentry.io') ||
        r.name.includes('vercel-insights.com') ||
        r.name.includes('connect.facebook.net')
    )

    const failedResources = thirdPartyResources.filter(r => {
      /** @type {PerformanceResourceTiming} */
      const entry = r

      // Browser limitation: Some browsers may report decodedBodySize === 0 for
      // legitimately-loaded cross-origin resources due to CORS restrictions.
      // Use responseStatus as the primary indicator when available.

      // First, check if responseStatus is available (more reliable indicator)
      if (entry.responseStatus !== undefined) {
        // Consider successful if status is 2xx-3xx
        const isSuccess =
          entry.responseStatus >= 200 && entry.responseStatus < 400
        if (isSuccess) {
          return false // Not a failure
        }
        // If responseStatus indicates failure, treat as failed
        return true
      }

      // Fallback: Use timing-based heuristics when responseStatus unavailable
      // True failures: zero size AND zero/invalid timing (not cached)
      // Cached resources have zero transferSize but valid timing
      // decodedBodySize === 0 is only a weak signal when timing is also invalid
      const hasInvalidTiming = entry.responseStart === 0 || entry.duration === 0
      return (
        entry.transferSize === 0 &&
        entry.decodedBodySize === 0 &&
        hasInvalidTiming
      )
    })

    // Warn about decodedBodySize === 0 when responseStatus is unavailable
    const resourcesWithZeroBodySize = thirdPartyResources.filter(r => {
      /** @type {PerformanceResourceTiming} */
      const entry = r
      return (
        entry.decodedBodySize === 0 &&
        entry.responseStatus === undefined &&
        entry.transferSize === 0
      )
    })

    if (resourcesWithZeroBodySize.length > 0) {
      const warningDetails = resourcesWithZeroBodySize.map(r => {
        /** @type {PerformanceResourceTiming} */
        const entry = r
        return `${entry.name} (type: ${entry.initiatorType})`
      })
      results.warnings.push(
        `Resources with decodedBodySize === 0 (browser limitation - may be false positive): ${warningDetails.join('; ')}`
      )
      console.warn(
        '⚠️ Resources with decodedBodySize === 0 (responseStatus unavailable - may be false positive):',
        warningDetails
      )
    }

    if (failedResources.length > 0) {
      const failedDetails = failedResources.map(r => {
        /** @type {PerformanceResourceTiming} */
        const entry = r
        return `${entry.name} (type: ${entry.initiatorType}, responseStart: ${entry.responseStart}, duration: ${entry.duration})`
      })
      results.warnings.push(
        `Potentially failed resources: ${failedDetails.join('; ')}`
      )
      console.warn('⚠️ Potentially failed resources:', failedDetails)
    }

    console.log(
      `\n📈 Network Resources: ${thirdPartyResources.length} third-party resources found`
    )
  } catch (e) {
    results.errors.push(`Network check failed: ${e.message}`)
  }

  // Summary
  console.log('\n📊 Summary:')
  const allLoaded = Object.values(results.resources).every(r => r.loaded)
  const someNotExpected = Object.values(results.resources).some(
    r => !r.loaded && !r.scriptFound
  )
  if (allLoaded) {
    console.log('✅ All third-party resources appear to be loading correctly!')
  } else if (someNotExpected) {
    console.log(
      'ℹ️ Some third-party resources are not present (may be expected in this environment)'
    )
  } else {
    console.warn('⚠️ Some resources may not be loading. Check errors above.')
  }

  if (results.errors.length > 0) {
    console.error('❌ Errors:', results.errors)
  }

  if (results.warnings.length > 0) {
    console.warn('⚠️ Warnings:', results.warnings)
  }

  // Return results for programmatic access
  return results
})()
