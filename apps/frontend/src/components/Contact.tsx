import { track } from '@vercel/analytics'
import {
  Building,
  Calendar,
  Car,
  CheckCircle,
  Mail,
  MapPin,
  Phone,
} from 'lucide-react'
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
        'WorkFlowAI France',
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
        'contact@workflowai.fr',
        'demo@workflowai.fr',
        'support@workflowai.fr',
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
    <section className="relative overflow-hidden bg-gradient-to-b from-background to-background/50 py-24">
      {/* Network Background */}
      <div className="absolute inset-0 opacity-5">
        <svg
          className="absolute inset-0 h-full w-full"
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
            className="mb-6 border-primary/40 font-mono text-primary"
          >
            Contactez-nous
          </Badge>
          <h2 className="text-gradient mb-6 text-4xl font-bold md:text-5xl">
            Prêt à automatiser ?
          </h2>
          <p className="mx-auto max-w-3xl font-mono text-xl text-muted-foreground">
            Découvrez comment WorkFlowAI peut transformer votre entreprise
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="mx-auto max-w-6xl">
          <div className="grid items-start gap-6 md:grid-cols-3 lg:grid-cols-3">
            {/* Hero Card - Demo Request Form (Full Width) */}
            <div className="fade-in-up fade-delay-02 relative overflow-hidden rounded-lg border-2 border-primary/40 bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8 shadow-lg shadow-primary/20 backdrop-blur-sm transition-all duration-300 hover:border-primary/60 hover:shadow-xl hover:shadow-primary/30 md:col-span-3 lg:col-span-3">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-full bg-primary/20 p-2">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-primary lg:text-3xl">
                    Réserver une démo
                  </h3>
                  <p className="font-mono text-sm text-muted-foreground">
                    Démonstration personnalisée avec vos données
                  </p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Benefits Section */}
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <h4 className="mb-3 flex items-center gap-2 font-semibold text-primary">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Inclus dans votre démonstration :
                  </h4>
                  <ul className="space-y-2">
                    {benefits.map((benefit, index) => (
                      <li
                        key={index}
                        className="flex items-center font-mono text-sm"
                      >
                        <div className="mr-3 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
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
                      <span className="text-xs font-normal text-muted-foreground">
                        (minimum 10 caractères)
                      </span>
                    </label>
                    <Textarea
                      id="needs"
                      name="needs"
                      placeholder="Décrivez brièvement vos processus à automatiser (minimum 10 caractères)..."
                      className="min-h-[100px] bg-background/50"
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
                        <Calendar className="mr-2 h-4 w-4" />
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
                      ? 'border border-primary/20 bg-primary/10 text-primary'
                      : 'border border-destructive/20 bg-destructive/10 text-destructive'
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

              <p className="mt-4 text-center font-mono text-xs text-muted-foreground">
                Démonstration de 45min • Sans engagement • Réponse sous 2h
              </p>
            </div>

            {/* Supporting Card 1 - Contact Info (Combined) */}
            <div className="fade-in-up fade-delay-04 relative overflow-hidden rounded-lg border border-border/50 bg-card/30 p-4 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:bg-card/50 md:col-span-1 lg:col-span-1">
              <div className="mb-3 flex items-center gap-2">
                <div className="rounded-full bg-primary/10 p-1.5">
                  <Building className="h-4 w-4 text-primary" />
                </div>
                <h4 className="font-mono text-base font-bold text-foreground">
                  Contact
                </h4>
              </div>
              <div className="space-y-3">
                {contactInfo.slice(0, 2).map((info, index) => {
                  return (
                    <div key={index} className="space-y-0.5">
                      <h5 className="text-xs font-semibold text-foreground">
                        {info.title}
                      </h5>
                      <div className="space-y-0.5">
                        {info.details.map((detail, detailIndex) => (
                          <p
                            key={detailIndex}
                            className="font-mono text-xs leading-tight text-muted-foreground"
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
            <div className="fade-in-up fade-delay-06 relative overflow-hidden rounded-lg border border-border/50 bg-card/30 p-4 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:bg-card/50 md:col-span-1 lg:col-span-1">
              <div className="mb-3 flex items-center gap-2">
                <div className="rounded-full bg-primary/10 p-1.5">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <h4 className="font-mono text-base font-bold text-foreground">
                  Accès & Email
                </h4>
              </div>
              <div className="space-y-3">
                {contactInfo.slice(2).map((info, index) => {
                  return (
                    <div key={index} className="space-y-0.5">
                      <h5 className="text-xs font-semibold text-foreground">
                        {info.title}
                      </h5>
                      <div className="space-y-0.5">
                        {info.details.map((detail, detailIndex) => (
                          <p
                            key={detailIndex}
                            className="font-mono text-xs leading-tight text-muted-foreground"
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
            <div className="fade-in-up fade-delay-08 relative overflow-hidden rounded-lg border border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 p-4 backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:bg-gradient-to-br hover:from-primary/15 hover:to-primary/10 md:col-span-1 lg:col-span-1">
              <div className="mb-3 flex items-center gap-2">
                <div className="rounded-full bg-primary/20 p-1.5">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <h4 className="font-mono text-base font-bold text-primary">
                  Bureau local
                </h4>
              </div>
              <div>
                <h5 className="mb-1.5 text-sm font-bold text-foreground">
                  Île-de-France
                </h5>
                <p className="mb-3 font-mono text-xs leading-tight text-muted-foreground">
                  Équipe française basée à Montigny-le-Bretonneux, proche de
                  Guyancourt
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 font-mono text-xs text-primary"
                  >
                    Intervention sur site
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 font-mono text-xs text-primary"
                  >
                    Support local
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 font-mono text-xs text-primary"
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
                  <div className="rounded-full bg-primary/10 p-2">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle>Nous contacter</CardTitle>
                </div>
                <p className="font-mono text-sm text-muted-foreground">
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
                      <span className="text-xs font-normal text-muted-foreground">
                        (minimum 10 caractères)
                      </span>
                    </label>
                    <Textarea
                      id="contact-message"
                      name="message"
                      placeholder="Décrivez votre demande (minimum 10 caractères)..."
                      className="min-h-[120px] bg-background/50"
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
                        <Mail className="mr-2 h-4 w-4" />
                        Envoyer le message
                      </>
                    )}
                  </Button>
                </form>

                {contactForm.response && (
                  <div
                    className={`mt-4 rounded-lg p-4 ${
                      contactForm.response.success
                        ? 'border border-primary/20 bg-primary/10 text-primary'
                        : 'border border-destructive/20 bg-destructive/10 text-destructive'
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
