import { useEffect, useState } from 'react'

import {
  CONSENT_UPDATED_EVENT,
  readConsent,
  writeConsent,
  type ConsentPreferences,
} from '@/utils/consent'
import { LS } from '@/utils/storageMigration'

const isConsentEvent = (
  event: Event
): event is CustomEvent<ConsentPreferences> =>
  'detail' in event && typeof (event as CustomEvent).detail === 'object'

export const useCookieConsent = () => {
  const [consent, setConsent] = useState<ConsentPreferences | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    setConsent(readConsent())
    setIsReady(true)

    const handleConsentUpdate = (event: Event) => {
      if (!isConsentEvent(event)) return
      setConsent(event.detail)
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== LS.COOKIE_CONSENT && event.key !== 'cookieConsent') {
        return
      }
      setConsent(readConsent())
    }

    window.addEventListener(
      CONSENT_UPDATED_EVENT,
      handleConsentUpdate as (event: Event) => void
    )
    window.addEventListener('storage', handleStorage)

    return () => {
      window.removeEventListener(
        CONSENT_UPDATED_EVENT,
        handleConsentUpdate as (event: Event) => void
      )
      window.removeEventListener('storage', handleStorage)
    }
  }, [])

  const saveConsent = (preferences: ConsentPreferences) => {
    writeConsent(preferences)
    setConsent(preferences)
  }

  return {
    consent,
    isReady,
    saveConsent,
    hasAnalyticsConsent: consent?.analytics ?? false,
    hasMarketingConsent: consent?.marketing ?? false,
  }
}
