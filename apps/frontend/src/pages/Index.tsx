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
