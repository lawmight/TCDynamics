import { useEffect } from 'react'

import { useCookieConsent } from '@/hooks/useCookieConsent'
import { useFacebookPixel } from '@/hooks/useFacebookPixel'
import {
  loadDatafast,
  loadFacebookSdk,
  loadGoogleAnalytics,
} from '@/utils/thirdPartyScripts'

type UseThirdPartyTrackingOptions = {
  isMarketingRoute: boolean
}

const schedule = (callback: () => void) => {
  if (typeof window === 'undefined') return undefined
  const timeoutId = window.setTimeout(callback, 0)
  return () => window.clearTimeout(timeoutId)
}

export const useThirdPartyTracking = ({
  isMarketingRoute,
}: UseThirdPartyTrackingOptions) => {
  const { hasAnalyticsConsent, hasMarketingConsent } = useCookieConsent()

  useFacebookPixel({
    enabled: hasMarketingConsent && isMarketingRoute,
    pixelId: import.meta.env.VITE_FACEBOOK_PIXEL_ID,
  })

  useEffect(() => {
    if (!hasAnalyticsConsent) return
    return schedule(() => {
      loadGoogleAnalytics(hasMarketingConsent)
      loadDatafast()
    })
  }, [hasAnalyticsConsent, hasMarketingConsent])

  useEffect(() => {
    if (!hasMarketingConsent || !isMarketingRoute) return
    return schedule(() => {
      loadFacebookSdk()
    })
  }, [hasMarketingConsent, isMarketingRoute])
}
