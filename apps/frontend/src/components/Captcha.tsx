import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY

type CaptchaProps = {
  onToken: (token?: string) => void
  action?: string
}

export type CaptchaHandle = {
  reset: () => void
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement,
        options: {
          sitekey: string
          action?: string
          theme?: 'auto' | 'light' | 'dark'
          callback?: (token: string) => void
          'error-callback'?: () => void
          'expired-callback'?: () => void
        }
      ) => string
      reset: (widgetId?: string) => void
      remove?: (widgetId: string) => void
    }
  }
}

/**
 * Lightweight Cloudflare Turnstile integration.
 * Renders only when VITE_TURNSTILE_SITE_KEY is provided.
 */
export const Captcha = forwardRef<CaptchaHandle, CaptchaProps>(
  ({ onToken, action }, ref) => {
    const containerRef = useRef<HTMLDivElement | null>(null)
    const widgetIdRef = useRef<string | null>(null)
    const [scriptLoaded, setScriptLoaded] = useState(false)

    // Imperative reset exposed to parent
    useImperativeHandle(ref, () => ({
      reset: () => {
        if (widgetIdRef.current && window.turnstile?.reset) {
          window.turnstile.reset(widgetIdRef.current)
          onToken(undefined)
        }
      },
    }))

    // Inject Turnstile script once
    useEffect(() => {
      if (!TURNSTILE_SITE_KEY) return
      if (window.turnstile) {
        setScriptLoaded(true)
        return
      }

      const script = document.createElement('script')
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
      script.async = true
      script.defer = true
      script.crossOrigin = 'anonymous' // CSP compliance: ensure CORS is handled properly
      script.onload = () => setScriptLoaded(true)
      script.onerror = () => {
        console.error('Failed to load Turnstile script')
        onToken(undefined)
      }
      document.head.appendChild(script)

      return () => {
        script.onload = null
      }
    }, [onToken])

    // Render widget when ready
    useEffect(() => {
      if (!TURNSTILE_SITE_KEY || !scriptLoaded || !containerRef.current) return
      try {
        const renderedId = window.turnstile?.render(containerRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          theme: 'auto',
          action,
          callback: token => onToken(token),
          'error-callback': () => onToken(undefined),
          'expired-callback': () => onToken(undefined),
        })
        widgetIdRef.current = renderedId ?? null
      } catch (error) {
        console.error('Turnstile render failed', error)
        onToken(undefined)
      }

      return () => {
        if (widgetIdRef.current && window.turnstile?.remove) {
          window.turnstile.remove(widgetIdRef.current)
        }
        widgetIdRef.current = null
      }
    }, [scriptLoaded, action, onToken])

    if (!TURNSTILE_SITE_KEY) {
      return null
    }

    return (
      <div className="flex justify-center">
        <div ref={containerRef} className="turnstile-captcha" />
      </div>
    )
  }
)

Captcha.displayName = 'Captcha'

export default Captcha
