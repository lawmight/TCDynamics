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
        style={{
          position: 'fixed',
          right: '1.25rem',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 35,
          display: 'none',
        }}
      >
        <ul
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            listStyle: 'none',
            margin: 0,
            padding: 0,
          }}
        >
          {indicators.map(({ id, label }) => (
            <li key={id}>
              <button
                onClick={() => handleClick(id)}
                aria-label={`Aller à ${label}`}
                aria-current={activeId === id ? 'true' : undefined}
                title={label}
                className="section-indicator-btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  borderRadius: '9999px',
                  transition: 'all 0.2s ease',
                }}
              >
                {/* Dot */}
                <span
                  style={{
                    width: activeId === id ? '12px' : '8px',
                    height: activeId === id ? '12px' : '8px',
                    borderRadius: '50%',
                    backgroundColor:
                      activeId === id
                        ? 'hsl(var(--primary))'
                        : 'hsl(var(--muted-foreground) / 0.4)',
                    transition: 'all 0.2s ease',
                    boxShadow:
                      activeId === id
                        ? '0 0 8px hsl(var(--primary) / 0.5)'
                        : 'none',
                  }}
                />
                {/* Label - visible on hover via CSS */}
                <span
                  className="section-indicator-label"
                  style={{
                    fontSize: '0.75rem',
                    color:
                      activeId === id
                        ? 'hsl(var(--primary))'
                        : 'hsl(var(--muted-foreground))',
                    opacity: 0,
                    transform: 'translateX(-4px)',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap',
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
        style={{
          position: 'fixed',
          bottom: '5rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 35,
          display: 'none',
        }}
      >
        <ul
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '0.5rem',
            listStyle: 'none',
            margin: 0,
            padding: '0.5rem 0.75rem',
            backgroundColor: 'hsl(var(--background) / 0.9)',
            backdropFilter: 'blur(8px)',
            borderRadius: '9999px',
            boxShadow: '0 4px 20px hsl(0 0% 0% / 0.15)',
          }}
        >
          {indicators.map(({ id, label }) => (
            <li key={id}>
              <button
                onClick={() => handleClick(id)}
                aria-label={`Aller à ${label}`}
                aria-current={activeId === id ? 'true' : undefined}
                title={label}
                style={{
                  width: activeId === id ? '24px' : '8px',
                  height: '8px',
                  borderRadius: '9999px',
                  backgroundColor:
                    activeId === id
                      ? 'hsl(var(--primary))'
                      : 'hsl(var(--muted-foreground) / 0.4)',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'all 0.2s ease',
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
