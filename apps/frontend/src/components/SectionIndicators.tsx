import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

/** Default label mapping for section IDs */
const DEFAULT_LABELS: Record<string, string> = {
  hero: 'Présentation',
  features: 'Fonctionnalités',
  'how-it-works': 'Comment ça marche',
  'local-advantages': 'Avantages',
  'social-proof': 'Preuves',
  pricing: 'Tarifs',
  faq: 'FAQ',
  contact: 'Contact',
}

interface SectionIndicatorsProps {
  activeId: string | null
  sectionIds: string[]
  labels?: Record<string, string>
}

/**
 * Floating navigation dots that show current section.
 * - Desktop: fixed right side, vertically centered
 * - Mobile: fixed bottom, horizontally centered
 * - Click scrolls to section via scrollIntoView
 * - Full accessibility: aria-label, aria-current, keyboard navigation
 */
/**
 * Hide fixed dots when the site footer scrolls into view so they never cover
 * footer content (e.g. Mentions column on the home page).
 */
function useHideIndicatorsForFooter(): boolean {
  const [hide, setHide] = useState(false)

  useEffect(() => {
    const footer = document.getElementById('site-footer')
    if (!footer) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setHide(entry.isIntersecting)
      },
      { root: null, rootMargin: '0px', threshold: 0 },
    )

    observer.observe(footer)
    return () => observer.disconnect()
  }, [])

  return hide
}

const SectionIndicators = ({
  activeId,
  sectionIds,
  labels = DEFAULT_LABELS,
}: SectionIndicatorsProps) => {
  const hideNearFooter = useHideIndicatorsForFooter()

  const indicators = sectionIds.map(id => ({
    id,
    label: labels[id] || id,
  }))

  const handleClick = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <>
      {/* Desktop indicators - right side */}
      <nav
        aria-label="Navigation des sections"
        className={cn(
          'section-indicators section-indicators--desktop',
          hideNearFooter && 'section-indicators--hidden',
        )}
      >
        <ul>
          {indicators.map(({ id, label }) => (
            <li key={id}>
              <button
                onClick={() => handleClick(id)}
                aria-label={`Aller à ${label}`}
                aria-current={activeId === id ? 'true' : undefined}
                title={label}
                className="section-indicator-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {/* Dot container - fixed size to prevent layout shift */}
                <span className="section-indicator-dot-container">
                  <span
                    className="section-indicator-dot"
                    style={{
                      width: activeId === id ? '12px' : '8px',
                      height: activeId === id ? '12px' : '8px',
                      backgroundColor:
                        activeId === id
                          ? 'hsl(var(--primary))'
                          : 'hsl(var(--muted-foreground) / 0.4)',
                      boxShadow:
                        activeId === id
                          ? '0 0 8px hsl(var(--primary) / 0.5)'
                          : 'none',
                    }}
                  />
                </span>
                {/* Label - visible on hover via CSS */}
                <span
                  className="section-indicator-label"
                  style={{
                    color:
                      activeId === id
                        ? 'hsl(var(--primary))'
                        : 'hsl(var(--muted-foreground))',
                  }}
                >
                  {label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Mobile indicators - bottom center */}
      <nav
        aria-label="Navigation des sections"
        className={cn(
          'section-indicators section-indicators--mobile',
          hideNearFooter && 'section-indicators--hidden',
        )}
      >
        <ul>
          {indicators.map(({ id, label }) => (
            <li key={id}>
              <button
                onClick={() => handleClick(id)}
                aria-label={`Aller à ${label}`}
                aria-current={activeId === id ? 'true' : undefined}
                title={label}
                className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                style={{
                  width: activeId === id ? '24px' : '8px',
                  backgroundColor:
                    activeId === id
                      ? 'hsl(var(--primary))'
                      : 'hsl(var(--muted-foreground) / 0.4)',
                }}
              />
            </li>
          ))}
        </ul>
      </nav>
    </>
  )
}

export default SectionIndicators
