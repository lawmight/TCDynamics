import { useMemo } from 'react'

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
const SectionIndicators = ({
  activeId,
  sectionIds,
  labels = DEFAULT_LABELS,
}: SectionIndicatorsProps) => {
  const indicators = useMemo(
    () =>
      sectionIds.map(id => ({
        id,
        label: labels[id] || id,
      })),
    [sectionIds, labels]
  )

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
        className="section-indicators section-indicators--desktop"
      >
        <ul>
          {indicators.map(({ id, label }) => (
            <li key={id}>
              <button
                onClick={() => handleClick(id)}
                aria-label={`Aller à ${label}`}
                aria-current={activeId === id ? 'true' : undefined}
                title={label}
                className="section-indicator-btn"
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
        className="section-indicators section-indicators--mobile"
      >
        <ul>
          {indicators.map(({ id, label }) => (
            <li key={id}>
              <button
                onClick={() => handleClick(id)}
                aria-label={`Aller à ${label}`}
                aria-current={activeId === id ? 'true' : undefined}
                title={label}
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
