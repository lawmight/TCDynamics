import Contact from '@/components/Contact'
import FAQ from '@/components/FAQ'
import Features from '@/components/Features'
import Hero from '@/components/Hero'
import HowItWorks from '@/components/HowItWorks'
import LocalAdvantages from '@/components/LocalAdvantages'
import Pricing from '@/components/Pricing'
import SectionIndicators from '@/components/SectionIndicators'
import SocialProof from '@/components/SocialProof'
import { useScrollSpy } from '@/hooks/useScrollSpy'

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
        <LocalAdvantages />
      </section>
      <section
        id="social-proof"
        aria-label="Preuves sociales"
        style={scrollMarginStyle}
      >
        <SocialProof />
      </section>
      <section id="pricing" aria-label="Tarifs" style={scrollMarginStyle}>
        <Pricing />
      </section>
      <section id="faq" aria-label="FAQ" style={scrollMarginStyle}>
        <FAQ />
      </section>
      <section id="contact" aria-label="Contact" style={scrollMarginStyle}>
        <Contact />
      </section>
    </main>
  )
}

export default Index
