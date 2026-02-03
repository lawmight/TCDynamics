/// <reference types="vite/client" />

/** unplugin-icons: virtual ~icons/lucide/* modules (JSX components) */
declare module '~icons/lucide/*' {
  import type { SVGProps } from 'react'
  const component: React.FC<SVGProps<SVGSVGElement>>
  export default component
}

interface ImportMetaEnv {
  readonly VITE_TURNSTILE_SITE_KEY?: string
  readonly VITE_FACEBOOK_PIXEL_ID?: string
  readonly VITE_ANALYTICS_GA_TRACKING_ID?: string
  readonly VITE_DATAFAST_WEBSITE_ID?: string
  readonly VITE_DATAFAST_DOMAIN?: string
  readonly VITE_FRONTEND_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface Window {
  dataLayer?: unknown[]
  gtag?: (...args: unknown[]) => void
}
