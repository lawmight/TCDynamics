/**
 * Runtime injection of JSON-LD structured data (Schema.org) for per-page Article/WebPage
 * and FAQPage. Visible to crawlers in Wave 2 (after JS runs); for Wave 1 use static
 * script tags in index.html.
 */

const PAGE_SCHEMA_SCRIPT_ID = 'page-schema'
const FAQ_SCHEMA_SCRIPT_ID = 'faq-schema'

const getBaseUrl = (): string => {
  if (typeof window === 'undefined') return ''
  return window.location.origin + window.location.pathname.replace(/\/$/, '') || window.location.origin
}

/**
 * Resolves the frontend base URL for @id and url in schema (author, canonical).
 * Uses VITE_FRONTEND_URL when available so production builds have stable URLs.
 */
export const getStructuredDataBaseUrl = (): string => {
  const env = typeof import.meta !== 'undefined' && import.meta.env?.VITE_FRONTEND_URL
  if (env && typeof env === 'string' && env.length > 0) {
    try {
      return new URL(env).origin + new URL(env).pathname.replace(/\/$/, '') || new URL(env).origin
    } catch {
      // fallback to current origin
    }
  }
  return getBaseUrl()
}

/**
 * Create or replace a single JSON-LD script for the current page (Article/WebPage).
 * Call on route mount; call clearPageStructuredData on route leave.
 */
export function setPageStructuredData(schema: object): void {
  if (typeof document === 'undefined') return
  let script = document.getElementById(PAGE_SCHEMA_SCRIPT_ID) as HTMLScriptElement | null
  if (!script) {
    script = document.createElement('script')
    script.id = PAGE_SCHEMA_SCRIPT_ID
    script.type = 'application/ld+json'
    document.head.appendChild(script)
  }
  script.textContent = JSON.stringify(schema)
}

/**
 * Remove the per-page JSON-LD script. Call on route leave.
 * Uses parentNode.removeChild for JSDOM/test environment compatibility.
 */
export function clearPageStructuredData(): void {
  if (typeof document === 'undefined') return
  const script = document.getElementById(PAGE_SCHEMA_SCRIPT_ID)
  if (script?.parentNode) script.parentNode.removeChild(script)
}

/**
 * Build and inject FAQPage JSON-LD from FAQ items (single source of truth).
 * Strips ** for plain text in acceptedAnswer; joins answer array with spaces.
 */
export function setFaqPageStructuredData(
  items: Array<{ question: string; answer: string[] }>
): void {
  if (typeof document === 'undefined') return
  const mainEntity = items.map(({ question, answer }) => {
    const text = answer
      .map(line => line.replace(/\*\*(.+?)\*\*/g, '$1'))
      .join(' ')
      .trim()
    return {
      '@type': 'Question' as const,
      name: question,
      acceptedAnswer: {
        '@type': 'Answer' as const,
        text,
      },
    }
  })
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity,
  }
  let script = document.getElementById(FAQ_SCHEMA_SCRIPT_ID) as HTMLScriptElement | null
  if (!script) {
    script = document.createElement('script')
    script.id = FAQ_SCHEMA_SCRIPT_ID
    script.type = 'application/ld+json'
    document.head.appendChild(script)
  }
  script.textContent = JSON.stringify(schema)
}

/**
 * Remove the FAQ JSON-LD script. Call when FAQ section unmounts.
 * Uses parentNode.removeChild for JSDOM/test environment compatibility.
 */
export function clearFaqPageStructuredData(): void {
  if (typeof document === 'undefined') return
  const script = document.getElementById(FAQ_SCHEMA_SCRIPT_ID)
  if (script?.parentNode) script.parentNode.removeChild(script)
}

/**
 * Build WebPage or Article schema with author reference by @id.
 * Use for content pages (About, GetStarted, Security, Demo, Features).
 */
export function buildPageSchema(options: {
  type: 'WebPage' | 'Article'
  headline: string
  description: string
  datePublished: string
  dateModified?: string
}): object {
  const base = getStructuredDataBaseUrl()
  const url = typeof window !== 'undefined' ? window.location.href : base
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': options.type,
    headline: options.headline,
    description: options.description,
    datePublished: options.datePublished,
    url,
    author: { '@id': `${base}/#author` },
  }
  if (options.dateModified) schema.dateModified = options.dateModified
  return schema
}
