import { lazy, Suspense } from 'react'

import Features from '@/components/Features'
import Hero from '@/components/Hero'
import HowItWorks from '@/components/HowItWorks'
import SectionIndicators from '@/components/SectionIndicators'
import { useScrollSpy } from '@/hooks/useScrollSpy'

// Below-the-fold sections: lazy-loaded to reduce initial "/" chunk (bundle-dynamic-imports)
const FAQ = lazy(() => import('@/components/FAQ'))
const LocalAdvantages = lazy(() => import('@/components/LocalAdvantages'))
const Pricing = lazy(() => import('@/components/Pricing'))
const SocialProof = lazy(() => import('@/components/SocialProof'))
const LazyContact = lazy(() => import('@/components/Contact'))

// Scroll offset to account for fixed navigation header
const scrollMarginStyle = { scrollMarginTop: '5rem' }

// Section IDs for scroll spy
const SECTION_IDS = [
  'hero',
  'features',
  'how-it-works',
  'local-advantages',
  'social-proof',
  'pricing',
  'faq',
  'contact',
] as const

const Index = () => {
  const { activeId } = useScrollSpy([...SECTION_IDS])

  return (
    <main id="main">
      {/* Section Indicators */}
      <SectionIndicators activeId={activeId} sectionIds={[...SECTION_IDS]} />

      <section id="hero" aria-label="Présentation TCDynamics">
        <Hero />
      </section>
      <section
        id="features"
        aria-label="Fonctionnalités"
        style={scrollMarginStyle}
      >
        <Features />
      </section>
      <section
        id="how-it-works"
        aria-label="Comment ça marche"
        style={scrollMarginStyle}
      >
        <HowItWorks />
      </section>
      <section
        id="local-advantages"
        aria-label="Avantages locaux"
        style={scrollMarginStyle}
      >
        <Suspense fallback={null}>
          <LocalAdvantages />
        </Suspense>
      </section>
      <section
        id="social-proof"
        aria-label="Preuves sociales"
        style={scrollMarginStyle}
      >
        <Suspense fallback={null}>
          <SocialProof />
        </Suspense>
      </section>
      <section id="pricing" aria-label="Tarifs" style={scrollMarginStyle}>
        <Suspense fallback={null}>
          <Pricing />
        </Suspense>
      </section>
      <section id="faq" aria-label="FAQ" style={scrollMarginStyle}>
        <Suspense fallback={null}>
          <FAQ />
        </Suspense>
      </section>
      <section id="contact" aria-label="Contact" style={scrollMarginStyle}>
        <Suspense fallback={null}>
          <LazyContact />
        </Suspense>
      </section>
    </main>
  )
}

export default Index
