import { track } from '@vercel/analytics'
import { useEffect, useRef, useState } from 'react'

import Captcha, { type CaptchaHandle } from '@/components/Captcha'
import { PostSubmissionFeedback } from '@/components/PostSubmissionFeedback'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useContactForm } from '@/hooks/useContactForm'
import { useDemoForm } from '@/hooks/useDemoForm'
import Building from '~icons/lucide/building'
import Calendar from '~icons/lucide/calendar'
import Car from '~icons/lucide/car'
import CheckCircle from '~icons/lucide/check-circle'
import Mail from '~icons/lucide/mail'
import MapPin from '~icons/lucide/map-pin'
import Phone from '~icons/lucide/phone'

const Contact = () => {
  const demoForm = useDemoForm()
  const contactForm = useContactForm()
  const [showDemoFeedback, setShowDemoFeedback] = useState(false)
  const [showContactFeedback, setShowContactFeedback] = useState(false)
  const [demoUserData, setDemoUserData] = useState<{
    email: string
    company: string
  } | null>(null)
  const [contactUserData, setContactUserData] = useState<{
    email: string
    company: string
  } | null>(null)
  const [demoCaptchaToken, setDemoCaptchaToken] = useState<string | undefined>()
  const [contactCaptchaToken, setContactCaptchaToken] = useState<
    string | undefined
  >()
  const demoCaptchaRef = useRef<CaptchaHandle | null>(null)
  const contactCaptchaRef = useRef<CaptchaHandle | null>(null)

  // Analytics tracking state
  const [demoFormStarted, setDemoFormStarted] = useState(false)
  const [contactFormStarted, setContactFormStarted] = useState(false)
  const [demoFormSubmitted, setDemoFormSubmitted] = useState(false)
  const [contactFormSubmitted, setContactFormSubmitted] = useState(false)
  const demoFormStartTracked = useRef(false)
  const contactFormStartTracked = useRef(false)

  // Track demo form start
  const handleDemoFormStart = () => {
    if (!demoFormStartTracked.current) {
      setDemoFormStarted(true)
      demoFormStartTracked.current = true
      track('demo_form_started', {
        timestamp: new Date().toISOString(),
      })
    }
  }

  // Track contact form start
  const handleContactFormStart = () => {
    if (!contactFormStartTracked.current) {
      setContactFormStarted(true)
      contactFormStartTracked.current = true
      track('contact_form_started', {
        timestamp: new Date().toISOString(),
      })
    }
  }

  // Track form abandonment when user leaves page
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Track demo form abandonment
      if (demoFormStarted && !demoFormSubmitted) {
        track('demo_form_abandoned', {
          timestamp: new Date().toISOString(),
        })
      }
      // Track contact form abandonment
      if (contactFormStarted && !contactFormSubmitted) {
        track('contact_form_abandoned', {
          timestamp: new Date().toISOString(),
        })
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [
    demoFormStarted,
    demoFormSubmitted,
    contactFormStarted,
    contactFormSubmitted,
  ])

  const contactInfo = [
    {
      icon: Building,
      title: 'Siège social',
      details: [
        'TCDynamics France',
        '12 Avenue des Prés',
        '78180 Montigny-le-Bretonneux',
        'Île-de-France',
      ],
    },
    {
      icon: Phone,
      title: 'Téléphone',
      details: [
        'Standard : 01 39 44 75 00',
        'Support : 01 39 44 75 01',
        'Commercial : 01 39 44 75 02',
        'Lundi-Vendredi 8h-19h',
      ],
    },
    {
      icon: Mail,
      title: 'Email',
      details: [
        'contact@tcdynamics.fr',
        'demo@tcdynamics.fr',
        'support@tcdynamics.fr',
        'Réponse sous 2h',
      ],
    },
    {
      icon: Car,
      title: 'Accès',
      details: [
        'RER C : Gare de Saint-Quentin',
        'A86/N12 : Sortie Guyancourt',
        'Parking gratuit sur site',
        '15min de Versailles',
      ],
    },
  ]

  const benefits = [
    'Démonstration personnalisée 45min',
    'Analyse gratuite de vos processus',
    'Devis sur mesure immédiat',
    'Test avec vos données réelles',
  ]

  return (
    <section className="from-background to-background/50 relative overflow-hidden bg-gradient-to-b py-24">
      {/* Network Background */}
      <div className="absolute inset-0 opacity-5">
        <svg
          className="absolute inset-0 size-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="contact-network"
              width="80"
              height="80"
              patternUnits="userSpaceOnUse"
            >
              <circle
                cx="40"
                cy="40"
                r="2"
                fill="hsl(var(--primary))"
                opacity="0.4"
              />
              <path
                d="M40,40 L80,0 M40,40 L80,80 M40,40 L0,80"
                stroke="hsl(var(--primary))"
                strokeWidth="0.5"
                opacity="0.3"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#contact-network)" />
        </svg>
      </div>

      <div className="container relative z-10 mx-auto px-4">
        {/* Header */}
        <div className="fade-in-up mb-16 text-center">
          <Badge
            variant="outline"
            className="border-primary/40 text-primary mb-6 font-mono"
          >
            Contactez-nous
          </Badge>
          <h2 className="text-gradient mb-6 text-4xl font-bold md:text-5xl">
            Prêt à automatiser ?
          </h2>
          <p className="text-muted-foreground mx-auto max-w-3xl font-mono text-xl">
            Découvrez comment TCDynamics peut transformer votre entreprise
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="mx-auto max-w-6xl">
          <div className="grid items-start gap-6 md:grid-cols-3 lg:grid-cols-3">
            {/* Hero Card - Demo Request Form (Full Width) */}
            <div className="fade-in-up fade-delay-02 border-primary/40 from-primary/10 via-primary/5 to-background shadow-primary/20 hover:border-primary/60 hover:shadow-primary/30 relative overflow-hidden rounded-lg border-2 bg-gradient-to-br p-8 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl md:col-span-3 lg:col-span-3">
              <div className="mb-6 flex items-center gap-3">
                <div className="bg-primary/20 rounded-full p-2">
                  <Calendar className="text-primary size-6" />
                </div>
                <div>
                  <h3 className="text-primary text-2xl font-bold lg:text-3xl">
                    Réserver une démo
                  </h3>
                  <p className="text-muted-foreground font-mono text-sm">
                    Démonstration personnalisée avec vos données
                  </p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Benefits Section */}
                <div className="border-primary/20 bg-primary/5 rounded-lg border p-4">
                  <h4 className="text-primary mb-3 flex items-center gap-2 font-semibold">
                    <CheckCircle className="text-primary size-4" />
                    Inclus dans votre démonstration :
                  </h4>
                  <ul className="space-y-2">
                    {benefits.map((benefit, index) => (
                      <li
                        key={index}
                        className="flex items-center font-mono text-sm"
                      >
                        <div className="bg-primary mr-3 size-1.5 shrink-0 rounded-full" />
                        <span className="text-muted-foreground">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Demo Form */}
                <form
                  className="space-y-4"
                  aria-label="Formulaire de demande de démonstration"
                  onSubmit={async e => {
                    e.preventDefault()
                    if (demoForm.isSubmitting) return
                    const form = e.currentTarget
                    const formData = new FormData(form)
                    const firstName = formData.get('firstName') as string
                    const lastName = formData.get('lastName') as string
                    const email = formData.get('email') as string
                    const company = formData.get('company') as string
                    const data = {
                      name: `${firstName} ${lastName}`.trim(),
                      email,
                      phone: formData.get('phone') as string,
                      company,
                      companySize: formData.get('employees') as string,
                      businessNeeds: formData.get('needs') as string,
                      captchaToken: demoCaptchaToken,
                    }

                    const result = await demoForm.submitForm(data)
                    if (result.success) {
                      setDemoFormSubmitted(true)
                      form.reset()
                      setDemoUserData({ email, company })
                      setShowDemoFeedback(true)
                      setDemoCaptchaToken(undefined)
                      demoCaptchaRef.current?.reset()
                      setTimeout(() => demoForm.clearResponse(), 5000)
                    }
                  }}
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="firstName"
                        className="mb-2 block text-sm font-medium"
                      >
                        Prénom *
                      </label>
                      <Input
                        id="firstName"
                        name="firstName"
                        placeholder="Jean"
                        className="bg-background/50"
                        required
                        aria-required="true"
                        onFocus={handleDemoFormStart}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="lastName"
                        className="mb-2 block text-sm font-medium"
                      >
                        Nom *
                      </label>
                      <Input
                        id="lastName"
                        name="lastName"
                        placeholder="Dupont"
                        className="bg-background/50"
                        required
                        aria-required="true"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-medium"
                    >
                      Email professionnel *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="jean.dupont@entreprise.fr"
                      className="bg-background/50"
                      required
                      aria-required="true"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="phone"
                        className="mb-2 block text-sm font-medium"
                      >
                        Téléphone
                      </label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="01 23 45 67 89"
                        className="bg-background/50"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="employees"
                        className="mb-2 block text-sm font-medium"
                      >
                        Nb employés
                      </label>
                      <Input
                        id="employees"
                        name="employees"
                        type="number"
                        placeholder="ex: 25"
                        className="bg-background/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="company"
                      className="mb-2 block text-sm font-medium"
                    >
                      Entreprise *
                    </label>
                    <Input
                      id="company"
                      name="company"
                      placeholder="Nom de votre entreprise"
                      className="bg-background/50"
                      required
                      aria-required="true"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="needs"
                      className="mb-2 block text-sm font-medium"
                    >
                      Besoins spécifiques *{' '}
                      <span className="text-muted-foreground text-xs font-normal">
                        (minimum 10 caractères)
                      </span>
                    </label>
                    <Textarea
                      id="needs"
                      name="needs"
                      placeholder="Décrivez brièvement vos processus à automatiser (minimum 10 caractères)..."
                      className="bg-background/50 min-h-[100px]"
                      required
                      minLength={10}
                      maxLength={5000}
                      aria-required="true"
                    />
                  </div>

                  <Captcha
                    ref={demoCaptchaRef}
                    onToken={token => setDemoCaptchaToken(token)}
                    action="demo-form"
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    variant="hero"
                    disabled={demoForm.isSubmitting}
                    aria-label={
                      demoForm.isSubmitting
                        ? 'Envoi de la demande de démonstration en cours'
                        : 'Réserver ma démonstration gratuite'
                    }
                  >
                    {demoForm.isSubmitting ? (
                      'Envoi en cours...'
                    ) : (
                      <>
                        <Calendar className="mr-2 size-4" />
                        Réserver ma démo gratuite
                      </>
                    )}
                  </Button>
                </form>
              </div>

              {demoForm.response && (
                <div
                  role="alert"
                  className={`mt-4 rounded-lg p-4 ${
                    demoForm.response.success
                      ? 'border-primary/20 bg-primary/10 text-primary border'
                      : 'border-destructive/20 bg-destructive/10 text-destructive border'
                  }`}
                >
                  {demoForm.response.message}
                  {demoForm.response.errors && (
                    <ul className="mt-2 text-sm">
                      {demoForm.response.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <p className="text-muted-foreground mt-4 text-center font-mono text-xs">
                Démonstration de 45min • Sans engagement • Réponse sous 2h
              </p>
            </div>

            {/* Supporting Card 1 - Contact Info (Combined) */}
            <div className="fade-in-up fade-delay-04 border-border/50 bg-card/30 hover:border-primary/30 hover:bg-card/50 relative overflow-hidden rounded-lg border p-4 backdrop-blur-sm transition-all duration-300 md:col-span-1 lg:col-span-1">
              <div className="mb-3 flex items-center gap-2">
                <div className="bg-primary/10 rounded-full p-1.5">
                  <Building className="text-primary size-4" />
                </div>
                <h4 className="text-foreground font-mono text-base font-bold">
                  Contact
                </h4>
              </div>
              <div className="space-y-3">
                {contactInfo.slice(0, 2).map((info, index) => {
                  return (
                    <div key={index} className="space-y-0.5">
                      <h5 className="text-foreground text-xs font-semibold">
                        {info.title}
                      </h5>
                      <div className="space-y-0.5">
                        {info.details.map((detail, detailIndex) => (
                          <p
                            key={detailIndex}
                            className="text-muted-foreground font-mono text-xs leading-tight"
                          >
                            {detail}
                          </p>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Supporting Card 2 - More Contact Info */}
            <div className="fade-in-up fade-delay-06 border-border/50 bg-card/30 hover:border-primary/30 hover:bg-card/50 relative overflow-hidden rounded-lg border p-4 backdrop-blur-sm transition-all duration-300 md:col-span-1 lg:col-span-1">
              <div className="mb-3 flex items-center gap-2">
                <div className="bg-primary/10 rounded-full p-1.5">
                  <Mail className="text-primary size-4" />
                </div>
                <h4 className="text-foreground font-mono text-base font-bold">
                  Accès & Email
                </h4>
              </div>
              <div className="space-y-3">
                {contactInfo.slice(2).map((info, index) => {
                  return (
                    <div key={index} className="space-y-0.5">
                      <h5 className="text-foreground text-xs font-semibold">
                        {info.title}
                      </h5>
                      <div className="space-y-0.5">
                        {info.details.map((detail, detailIndex) => (
                          <p
                            key={detailIndex}
                            className="text-muted-foreground font-mono text-xs leading-tight"
                          >
                            {detail}
                          </p>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Supporting Card 3 - Local Office Highlight */}
            <div className="fade-in-up fade-delay-08 border-primary/20 from-primary/10 to-primary/5 hover:border-primary/40 hover:from-primary/15 hover:to-primary/10 relative overflow-hidden rounded-lg border bg-gradient-to-br p-4 backdrop-blur-sm transition-all duration-300 hover:bg-gradient-to-br md:col-span-1 lg:col-span-1">
              <div className="mb-3 flex items-center gap-2">
                <div className="bg-primary/20 rounded-full p-1.5">
                  <MapPin className="text-primary size-4" />
                </div>
                <h4 className="text-primary font-mono text-base font-bold">
                  Bureau local
                </h4>
              </div>
              <div>
                <h5 className="text-foreground mb-1.5 text-sm font-bold">
                  Île-de-France
                </h5>
                <p className="text-muted-foreground mb-3 font-mono text-xs leading-tight">
                  Équipe française basée à Montigny-le-Bretonneux, proche de
                  Guyancourt
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary font-mono text-xs"
                  >
                    Intervention sur site
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary font-mono text-xs"
                  >
                    Support local
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary font-mono text-xs"
                  >
                    Formation en français
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* General Contact Form - Below Bento Grid */}
          <div className="mt-6">
            <Card className="fade-in-up fade-delay-10 border-primary/20 bg-card/60 backdrop-blur-sm">
              <CardHeader>
                <div className="mb-2 flex items-center gap-3">
                  <div className="bg-primary/10 rounded-full p-2">
                    <Mail className="text-primary size-5" />
                  </div>
                  <CardTitle>Nous contacter</CardTitle>
                </div>
                <p className="text-muted-foreground font-mono text-sm">
                  Une question ? Notre équipe vous répond rapidement
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <form
                  className="space-y-4"
                  onSubmit={async e => {
                    e.preventDefault()
                    if (contactForm.isSubmitting) return
                    const form = e.currentTarget
                    const formData = new FormData(form)
                    const email = formData.get('email') as string
                    const company = formData.get('company') as string
                    const data = {
                      name: `${formData.get('firstName')} ${formData.get('lastName')}`.trim(),
                      email,
                      phone: formData.get('phone') as string,
                      company,
                      message: formData.get('message') as string,
                      captchaToken: contactCaptchaToken,
                    }

                    const result = await contactForm.submitForm(data)
                    if (result.success) {
                      setContactFormSubmitted(true)
                      form.reset()
                      setContactUserData({ email, company })
                      setShowContactFeedback(true)
                      setContactCaptchaToken(undefined)
                      contactCaptchaRef.current?.reset()
                      setTimeout(() => contactForm.clearResponse(), 5000)
                    }
                  }}
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="contact-firstName"
                        className="mb-2 block text-sm font-medium"
                      >
                        Prénom *
                      </label>
                      <Input
                        id="contact-firstName"
                        name="firstName"
                        placeholder="Prénom"
                        className="bg-background/50"
                        required
                        aria-required="true"
                        onFocus={handleContactFormStart}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="contact-lastName"
                        className="mb-2 block text-sm font-medium"
                      >
                        Nom *
                      </label>
                      <Input
                        id="contact-lastName"
                        name="lastName"
                        placeholder="Nom"
                        className="bg-background/50"
                        required
                        aria-required="true"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="contact-email"
                      className="mb-2 block text-sm font-medium"
                    >
                      Email *
                    </label>
                    <Input
                      id="contact-email"
                      name="email"
                      type="email"
                      placeholder="votre@email.fr"
                      className="bg-background/50"
                      required
                      aria-required="true"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="contact-phone"
                        className="mb-2 block text-sm font-medium"
                      >
                        Téléphone
                      </label>
                      <Input
                        id="contact-phone"
                        name="phone"
                        placeholder="01 23 45 67 89"
                        className="bg-background/50"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="contact-company"
                        className="mb-2 block text-sm font-medium"
                      >
                        Entreprise
                      </label>
                      <Input
                        id="contact-company"
                        name="company"
                        placeholder="Nom de votre entreprise"
                        className="bg-background/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="contact-message"
                      className="mb-2 block text-sm font-medium"
                    >
                      Message *{' '}
                      <span className="text-muted-foreground text-xs font-normal">
                        (minimum 10 caractères)
                      </span>
                    </label>
                    <Textarea
                      id="contact-message"
                      name="message"
                      placeholder="Décrivez votre demande (minimum 10 caractères)..."
                      className="bg-background/50 min-h-[120px]"
                      required
                      minLength={10}
                      maxLength={5000}
                      aria-required="true"
                    />
                  </div>

                  <Captcha
                    ref={contactCaptchaRef}
                    onToken={token => setContactCaptchaToken(token)}
                    action="contact-form"
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    variant="outline"
                    disabled={contactForm.isSubmitting}
                  >
                    {contactForm.isSubmitting ? (
                      'Envoi en cours...'
                    ) : (
                      <>
                        <Mail className="mr-2 size-4" />
                        Envoyer le message
                      </>
                    )}
                  </Button>
                </form>

                {contactForm.response && (
                  <div
                    className={`mt-4 rounded-lg p-4 ${
                      contactForm.response.success
                        ? 'border-primary/20 bg-primary/10 text-primary border'
                        : 'border-destructive/20 bg-destructive/10 text-destructive border'
                    }`}
                  >
                    {contactForm.response.message}
                    {contactForm.response.errors && (
                      <ul className="mt-2 text-sm">
                        {contactForm.response.errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Demo Form Feedback Dialog */}
      {showDemoFeedback && (
        <PostSubmissionFeedback
          formType="demo"
          userEmail={demoUserData?.email}
          userCompany={demoUserData?.company}
          onClose={() => setShowDemoFeedback(false)}
        />
      )}

      {/* Contact Form Feedback Dialog */}
      {showContactFeedback && (
        <PostSubmissionFeedback
          formType="contact"
          userEmail={contactUserData?.email}
          userCompany={contactUserData?.company}
          onClose={() => setShowContactFeedback(false)}
        />
      )}
    </section>
  )
}

export default Contact
