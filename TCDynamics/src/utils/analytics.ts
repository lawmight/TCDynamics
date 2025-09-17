/**
 * Analytics Module - RGPD Compliant
 * Utilise une solution respectueuse de la vie privée
 */

interface AnalyticsEvent {
  category: string
  action: string
  label?: string
  value?: number
}

class Analytics {
  private enabled: boolean = false
  private debug: boolean = false

  constructor() {
    // Vérifier si les analytics sont activés via env
    this.enabled = import.meta.env.VITE_ENABLE_ANALYTICS === 'true'
    this.debug = import.meta.env.DEV
  }

  /**
   * Initialiser les analytics (Matomo ou autre solution RGPD)
   */
  init() {
    if (!this.enabled) {
      // Analytics disabled
      return
    }

    // Configuration Matomo (exemple)
    if (typeof window !== 'undefined') {
      const _paq = ((window as any)._paq = (window as any)._paq || [])
      _paq.push(['disableCookies']) // RGPD: Pas de cookies par défaut
      _paq.push(['trackPageView'])
      _paq.push(['enableLinkTracking'])

      if (this.debug) {
        // Analytics initialized in debug mode
      }
    }
  }

  /**
   * Tracker un événement
   */
  trackEvent({ category, action, label, value }: AnalyticsEvent) {
    if (!this.enabled) return

    if (this.debug) {
      // Analytics event tracked: { category, action, label, value }
    }

    // Envoyer à Matomo ou autre solution
    if (typeof window !== 'undefined' && (window as any)._paq) {
      ;(window as any)._paq.push(['trackEvent', category, action, label, value])
    }
  }

  /**
   * Tracker une conversion
   */
  trackConversion(type: 'contact' | 'demo' | 'signup') {
    this.trackEvent({
      category: 'Conversion',
      action: type,
      label: new Date().toISOString(),
    })
  }

  /**
   * Tracker le temps passé sur une page
   */
  trackTimeOnPage(page: string, seconds: number) {
    this.trackEvent({
      category: 'Engagement',
      action: 'TimeOnPage',
      label: page,
      value: seconds,
    })
  }

  /**
   * Tracker les erreurs
   */
  trackError(error: Error, context?: string) {
    if (this.debug) {
      // Error tracked for analytics
    }

    this.trackEvent({
      category: 'Error',
      action: error.name,
      label: context || error.message,
    })
  }

  /**
   * Obtenir le consentement RGPD
   */
  requestConsent(): Promise<boolean> {
    return new Promise(resolve => {
      // Implémenter la logique de consentement RGPD
      // Pour l'instant, on retourne false par défaut
      resolve(false)
    })
  }
}

export const analytics = new Analytics()

// Hooks React pour les analytics
import { useEffect, useRef } from 'react'

export function usePageTracking(pageName: string) {
  const startTime = useRef(Date.now())

  useEffect(() => {
    // Track page view
    analytics.trackEvent({
      category: 'Navigation',
      action: 'PageView',
      label: pageName,
    })

    // Track time on page when leaving
    return () => {
      const timeSpent = Math.round((Date.now() - startTime.current) / 1000)
      analytics.trackTimeOnPage(pageName, timeSpent)
    }
  }, [pageName])
}

export function useEventTracking() {
  return {
    trackClick: (element: string) => {
      analytics.trackEvent({
        category: 'Interaction',
        action: 'Click',
        label: element,
      })
    },
    trackFormSubmit: (formName: string) => {
      analytics.trackEvent({
        category: 'Form',
        action: 'Submit',
        label: formName,
      })
    },
    trackScroll: (percentage: number) => {
      analytics.trackEvent({
        category: 'Engagement',
        action: 'Scroll',
        value: percentage,
      })
    },
  }
}
