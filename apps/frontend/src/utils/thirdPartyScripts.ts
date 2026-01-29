type ScriptAttributes = Record<string, string>

type EnsureScriptOptions = {
  id: string
  src: string
  async?: boolean
  defer?: boolean
  attributes?: ScriptAttributes
  appendTo?: 'head' | 'body'
}

type GtagFunction = (...args: unknown[]) => void

const GA_TRACKING_ID =
  import.meta.env.VITE_ANALYTICS_GA_TRACKING_ID || 'G-EN83MJ0CX4'
const DATAFAST_WEBSITE_ID =
  import.meta.env.VITE_DATAFAST_WEBSITE_ID || 'dfid_Q6KUNKXJWLZ88SKFP2uMi'
const DATAFAST_DOMAIN = import.meta.env.VITE_DATAFAST_DOMAIN || 'tcdynamics.fr'

const ensureScript = ({
  id,
  src,
  async = true,
  defer = false,
  attributes,
  appendTo = 'head',
}: EnsureScriptOptions) => {
  if (typeof window === 'undefined') return
  if (document.getElementById(id)) return

  const script = document.createElement('script')
  script.id = id
  script.src = src
  script.async = async
  script.defer = defer

  if (attributes) {
    Object.entries(attributes).forEach(([key, value]) => {
      script.setAttribute(key, value)
    })
  }

  const target =
    appendTo === 'body'
      ? (document.body ?? document.head)
      : (document.head ?? document.body)
  target?.appendChild(script)
}

const getGtag = (): GtagFunction => {
  const gtagWindow = window as Window & {
    dataLayer?: unknown[]
    gtag?: GtagFunction
  }

  if (!gtagWindow.dataLayer) {
    gtagWindow.dataLayer = []
  }

  if (!gtagWindow.gtag) {
    gtagWindow.gtag = (...args: unknown[]) => {
      gtagWindow.dataLayer?.push(args)
    }
  }

  return gtagWindow.gtag
}

export const loadGoogleAnalytics = (hasMarketingConsent: boolean) => {
  if (typeof window === 'undefined' || !GA_TRACKING_ID) return

  ensureScript({
    id: 'ga-gtag',
    src: `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`,
    async: true,
  })

  const gtag = getGtag()
  gtag('consent', 'default', {
    analytics_storage: 'granted',
    ad_storage: hasMarketingConsent ? 'granted' : 'denied',
  })
  gtag('js', new Date())
  gtag('config', GA_TRACKING_ID)
}

export const loadDatafast = () => {
  if (typeof window === 'undefined' || !DATAFAST_WEBSITE_ID) return

  ensureScript({
    id: 'datafast-analytics',
    src: 'https://datafa.st/js/script.js',
    defer: true,
    attributes: {
      'data-website-id': DATAFAST_WEBSITE_ID,
      'data-domain': DATAFAST_DOMAIN,
      'data-allow-localhost': 'true',
    },
  })
}

export const loadFacebookSdk = () => {
  if (typeof window === 'undefined') return

  ensureScript({
    id: 'facebook-sdk',
    src: '/scripts/facebook-sdk.js',
    defer: true,
    appendTo: 'body',
  })
}
