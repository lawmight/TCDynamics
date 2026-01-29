/**
 * useProactiveSupport Hook
 * Polls for user struggles and manages help offers
 * Following onboarding-cro skill: offer support proactively
 */

import { useCallback, useEffect, useRef, useState } from 'react'

import type { HelpResource, StruggleContext } from '@/components/app/HelpBubble'
import { analytics } from '@/utils/analytics'


interface UseProactiveSupportOptions {
  /** User ID to monitor */
  userId?: string
  /** Whether to disable polling */
  disabled?: boolean
  /** Polling interval in milliseconds (default: 2 minutes) */
  pollingInterval?: number
  /** Cooldown after dismissal in milliseconds (default: 10 minutes) */
  dismissCooldown?: number
}

interface UseProactiveSupportReturn {
  /** Current struggle context if detected */
  struggle: StruggleContext | null
  /** Dismiss the current help offer */
  dismissHelp: () => void
  /** Handle resource click */
  handleResourceClick: (resource: HelpResource) => void
  /** Handle feedback */
  handleFeedback: (helpful: boolean) => void
  /** Whether help is currently on cooldown */
  onCooldown: boolean
}

// Local storage keys
const COOLDOWN_KEY = 'tc_proactive_support_cooldown'
const FEEDBACK_KEY = 'tc_proactive_support_feedback'

/**
 * Hook for proactive support with polling and cooldown management
 */
export function useProactiveSupport({
  userId,
  disabled = false,
  pollingInterval = 2 * 60 * 1000, // 2 minutes
  dismissCooldown = 10 * 60 * 1000, // 10 minutes
}: UseProactiveSupportOptions = {}): UseProactiveSupportReturn {
  const [struggle, setStruggle] = useState<StruggleContext | null>(null)
  const [onCooldown, setOnCooldown] = useState(false)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastEventRef = useRef<string[]>([])

  // Check cooldown on mount
  useEffect(() => {
    try {
      const cooldownUntil = localStorage.getItem(COOLDOWN_KEY)
      if (cooldownUntil) {
        const until = parseInt(cooldownUntil, 10)
        if (Date.now() < until) {
          setOnCooldown(true)
          // Set timer to clear cooldown
          const timeout = setTimeout(() => {
            setOnCooldown(false)
            localStorage.removeItem(COOLDOWN_KEY)
          }, until - Date.now())
          return () => clearTimeout(timeout)
        } else {
          localStorage.removeItem(COOLDOWN_KEY)
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [])

  // Track analytics events for struggle detection
  const trackEvent = useCallback(
    (action: string, stepId?: string, value?: number) => {
      const event = {
        action,
        stepId,
        value,
        timestamp: new Date().toISOString(),
      }
      lastEventRef.current = [
        ...lastEventRef.current.slice(-19), // Keep last 20 events
        JSON.stringify(event),
      ]
    },
    []
  )

  // Detect struggle based on local events (client-side detection)
  const detectStruggleLocally = useCallback(() => {
    const events = lastEventRef.current
      .map(e => {
        try {
          return JSON.parse(e)
        } catch {
          return null
        }
      })
      .filter(Boolean)

    if (events.length < 3) return null

    // Count step views
    const stepCounts: Record<string, number> = {}
    const now = Date.now()
    const thirtyMinutesAgo = now - 30 * 60 * 1000

    for (const event of events) {
      const eventTime = new Date(event.timestamp).getTime()
      if (eventTime < thirtyMinutesAgo) continue

      if (event.action === 'step_viewed' && event.stepId) {
        stepCounts[event.stepId] = (stepCounts[event.stepId] || 0) + 1
      }
    }

    // Find step with >= 3 views
    for (const [stepId, count] of Object.entries(stepCounts)) {
      if (count >= 3) {
        return {
          stepId,
          stepName: getStepName(stepId),
          message: getHelpMessage(stepId),
          resources: getResources(stepId),
        }
      }
    }

    return null
  }, [])

  // Fetch struggle detection from API
  const checkForStruggle = useCallback(async () => {
    if (disabled || onCooldown || !userId) return

    try {
      // First try local detection
      const localStruggle = detectStruggleLocally()
      if (localStruggle) {
        setStruggle(localStruggle)
        // Track that help was offered
        analytics.trackEvent({
          category: 'ProactiveSupport',
          action: 'help_offered',
          label: localStruggle.stepId,
        })
        return
      }

      // Then try API (for server-side analytics)
      const eventsParam = encodeURIComponent(
        JSON.stringify(
          lastEventRef.current
            .map(e => {
              try {
                return JSON.parse(e)
              } catch {
                return null
              }
            })
            .filter(Boolean)
        )
      )

      const response = await fetch(
        `/api/user?action=detect-struggle&userId=${userId}&events=${eventsParam}`
      )

      if (!response.ok) return

      const data = await response.json()

      if (data.struggle && data.context) {
        setStruggle(data.context)
        analytics.trackEvent({
          category: 'ProactiveSupport',
          action: 'help_offered',
          label: data.context.stepId,
        })
      }
    } catch {
      // Silently fail - proactive support should never break the app
      // Error logged via logger if needed
    }
  }, [userId, disabled, onCooldown, detectStruggleLocally])

  // Set up polling
  useEffect(() => {
    if (disabled || !userId) return

    // Initial check after short delay
    const initialTimeout = setTimeout(() => {
      checkForStruggle()
    }, 30000) // 30 seconds after mount

    // Set up polling interval
    pollingRef.current = setInterval(checkForStruggle, pollingInterval)

    return () => {
      clearTimeout(initialTimeout)
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
      }
    }
  }, [userId, disabled, pollingInterval, checkForStruggle])

  const dismissHelp = useCallback(() => {
    setStruggle(null)
    setOnCooldown(true)

    // Set cooldown in localStorage
    try {
      localStorage.setItem(COOLDOWN_KEY, String(Date.now() + dismissCooldown))
    } catch {
      // Ignore localStorage errors
    }

    // Clear cooldown after timeout
    setTimeout(() => {
      setOnCooldown(false)
      localStorage.removeItem(COOLDOWN_KEY)
    }, dismissCooldown)
  }, [dismissCooldown])

  const handleResourceClick = useCallback((resource: HelpResource) => {
    // Resource click handled by HelpBubble component
    // This is called for additional logic if needed
    analytics.trackEvent({
      category: 'ProactiveSupport',
      action: 'resource_clicked',
      label: resource.type,
    })
  }, [])

  const handleFeedback = useCallback(
    (helpful: boolean) => {
      // Store feedback for analytics
      try {
        const feedback = JSON.parse(localStorage.getItem(FEEDBACK_KEY) || '[]')
        feedback.push({
          stepId: struggle?.stepId,
          helpful,
          timestamp: new Date().toISOString(),
        })
        localStorage.setItem(FEEDBACK_KEY, JSON.stringify(feedback.slice(-50)))
      } catch {
        // Ignore localStorage errors
      }
    },
    [struggle]
  )

  // Expose trackEvent for external use
  useEffect(() => {
    // Attach to window for global access during onboarding
    ;(
      window as unknown as { __trackProactiveSupportEvent?: typeof trackEvent }
    ).__trackProactiveSupportEvent = trackEvent
    return () => {
      delete (
        window as unknown as {
          __trackProactiveSupportEvent?: typeof trackEvent
        }
      ).__trackProactiveSupportEvent
    }
  }, [trackEvent])

  return {
    struggle,
    dismissHelp,
    handleResourceClick,
    handleFeedback,
    onCooldown,
  }
}

// Helper functions for step configurations
function getStepName(stepId: string): string {
  const names: Record<string, string> = {
    'step-account-setup': 'Configuration du compte',
    'step-first-workflow': 'Créer votre premier workflow',
    'step-upload-document': 'Importer un document',
    'step-invite-team': 'Inviter votre équipe',
    'step-connect-integration': 'Connecter une intégration',
  }
  return names[stepId] || 'Étape en cours'
}

function getHelpMessage(stepId: string): string {
  const messages: Record<string, string> = {
    'step-account-setup': 'La configuration du compte vous pose problème ?',
    'step-first-workflow': "Besoin d'aide pour créer un workflow ?",
    'step-upload-document': "L'import de document ne fonctionne pas ?",
    'step-invite-team': 'Des questions sur les invitations ?',
    'step-connect-integration': "L'intégration pose problème ?",
  }
  return (
    messages[stepId] ||
    "Vous semblez avoir besoin d'aide. Comment puis-je vous aider ?"
  )
}

function getResources(stepId: string): HelpResource[] {
  const resources: Record<string, HelpResource[]> = {
    'step-account-setup': [
      {
        type: 'video',
        label: 'Tutoriel vidéo',
        url: '/help/videos/account-setup',
      },
      { type: 'guide', label: 'Guide rapide', url: '/docs/getting-started' },
    ],
    'step-first-workflow': [
      {
        type: 'video',
        label: 'Tutoriel création',
        url: '/help/videos/create-workflow',
      },
      {
        type: 'guide',
        label: 'Templates prêts',
        url: '/app/workflows/templates',
      },
    ],
    'step-upload-document': [
      {
        type: 'guide',
        label: 'Formats supportés',
        url: '/docs/supported-formats',
      },
      { type: 'chat', label: 'Assistance technique' },
    ],
    'step-invite-team': [
      { type: 'guide', label: 'Gérer les accès', url: '/docs/team-management' },
    ],
    'step-connect-integration': [
      {
        type: 'video',
        label: 'Configuration étape par étape',
        url: '/help/videos/integrations',
      },
      {
        type: 'guide',
        label: "Guide d'intégration",
        url: '/docs/integrations',
      },
    ],
  }
  return (
    resources[stepId] || [
      { type: 'guide', label: "Centre d'aide", url: '/docs' },
      { type: 'chat', label: 'Contacter le support' },
    ]
  )
}

export default useProactiveSupport
