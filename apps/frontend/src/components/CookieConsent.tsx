import { useMemo } from 'react'

import { Button } from '@/components/ui/button'
import { useCookieConsent } from '@/hooks/useCookieConsent'
import type { ConsentPreferences } from '@/utils/consent'

const privacyPolicyUrl =
  'https://www.termsfeed.com/live/fa645ea2-fa78-4258-9064-630eeef14d62'

const buildConsent = (
  preferences: Pick<ConsentPreferences, 'analytics' | 'marketing'>
): ConsentPreferences => ({
  necessary: true,
  analytics: preferences.analytics,
  marketing: preferences.marketing,
  timestamp: new Date().toISOString(),
})

const CookieConsent = () => {
  const { consent, isReady, saveConsent } = useCookieConsent()

  const shouldShow = useMemo(() => isReady && !consent, [consent, isReady])

  if (!shouldShow) return null

  return (
    <div
      role="dialog"
      aria-label="Préférences de cookies"
      aria-live="polite"
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-4xl rounded-xl border border-border/60 bg-background/95 p-4 shadow-2xl backdrop-blur sm:p-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2 text-sm text-muted-foreground">
          <p className="text-base font-semibold text-foreground">
            Nous respectons votre vie privée
          </p>
          <p>
            Nous utilisons des cookies pour améliorer l'expérience, mesurer
            l'audience et proposer du contenu marketing. Vous pouvez accepter ou
            refuser ces usages à tout moment.
          </p>
          <a
            href={privacyPolicyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline-offset-4 hover:underline"
          >
            Consulter la politique de confidentialité
          </a>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              saveConsent(buildConsent({ analytics: false, marketing: false }))
            }
          >
            Refuser
          </Button>
          <Button
            type="button"
            onClick={() =>
              saveConsent(buildConsent({ analytics: true, marketing: true }))
            }
          >
            Accepter tout
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CookieConsent
