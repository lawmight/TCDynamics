import { getWithMigration, LS } from '@/utils/storageMigration'

export const CONSENT_UPDATED_EVENT = 'consentUpdated'

export type ConsentPreferences = {
  necessary: true
  analytics: boolean
  marketing: boolean
  timestamp: string
}

const isBoolean = (value: unknown): value is boolean =>
  typeof value === 'boolean'

const parseConsent = (raw: string): ConsentPreferences | null => {
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>
    if (!parsed || typeof parsed !== 'object') return null

    const analytics = parsed.analytics
    const marketing = parsed.marketing
    const timestamp = parsed.timestamp

    if (!isBoolean(analytics) || !isBoolean(marketing)) return null
    if (typeof timestamp !== 'string') return null

    return {
      necessary: true,
      analytics,
      marketing,
      timestamp,
    }
  } catch {
    return null
  }
}

export const readConsent = (): ConsentPreferences | null => {
  if (typeof window === 'undefined') return null
  const stored = getWithMigration(LS.COOKIE_CONSENT, 'cookieConsent')
  if (!stored) return null
  return parseConsent(stored)
}

export const writeConsent = (preferences: ConsentPreferences) => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(LS.COOKIE_CONSENT, JSON.stringify(preferences))
    window.dispatchEvent(
      new CustomEvent<ConsentPreferences>(CONSENT_UPDATED_EVENT, {
        detail: preferences,
      })
    )
  } catch {
    // Ignore storage errors (private mode, blocked storage)
  }
}
