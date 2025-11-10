import {
  Building,
  Calendar,
  Car,
  CheckCircle,
  Clock,
  Mail,
  MapPin,
  Phone,
  Train,
  Users,
} from 'lucide-react'

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

        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2">
          {/* Demo Request Form */}
          <div className="fade-in-up fade-delay-02">
            <Card className="border-primary/20 bg-card/60 backdrop-blur-sm transition-all duration-300 hover:border-primary/40">
              <CardHeader>
                <div className="mb-2 flex items-center gap-3">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">Réserver une démo</CardTitle>
                </div>
                <p className="font-mono text-sm text-muted-foreground">
                  Démonstration personnalisée avec vos données
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Benefits */}
                <div className="rounded-lg border border-primary/10 bg-primary/5 p-4">
                  <h4 className="mb-3 flex items-center gap-2 font-semibold">
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
                    const formData = new FormData(e.currentTarget)
                    const firstName = formData.get('firstName') as string
                    const lastName = formData.get('lastName') as string
                    const data = {
                      name: `${firstName} ${lastName}`.trim(),
                      email: formData.get('email') as string,
                      phone: formData.get('phone') as string,
                      company: formData.get('company') as string,
                      employeeCount: formData.get('employees') as string,
                      message: formData.get('needs') as string,
                    }

                    const result = await demoForm.submitForm(data)
                    if (result.success) {
                      e.currentTarget.reset()
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
                      Besoins spécifiques
                    </label>
                    <Textarea
                      id="needs"
                      name="needs"
                      placeholder="Décrivez brièvement vos processus à automatiser..."
                      className="min-h-[100px] bg-background/50"
                    />
                  </div>

                  <Button
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

                <p className="text-center font-mono text-xs text-muted-foreground">
                  Démonstration de 45min • Sans engagement • Réponse sous 2h
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information & General Form */}
          <div className="space-y-8">
            {/* Contact Info Cards */}
            <div className="fade-in-up fade-delay-04 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {contactInfo.map((info, index) => {
                const IconComponent = info.icon
                return (
                  <Card
                    key={index}
                    className="border-primary/10 bg-card/40 backdrop-blur-sm transition-all duration-300 hover:border-primary/30"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 rounded-full bg-primary/10 p-2">
                          <IconComponent className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="mb-2 text-sm font-semibold">
                            {info.title}
                          </h4>
                          <div className="space-y-1">
                            {info.details.map((detail, detailIndex) => (
                              <p
                                key={detailIndex}
                                className="font-mono text-xs text-muted-foreground"
                              >
                                {detail}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* General Contact Form */}
            <Card className="fade-in-up fade-delay-06 border-primary/20 bg-card/60 backdrop-blur-sm">
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
                    const formData = new FormData(e.currentTarget)
                    const data = {
                      name: `${formData.get('firstName')} ${formData.get('lastName')}`.trim(),
                      email: formData.get('email') as string,
                      phone: formData.get('phone') as string,
                      company: formData.get('company') as string,
                      message: formData.get('message') as string,
                    }

                    const result = await contactForm.submitForm(data)
                    if (result.success) {
                      e.currentTarget.reset()
                      setTimeout(() => contactForm.clearResponse(), 5000)
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
                        placeholder="Prénom"
                        className="bg-background/50"
                        required
                        aria-required="true"
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
                        placeholder="Nom"
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
                      Email *
                    </label>
                    <Input
                      id="email"
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
                        htmlFor="phone"
                        className="mb-2 block text-sm font-medium"
                      >
                        Téléphone
                      </label>
                      <Input
                        id="phone"
                        name="phone"
                        placeholder="01 23 45 67 89"
                        className="bg-background/50"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="company"
                        className="mb-2 block text-sm font-medium"
                      >
                        Entreprise
                      </label>
                      <Input
                        id="company"
                        name="company"
                        placeholder="Nom de votre entreprise"
                        className="bg-background/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="mb-2 block text-sm font-medium"
                    >
                      Message *
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Décrivez votre demande..."
                      className="min-h-[120px] bg-background/50"
                      required
                      aria-required="true"
                    />
                  </div>

                  <Button
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

            {/* Local Office Highlight */}
            <Card className="fade-in-up fade-delay-08 border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-primary/20 p-3">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="mb-2 text-lg font-bold">
                      Bureau local Île-de-France
                    </h3>
                    <p className="mb-3 font-mono text-sm text-muted-foreground">
                      Équipe française basée à Montigny-le-Bretonneux, proche de
                      Guyancourt
                    </p>
                    <div className="flex flex-wrap gap-2">
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
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Trust Indicators */}
        <div className="fade-in-up fade-delay-10 mt-16 text-center">
          <div className="flex flex-wrap justify-center gap-6 font-mono text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span>Réponse sous 2h</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span>Équipe française</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span>RGPD conforme</span>
            </div>
            <div className="flex items-center gap-2">
              <Train className="h-4 w-4 text-primary" />
              <span>Accès RER C</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Contact
