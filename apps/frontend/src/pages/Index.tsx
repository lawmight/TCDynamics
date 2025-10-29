import Hero from '@/components/Hero'
import Features from '@/components/Features'
import HowItWorks from '@/components/HowItWorks'
import LocalAdvantages from '@/components/LocalAdvantages'
import SocialProof from '@/components/SocialProof'
import Pricing from '@/components/Pricing'
import FAQ from '@/components/FAQ'
import Contact from '@/components/Contact'

const Index = () => {
  return (
    <main id="main">
      <section id="hero" aria-label="Présentation WorkFlowAI">
        <Hero />
      </section>
      <section id="features">
        <Features />
      </section>
      <section id="how-it-works">
        <HowItWorks />
      </section>
      <section id="local-advantages">
        <LocalAdvantages />
      </section>
      <section id="social-proof">
        <SocialProof />
      </section>
      <section id="pricing">
        <Pricing />
      </section>
      <section id="faq">
        <FAQ />
      </section>
      <section id="contact">
        <Contact />
      </section>
    </main>
  )
}

export default Index
