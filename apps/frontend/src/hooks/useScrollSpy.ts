import { useEffect, useState } from 'react'

/**
 * Hook that tracks which section is currently active using IntersectionObserver.
 * Uses rootMargin to detect which section's center is closest to the viewport center.
 *
 * @param sectionIds - Array of section element IDs to observe
 * @returns { activeId: string | null } - The currently active section ID
 */
export const useScrollSpy = (sectionIds: string[]) => {
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    if (sectionIds.length === 0) {
      return
    }

    // Track intersection ratios for each section
    const ratios = new Map<string, number>()

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          ratios.set(entry.target.id, entry.intersectionRatio)
        })

        // Find the section with the highest intersection ratio
        let maxRatio = 0
        let mostVisibleId: string | null = null

        ratios.forEach((ratio, id) => {
          if (ratio > maxRatio) {
            maxRatio = ratio
            mostVisibleId = id
          }
        })

        // Only update if we have a visible section
        if (mostVisibleId && maxRatio > 0) {
          setActiveId(mostVisibleId)
        }
      },
      {
        // '-40% 0px -40% 0px' means only the central 20% of the viewport triggers
        rootMargin: '-40% 0px -40% 0px',
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
      }
    )

    // Observe all sections
    const elements: Element[] = []
    sectionIds.forEach(id => {
      const element = document.getElementById(id)
      if (element) {
        observer.observe(element)
        elements.push(element)
      }
    })

    // Set initial active section (first one if no intersection yet)
    if (elements.length > 0 && !activeId) {
      setActiveId(sectionIds[0])
    }

    return () => {
      observer.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionIds.join(',')])

  return { activeId }
}
