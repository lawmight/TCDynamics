import Contact from '@/components/Contact'
import FAQ from '@/components/FAQ'
import Features from '@/components/Features'
import Hero from '@/components/Hero'
import HowItWorks from '@/components/HowItWorks'
import LocalAdvantages from '@/components/LocalAdvantages'
import Pricing from '@/components/Pricing'
import SocialProof from '@/components/SocialProof'

const Index = () => {
  return (
    <main id="main">
      <section id="hero" aria-label="Présentation WorkFlowAI">
        <Hero />
      </section>
      <section id="features" aria-label="Fonctionnalités">
        <Features />
      </section>
      <section id="how-it-works" aria-label="Comment ça marche">
        <HowItWorks />
      </section>
      <section id="local-advantages" aria-label="Avantages locaux">
        <LocalAdvantages />
      </section>
      <section id="social-proof" aria-label="Preuves sociales">
        <SocialProof />
      </section>
      <section id="pricing" aria-label="Tarifs">
        <Pricing />
      </section>
      <section id="faq" aria-label="FAQ">
        <FAQ />
      </section>
      <section id="contact" aria-label="Contact">
        <Contact />
      </section>
    </main>
  )
}

export default Index
