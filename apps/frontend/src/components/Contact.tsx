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
import { useCookieConsent } from '@/hooks/useCookieConsent'
import { useDemoForm } from '@/hooks/useDemoForm'
import {
  trackContactSubmission,
  trackDemoSubmission,
} from '@/utils/facebookEvents'
import Building from '~icons/lucide/building'
import Calendar from '~icons/lucide/calendar'
import Car from '~icons/lucide/car'
import CheckCircle from '~icons/lucide/check-circle'
import Mail from '~icons/lucide/mail'
import MapPin from '~icons/lucide/map-pin'
import Phone from '~icons/lucide/phone'
import XCircle from '~icons/lucide/x-circle'

const Contact = () => {
  const demoForm = useDemoForm()
  const contactForm = useContactForm()
  const { hasAnalyticsConsent, hasMarketingConsent } = useCookieConsent()
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
  const [demoValidation, setDemoValidation] = useState({
    firstName: { valid: false, message: '' },
    lastName: { valid: false, message: '' },
    email: { valid: false, message: '' },
    needs: { valid: false, message: '' },
  })
  const [contactValidation, setContactValidation] = useState({
    firstName: { valid: false, message: '' },
    lastName: { valid: false, message: '' },
    email: { valid: false, message: '' },
    message: { valid: false, message: '' },
  })
  const demoCaptchaRef = useRef<CaptchaHandle | null>(null)
  const contactCaptchaRef = useRef<CaptchaHandle | null>(null)

  // Analytics tracking state
  const [demoFormStarted, setDemoFormStarted] = useState(false)
  const [contactFormStarted, setContactFormStarted] = useState(false)
  const [demoFormSubmitted, setDemoFormSubmitted] = useState(false)
  const [contactFormSubmitted, setContactFormSubmitted] = useState(false)
  const demoFormStartTracked = useRef(false)
  const contactFormStartTracked = useRef(false)

  const trackWithConsent = (
    eventName: string,
    data: Record<string, unknown>
  ) => {
    if (!hasAnalyticsConsent) return
    try {
      track(eventName, data)
    } catch {
      // Ignore analytics failures
    }
  }

  // Track demo form start
  const handleDemoFormStart = () => {
    if (!demoFormStartTracked.current) {
      setDemoFormStarted(true)
      demoFormStartTracked.current = true
      trackWithConsent('demo_form_started', {
        timestamp: new Date().toISOString(),
      })
    }
  }

  // Track contact form start
  const handleContactFormStart = () => {
    if (!contactFormStartTracked.current) {
      setContactFormStarted(true)
      contactFormStartTracked.current = true
      trackWithConsent('contact_form_started', {
        timestamp: new Date().toISOString(),
      })
    }
  }

  // Track form abandonment when user leaves page
  useEffect(() => {
    const handlePageHide = () => {
      // Track demo form abandonment
      if (demoFormStarted && !demoFormSubmitted) {
        trackWithConsent('demo_form_abandoned', {
          timestamp: new Date().toISOString(),
        })
      }
      // Track contact form abandonment
      if (contactFormStarted && !contactFormSubmitted) {
        trackWithConsent('contact_form_abandoned', {
          timestamp: new Date().toISOString(),
        })
      }
    }

    window.addEventListener('pagehide', handlePageHide)
    return () => window.removeEventListener('pagehide', handlePageHide)
  }, [
    demoFormStarted,
    demoFormSubmitted,
    contactFormStarted,
    contactFormSubmitted,
    hasAnalyticsConsent,
  ])

  // Validation helpers
  const validateEmail = (
    email: string
  ): { valid: boolean; message: string } => {
    if (!email.trim()) {
      return { valid: false, message: "L'email est requis" }
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return {
        valid: false,
        message: 'Veuillez entrer une adresse email valide',
      }
    }
    return { valid: true, message: '' }
  }

  const validateName = (name: string): { valid: boolean; message: string } => {
    if (!name.trim()) {
      return { valid: false, message: 'Ce champ est requis' }
    }
    if (name.length < 2) {
      return {
        valid: false,
        message: 'Le nom doit contenir au moins 2 caractères',
      }
    }
    return { valid: true, message: '' }
  }

  const validateMessage = (
    message: string,
    minLength = 10
  ): { valid: boolean; message: string } => {
    if (!message.trim()) {
      return { valid: false, message: 'Ce champ est requis' }
    }
    if (message.length < minLength) {
      return { valid: false, message: `Minimum ${minLength} caractères requis` }
    }
    if (message.length > 5000) {
      return { valid: false, message: 'Maximum 5000 caractères autorisés' }
    }
    return { valid: true, message: '' }
  }

  const ValidationIcon = ({ valid }: { valid: boolean }) => {
    if (valid) {
      return <CheckCircle className="size-4 text-green-500" />
    }
    return <XCircle className="size-4 text-red-500" />
  }

  const ValidationMessage = ({
    message,
    valid,
    id,
  }: {
    message: string
    valid: boolean
    id?: string
  }) => {
    if (!message) return null
    return (
      <p
        id={id}
        className={`mt-1 text-sm ${valid ? 'text-green-600' : 'text-red-600'}`}
        role="status"
        aria-live="polite"
      >
        {message}
      </p>
    )
  }

  const contactInfo = [
    {
      icon: Building,
      title: 'Siège social',
      details: ['TCDynamics', '1 Rue Marguerin - 75014 - Paris'],
    },
    {
      icon: Phone,
      title: 'Téléphone',
      details: ['0686941684', 'Lundi-Vendredi 8h-19h'],
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
    <section className="relative overflow-hidden bg-gradient-to-b from-background to-background/50 py-24">
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
            className="mb-6 border-primary/40 font-mono text-primary"
          >
            Contactez-nous
          </Badge>
          <h2 className="text-gradient mb-6 text-4xl font-bold md:text-5xl">
            Prêt à automatiser ?
          </h2>
          <p className="mx-auto max-w-3xl font-mono text-xl text-muted-foreground">
            Découvrez comment TCDynamics peut transformer votre entreprise
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="mx-auto max-w-6xl">
          <div className="grid items-start gap-6 md:grid-cols-3 lg:grid-cols-3">
            {/* Hero Card - Demo Request Form (Full Width) */}
            <div className="fade-in-up fade-delay-02 relative overflow-hidden rounded-lg border-2 border-primary/40 bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8 shadow-lg shadow-primary/20 backdrop-blur-sm transition-all duration-300 hover:border-primary/60 hover:shadow-xl hover:shadow-primary/30 md:col-span-3 lg:col-span-3">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-full bg-primary/20 p-2">
                  <Calendar className="size-6 text-primary" />
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
                    <CheckCircle className="size-4 text-primary" />
                    Inclus dans votre démonstration :
                  </h4>
                  <ul className="space-y-2">
                    {benefits.map((benefit, index) => (
                      <li
                        key={index}
                        className="flex items-center font-mono text-sm"
                      >
                        <div className="mr-3 size-1.5 shrink-0 rounded-full bg-primary" />
                        <span className="text-muted-foreground">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Demo Form */}
                <form
                  className="space-y-4"
                  aria-label="Formulaire de demande de démonstration"
                  noValidate
                  onSubmit={async e => {
                    e.preventDefault()
                    if (demoForm.isSubmitting) return

                    // Validate before submission
                    const form = e.currentTarget
                    const formData = new FormData(form)
                    const firstName = formData.get('firstName') as string
                    const lastName = formData.get('lastName') as string
                    const email = formData.get('email') as string
                    const needs = formData.get('needs') as string

                    const firstNameValidation = validateName(firstName)
                    const lastNameValidation = validateName(lastName)
                    const emailValidation = validateEmail(email)
                    const needsValidation = validateMessage(needs, 10)

                    setDemoValidation({
                      firstName: firstNameValidation,
                      lastName: lastNameValidation,
                      email: emailValidation,
                      needs: needsValidation,
                    })

                    // Check if all validations pass
                    const allValid =
                      firstNameValidation.valid &&
                      lastNameValidation.valid &&
                      emailValidation.valid &&
                      needsValidation.valid

                    if (!allValid) {
                      // Focus on first invalid field
                      const firstInvalidField = Object.entries(
                        demoValidation
                      ).find(([_, validation]) => !validation.valid)

                      if (firstInvalidField) {
                        const fieldId = `demo-${firstInvalidField[0]}`
                        const fieldElement = document.getElementById(fieldId)
                        if (fieldElement) {
                          fieldElement.focus()
                          fieldElement.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center',
                          })
                        }
                      }
                      return
                    }

                    const company = formData.get('company') as string
                    const data = {
                      name: `${firstName} ${lastName}`.trim(),
                      email,
                      phone: formData.get('phone') as string,
                      company,
                      companySize: formData.get('employees') as string,
                      businessNeeds: needs,
                      captchaToken: demoCaptchaToken,
                    }

                    const result = await demoForm.submitForm(data)
                    if (result.success) {
                      setDemoFormSubmitted(true)
                      form.reset()
                      setDemoUserData({ email, company })
                      setShowDemoFeedback(true)
                      setDemoCaptchaToken(undefined)
                      setDemoValidation({
                        firstName: { valid: false, message: '' },
                        lastName: { valid: false, message: '' },
                        email: { valid: false, message: '' },
                        needs: { valid: false, message: '' },
                      })
                      demoCaptchaRef.current?.reset()
                      setTimeout(() => demoForm.clearResponse(), 5000)
                      if (hasMarketingConsent) {
                        trackDemoSubmission()
                      }
                    }
                    // On failure, demoForm.response is already set by useFormSubmit
                  }}
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="demo-firstName"
                        className="mb-2 block text-sm font-medium"
                      >
                        Prénom *
                      </label>
                      <div className="relative">
                        <Input
                          id="demo-firstName"
                          name="firstName"
                          placeholder="Jean"
                          className={`bg-background/50 ${
                            demoValidation.firstName.message
                              ? 'border-red-500'
                              : ''
                          }`}
                          required
                          aria-required="true"
                          aria-invalid={
                            demoValidation.firstName.message ? 'true' : 'false'
                          }
                          aria-describedby={
                            demoValidation.firstName.message
                              ? 'demo-firstName-error'
                              : undefined
                          }
                          onFocus={handleDemoFormStart}
                          onChange={e => {
                            const validation = validateName(e.target.value)
                            setDemoValidation(prev => ({
                              ...prev,
                              firstName: validation,
                            }))
                          }}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <ValidationIcon
                            valid={demoValidation.firstName.valid}
                          />
                        </div>
                      </div>
                      <ValidationMessage
                        id="demo-firstName-error"
                        message={demoValidation.firstName.message}
                        valid={demoValidation.firstName.valid}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="demo-lastName"
                        className="mb-2 block text-sm font-medium"
                      >
                        Nom *
                      </label>
                      <div className="relative">
                        <Input
                          id="demo-lastName"
                          name="lastName"
                          placeholder="Dupont"
                          className={`bg-background/50 ${
                            demoValidation.lastName.message
                              ? 'border-red-500'
                              : ''
                          }`}
                          required
                          aria-required="true"
                          aria-invalid={
                            demoValidation.lastName.message ? 'true' : 'false'
                          }
                          aria-describedby={
                            demoValidation.lastName.message
                              ? 'demo-lastName-error'
                              : undefined
                          }
                          onChange={e => {
                            const validation = validateName(e.target.value)
                            setDemoValidation(prev => ({
                              ...prev,
                              lastName: validation,
                            }))
                          }}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <ValidationIcon
                            valid={demoValidation.lastName.valid}
                          />
                        </div>
                      </div>
                      <ValidationMessage
                        id="demo-lastName-error"
                        message={demoValidation.lastName.message}
                        valid={demoValidation.lastName.valid}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="demo-email"
                      className="mb-2 block text-sm font-medium"
                    >
                      Email professionnel *
                    </label>
                    <div className="relative">
                      <Input
                        id="demo-email"
                        name="email"
                        type="email"
                        placeholder="jean.dupont@entreprise.fr"
                        className={`bg-background/50 ${
                          demoValidation.email.message ? 'border-red-500' : ''
                        }`}
                        required
                        aria-required="true"
                        aria-invalid={
                          demoValidation.email.message ? 'true' : 'false'
                        }
                        aria-describedby={
                          demoValidation.email.message
                            ? 'demo-email-error'
                            : undefined
                        }
                        onChange={e => {
                          const validation = validateEmail(e.target.value)
                          setDemoValidation(prev => ({
                            ...prev,
                            email: validation,
                          }))
                        }}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <ValidationIcon valid={demoValidation.email.valid} />
                      </div>
                    </div>
                    <ValidationMessage
                      id="demo-email-error"
                      message={demoValidation.email.message}
                      valid={demoValidation.email.valid}
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
                      htmlFor="demo-needs"
                      className="mb-2 block text-sm font-medium"
                    >
                      Besoins spécifiques *{' '}
                      <span className="text-xs font-normal text-muted-foreground">
                        (minimum 10 caractères)
                      </span>
                    </label>
                    <div className="relative">
                      <Textarea
                        id="demo-needs"
                        name="needs"
                        placeholder="Décrivez brièvement vos processus à automatiser (minimum 10 caractères)..."
                        className={`min-h-[100px] bg-background/50 ${
                          demoValidation.needs.message ? 'border-red-500' : ''
                        }`}
                        required
                        minLength={10}
                        maxLength={5000}
                        aria-required="true"
                        aria-invalid={
                          demoValidation.needs.message ? 'true' : 'false'
                        }
                        aria-describedby={
                          demoValidation.needs.message
                            ? 'demo-needs-error'
                            : undefined
                        }
                        onChange={e => {
                          const validation = validateMessage(e.target.value, 10)
                          setDemoValidation(prev => ({
                            ...prev,
                            needs: validation,
                          }))
                        }}
                      />
                      <div className="absolute right-3 top-3">
                        <ValidationIcon valid={demoValidation.needs.valid} />
                      </div>
                    </div>
                    <ValidationMessage
                      id="demo-needs-error"
                      message={demoValidation.needs.message}
                      valid={demoValidation.needs.valid}
                    />
                    <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                      <span>
                        {demoValidation.needs.valid
                          ? 'Validé ✓'
                          : 'En cours de validation...'}
                      </span>
                      <span aria-live="polite">
                        {document.getElementById('demo-needs')?.value?.length ||
                          0}
                        /5000 caractères
                      </span>
                    </div>
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
                      ? 'border border-primary/20 bg-primary/10 text-primary'
                      : 'border border-destructive/20 bg-destructive/10 text-destructive'
                  }`}
                >
                  {demoForm.response.message}
                  {demoForm.response.errors &&
                    demoForm.response.errors.filter(
                      e => e !== demoForm.response?.message
                    ).length > 0 && (
                      <ul className="mt-2 text-sm">
                        {demoForm.response.errors
                          .filter(e => e !== demoForm.response?.message)
                          .map((error, index) => (
                            <li key={index} className="flex items-start">
                              <span className="mr-2" aria-hidden="true">
                                •
                              </span>
                              {error}
                            </li>
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
                  <Building className="size-4 text-primary" />
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
                  <Mail className="size-4 text-primary" />
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
                  <MapPin className="size-4 text-primary" />
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
                    <Mail className="size-5 text-primary" />
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
                  noValidate
                  onSubmit={async e => {
                    e.preventDefault()
                    if (contactForm.isSubmitting) return

                    // Validate before submission
                    const form = e.currentTarget
                    const formData = new FormData(form)
                    const firstName = formData.get('firstName') as string
                    const lastName = formData.get('lastName') as string
                    const email = formData.get('email') as string
                    const message = formData.get('message') as string

                    const firstNameValidation = validateName(firstName)
                    const lastNameValidation = validateName(lastName)
                    const emailValidation = validateEmail(email)
                    const messageValidation = validateMessage(message, 10)

                    setContactValidation({
                      firstName: firstNameValidation,
                      lastName: lastNameValidation,
                      email: emailValidation,
                      message: messageValidation,
                    })

                    // Check if all validations pass
                    const allValid =
                      firstNameValidation.valid &&
                      lastNameValidation.valid &&
                      emailValidation.valid &&
                      messageValidation.valid

                    if (!allValid) {
                      // Focus on first invalid field
                      const firstInvalidField = Object.entries(
                        contactValidation
                      ).find(([_, validation]) => !validation.valid)

                      if (firstInvalidField) {
                        const fieldId = `contact-${firstInvalidField[0]}`
                        const fieldElement = document.getElementById(fieldId)
                        if (fieldElement) {
                          fieldElement.focus()
                          fieldElement.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center',
                          })
                        }
                      }
                      return
                    }

                    const company = formData.get('company') as string
                    const data = {
                      name: `${firstName} ${lastName}`.trim(),
                      email,
                      phone: formData.get('phone') as string,
                      company,
                      message,
                      captchaToken: contactCaptchaToken,
                    }

                    const result = await contactForm.submitForm(data)
                    if (result.success) {
                      setContactFormSubmitted(true)
                      form.reset()
                      setContactUserData({ email, company })
                      setShowContactFeedback(true)
                      setContactCaptchaToken(undefined)
                      setContactValidation({
                        firstName: { valid: false, message: '' },
                        lastName: { valid: false, message: '' },
                        email: { valid: false, message: '' },
                        message: { valid: false, message: '' },
                      })
                      contactCaptchaRef.current?.reset()
                      setTimeout(() => contactForm.clearResponse(), 5000)
                      if (hasMarketingConsent) {
                        trackContactSubmission()
                      }
                    }
                    // On failure, contactForm.response is already set by useFormSubmit
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
                      <div className="relative">
                        <Input
                          id="contact-firstName"
                          name="firstName"
                          placeholder="Prénom"
                          className={`bg-background/50 ${
                            contactValidation.firstName.message
                              ? 'border-red-500'
                              : ''
                          }`}
                          required
                          aria-required="true"
                          aria-invalid={
                            contactValidation.firstName.message
                              ? 'true'
                              : 'false'
                          }
                          aria-describedby={
                            contactValidation.firstName.message
                              ? 'contact-firstName-error'
                              : undefined
                          }
                          onFocus={handleContactFormStart}
                          onChange={e => {
                            const validation = validateName(e.target.value)
                            setContactValidation(prev => ({
                              ...prev,
                              firstName: validation,
                            }))
                          }}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <ValidationIcon
                            valid={contactValidation.firstName.valid}
                          />
                        </div>
                      </div>
                      <ValidationMessage
                        id="contact-firstName-error"
                        message={contactValidation.firstName.message}
                        valid={contactValidation.firstName.valid}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="contact-lastName"
                        className="mb-2 block text-sm font-medium"
                      >
                        Nom *
                      </label>
                      <div className="relative">
                        <Input
                          id="contact-lastName"
                          name="lastName"
                          placeholder="Nom"
                          className={`bg-background/50 ${
                            contactValidation.lastName.message
                              ? 'border-red-500'
                              : ''
                          }`}
                          required
                          aria-required="true"
                          aria-invalid={
                            contactValidation.lastName.message
                              ? 'true'
                              : 'false'
                          }
                          aria-describedby={
                            contactValidation.lastName.message
                              ? 'contact-lastName-error'
                              : undefined
                          }
                          onChange={e => {
                            const validation = validateName(e.target.value)
                            setContactValidation(prev => ({
                              ...prev,
                              lastName: validation,
                            }))
                          }}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <ValidationIcon
                            valid={contactValidation.lastName.valid}
                          />
                        </div>
                      </div>
                      <ValidationMessage
                        id="contact-lastName-error"
                        message={contactValidation.lastName.message}
                        valid={contactValidation.lastName.valid}
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
                    <div className="relative">
                      <Input
                        id="contact-email"
                        name="email"
                        type="email"
                        placeholder="votre@email.fr"
                        className={`bg-background/50 ${
                          contactValidation.email.message
                            ? 'border-red-500'
                            : ''
                        }`}
                        required
                        aria-required="true"
                        aria-invalid={
                          contactValidation.email.message ? 'true' : 'false'
                        }
                        aria-describedby={
                          contactValidation.email.message
                            ? 'contact-email-error'
                            : undefined
                        }
                        onChange={e => {
                          const validation = validateEmail(e.target.value)
                          setContactValidation(prev => ({
                            ...prev,
                            email: validation,
                          }))
                        }}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <ValidationIcon valid={contactValidation.email.valid} />
                      </div>
                    </div>
                    <ValidationMessage
                      id="contact-email-error"
                      message={contactValidation.email.message}
                      valid={contactValidation.email.valid}
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
                    <div className="relative">
                      <Textarea
                        id="contact-message"
                        name="message"
                        placeholder="Décrivez votre demande (minimum 10 caractères)..."
                        className={`min-h-[120px] bg-background/50 ${
                          contactValidation.message.message
                            ? 'border-red-500'
                            : ''
                        }`}
                        required
                        minLength={10}
                        maxLength={5000}
                        aria-required="true"
                        aria-invalid={
                          contactValidation.message.message ? 'true' : 'false'
                        }
                        aria-describedby={
                          contactValidation.message.message
                            ? 'contact-message-error'
                            : undefined
                        }
                        onChange={e => {
                          const validation = validateMessage(e.target.value, 10)
                          setContactValidation(prev => ({
                            ...prev,
                            message: validation,
                          }))
                        }}
                      />
                      <div className="absolute right-3 top-3">
                        <ValidationIcon
                          valid={contactValidation.message.valid}
                        />
                      </div>
                    </div>
                    <ValidationMessage
                      id="contact-message-error"
                      message={contactValidation.message.message}
                      valid={contactValidation.message.valid}
                    />
                    <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                      <span>
                        {contactValidation.message.valid
                          ? 'Validé ✓'
                          : 'En cours de validation...'}
                      </span>
                      <span aria-live="polite">
                        {document.getElementById('contact-message')?.value
                          ?.length || 0}
                        /5000 caractères
                      </span>
                    </div>
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
                    role="alert"
                    className={`mt-4 rounded-lg p-4 ${
                      contactForm.response.success
                        ? 'border border-primary/20 bg-primary/10 text-primary'
                        : 'border border-destructive/20 bg-destructive/10 text-destructive'
                    }`}
                  >
                    {contactForm.response.message}
                    {contactForm.response.errors &&
                      contactForm.response.errors.filter(
                        e => e !== contactForm.response?.message
                      ).length > 0 && (
                        <ul className="mt-2 text-sm">
                          {contactForm.response.errors
                            .filter(e => e !== contactForm.response?.message)
                            .map((error, index) => (
                              <li key={index} className="flex items-start">
                                <span className="mr-2" aria-hidden="true">
                                  •
                                </span>
                                {error}
                              </li>
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
