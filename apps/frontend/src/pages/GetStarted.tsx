import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { HelpBubble } from '@/components/app/HelpBubble'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useProactiveSupport } from '@/hooks/useProactiveSupport'
import ArrowRight from '~icons/lucide/arrow-right'
import CheckCircle from '~icons/lucide/check-circle'
import Clock from '~icons/lucide/clock'
import Gift from '~icons/lucide/gift'
import Lock from '~icons/lucide/lock'
import Mail from '~icons/lucide/mail'
import Rocket from '~icons/lucide/rocket'
import Shield from '~icons/lucide/shield'
import Sparkles from '~icons/lucide/sparkles'
import Zap from '~icons/lucide/zap'

const GetStarted = () => {
  const navigate = useNavigate()
  const demoLink = import.meta.env.VITE_DEMO_URL || '/demo'
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'professional'>(
    'starter'
  )
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    phone: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Proactive support for onboarding assistance
  const { struggle, dismissHelp, handleResourceClick, handleFeedback } =
    useProactiveSupport({
      userId: formData.email || undefined, // Use email as user ID during onboarding
      disabled: !formData.email, // Only enable after email entered
    })

  const plans = [
    {
      id: 'starter' as const,
      name: 'Starter',
      price: '29$',
      period: '/mois',
      description: 'Parfait pour commencer',
      features: [
        '50 documents/mois',
        'Chatbot basique',
        'Tableau de bord',
        'Support email',
      ],
    },
    {
      id: 'professional' as const,
      name: 'Professional',
      price: '79$',
      period: '/mois',
      description: 'Pour aller plus loin',
      features: [
        '500 documents/mois',
        'Chatbot IA avancé',
        'Tableau personnalisé',
        'Support prioritaire',
      ],
      popular: true,
    },
  ]

  const trialBenefits = [
    {
      icon: Gift,
      title: 'Démo guidée',
      description: 'Parcours personnalisé avec un expert produit',
    },
    {
      icon: Lock,
      title: 'Sans carte bancaire',
      description: 'Activation après démo uniquement',
    },
    {
      icon: Zap,
      title: 'Mise en place rapide',
      description: 'Nous configurons un premier workflow pendant la démo',
    },
    {
      icon: Shield,
      title: 'Données sécurisées',
      description: 'RGPD + hébergement France, revues sécurité en démo',
    },
  ]

  const onboardingSteps = [
    {
      step: 1,
      title: 'Créez votre compte',
      description: 'Remplissez le formulaire en 30 secondes',
    },
    {
      step: 2,
      title: 'Configurez votre espace',
      description: 'Personnalisez vos préférences et paramètres',
    },
    {
      step: 3,
      title: 'Importez vos données',
      description: 'Connectez vos outils existants ou uploadez vos fichiers',
    },
    {
      step: 4,
      title: 'Commencez à automatiser',
      description: 'Lancez votre premier workflow en quelques clics',
    },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    if (demoLink.startsWith('http')) {
      window.location.href = demoLink
      return
    }
    navigate(`${demoLink}?plan=${selectedPlan}`)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <>
      {/* Proactive Support Help Bubble */}
      {struggle && (
        <HelpBubble
          struggle={struggle}
          onDismiss={dismissHelp}
          onResourceClick={handleResourceClick}
          onFeedback={handleFeedback}
        />
      )}

      <div className="min-h-screen bg-gradient-to-b from-background to-background/50">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="left-1/6 absolute top-1/4 size-2 animate-pulse rounded-full bg-primary"></div>
            <div className="absolute right-1/4 top-1/2 size-1 animate-pulse rounded-full bg-primary-glow"></div>
          </div>

          <div className="container relative z-10 mx-auto px-6">
            <div className="mx-auto max-w-4xl text-center">
              <Badge
                variant="outline"
                className="mb-6 border-primary/40 text-primary"
              >
                <Sparkles className="mr-1 size-3" />
                Démarrage via une démo guidée
              </Badge>

              <h1 className="mb-6 text-4xl font-bold text-foreground lg:text-6xl">
                Activez TCDynamics via{' '}
                <span className="text-gradient">une démo personnalisée</span>
              </h1>

              <p className="mx-auto mb-8 max-w-2xl text-xl text-muted-foreground">
                Nous présentons la configuration, la sécurité et le déploiement
                pendant une session démo. L’activation se fait après validation,
                sans carte bancaire à ce stade.
              </p>

              <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-primary" />
                  <span>Sans paiement à ce stade</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-primary" />
                  <span>Configuration guidée</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-primary" />
                  <span>Support inclus</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trial Benefits */}
        <section className="bg-card/20 py-12">
          <div className="container mx-auto px-6">
            <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-4">
              {trialBenefits.map((benefit, index) => (
                <Card
                  key={index}
                  className="border-primary/20 bg-card/60 text-center backdrop-blur-sm"
                >
                  <CardContent className="p-6">
                    <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-lg bg-primary/20">
                      <benefit.icon className="size-6 text-primary" />
                    </div>
                    <h3 className="mb-2 font-bold">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Sign Up Form */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="mx-auto max-w-6xl">
              <div className="grid gap-12 lg:grid-cols-2">
                {/* Plan Selection & Form */}
                <div className="space-y-6">
                  <div>
                    <h2 className="mb-4 text-3xl font-bold text-foreground">
                      Choisissez votre plan pour la démo
                    </h2>
                    <p className="text-muted-foreground">
                      Nous préparons un parcours adapté à votre plan avant la
                      session.
                    </p>
                  </div>

                  {/* Plan Tabs */}
                  <Tabs
                    value={selectedPlan}
                    onValueChange={value =>
                      setSelectedPlan(value as 'starter' | 'professional')
                    }
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      {plans.map(plan => (
                        <TabsTrigger key={plan.id} value={plan.id}>
                          {plan.name}
                          {plan.popular && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              (Populaire)
                            </Badge>
                          )}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {plans.map(plan => (
                      <TabsContent
                        key={plan.id}
                        value={plan.id}
                        className="mt-6"
                      >
                        <Card className="border-primary/20 bg-card/60 backdrop-blur-sm">
                          <CardContent className="p-6">
                            <div className="mb-4 flex items-baseline justify-between">
                              <div>
                                <h3 className="text-2xl font-bold">
                                  {plan.name}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {plan.description}
                                </p>
                              </div>
                              <div className="text-right">
                                <span className="text-3xl font-bold text-primary">
                                  {plan.price}
                                </span>
                                <span className="text-muted-foreground">
                                  {plan.period}
                                </span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              {plan.features.map((feature, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-2"
                                >
                                  <CheckCircle className="size-4 shrink-0 text-primary" />
                                  <span className="text-sm">{feature}</span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    ))}
                  </Tabs>

                  {/* Sign Up Form */}
                  <Card className="border-primary/20 bg-card/60 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-2xl">
                        <Rocket className="size-6 text-primary" />
                        Créez votre compte
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label
                              htmlFor="getstarted-firstName"
                              className="mb-2 block text-sm font-medium"
                            >
                              Prénom *
                            </label>
                            <Input
                              id="getstarted-firstName"
                              name="firstName"
                              placeholder="Jean"
                              value={formData.firstName}
                              onChange={handleInputChange}
                              className="bg-background/50"
                              required
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="getstarted-lastName"
                              className="mb-2 block text-sm font-medium"
                            >
                              Nom *
                            </label>
                            <Input
                              id="getstarted-lastName"
                              name="lastName"
                              placeholder="Dupont"
                              value={formData.lastName}
                              onChange={handleInputChange}
                              className="bg-background/50"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label
                            htmlFor="getstarted-email"
                            className="mb-2 block text-sm font-medium"
                          >
                            Email professionnel *
                          </label>
                          <Input
                            id="getstarted-email"
                            name="email"
                            type="email"
                            placeholder="jean.dupont@entreprise.fr"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="bg-background/50"
                            required
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="getstarted-company"
                            className="mb-2 block text-sm font-medium"
                          >
                            Entreprise *
                          </label>
                          <Input
                            id="getstarted-company"
                            name="company"
                            placeholder="Nom de votre entreprise"
                            value={formData.company}
                            onChange={handleInputChange}
                            className="bg-background/50"
                            required
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="getstarted-phone"
                            className="mb-2 block text-sm font-medium"
                          >
                            Téléphone (optionnel)
                          </label>
                          <Input
                            id="getstarted-phone"
                            name="phone"
                            type="tel"
                            placeholder="01 23 45 67 89"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="bg-background/50"
                          />
                        </div>

                        <Button
                          type="submit"
                          className="w-full"
                          size="lg"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <div className="mr-2 size-4 animate-spin rounded-full border-b-2 border-white"></div>
                              Redirection vers la démo…
                            </>
                          ) : (
                            <>
                              <Rocket className="mr-2 size-4" />
                              Réserver la démo
                            </>
                          )}
                        </Button>

                        <p className="text-center text-xs text-muted-foreground">
                          En créant un compte, vous acceptez nos{' '}
                          <Link
                            to="/terms"
                            className="text-primary hover:underline"
                          >
                            conditions d'utilisation
                          </Link>{' '}
                          et notre{' '}
                          <Link
                            to="/privacy"
                            className="text-primary hover:underline"
                          >
                            politique de confidentialité
                          </Link>
                          .
                        </p>
                      </form>
                    </CardContent>
                  </Card>
                </div>

                {/* Onboarding Steps & Support */}
                <div className="space-y-6">
                  <Card className="border-primary/20 bg-card/60 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-2xl">
                        <Clock className="size-6 text-primary" />
                        Processus d'onboarding
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ol className="space-y-4">
                        {onboardingSteps.map((step, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                              {step.step}
                            </div>
                            <div>
                              <h4 className="mb-1 font-semibold">
                                {step.title}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {step.description}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ol>
                    </CardContent>
                  </Card>

                  <Card className="border-primary/20 bg-card/60 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3">
                        <Gift className="size-8 shrink-0 text-primary" />
                        <div>
                          <h3 className="mb-2 text-lg font-bold">
                            14 jours pour tout essayer
                          </h3>
                          <ul className="space-y-2 text-sm text-muted-foreground">
                            <li className="flex items-center gap-2">
                              <CheckCircle className="size-4 text-primary" />
                              Accès complet à toutes les fonctionnalités
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="size-4 text-primary" />
                              Support technique inclus
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="size-4 text-primary" />
                              Annulation en un clic
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="size-4 text-primary" />
                              Aucun engagement
                            </li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-primary/20 bg-card/60 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3">
                        <Mail className="size-6 shrink-0 text-primary" />
                        <div>
                          <h4 className="mb-2 font-semibold">
                            Besoin d'aide pour démarrer ?
                          </h4>
                          <p className="mb-4 text-sm text-muted-foreground">
                            Notre équipe est disponible pour vous accompagner
                            dans la configuration de votre compte.
                          </p>
                          <div className="flex flex-col gap-2">
                            <Button asChild variant="outline" size="sm">
                              <Link to="/demo">
                                Demander une démo
                                <ArrowRight className="ml-2 size-4" />
                              </Link>
                            </Button>
                            <Button asChild variant="outline" size="sm">
                              <Link to="/#contact">
                                Contacter le support
                                <ArrowRight className="ml-2 size-4" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-card/20 py-16">
          <div className="container mx-auto px-6">
            <div className="mx-auto max-w-4xl">
              <h2 className="mb-12 text-center text-3xl font-bold">
                Questions fréquentes
              </h2>

              <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-primary/10 bg-card/60 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <h4 className="mb-2 font-semibold">
                      Puis-je changer de plan pendant l'essai ?
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Oui, vous pouvez passer à un plan supérieur ou inférieur à
                      tout moment pendant votre période d'essai.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-primary/10 bg-card/60 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <h4 className="mb-2 font-semibold">
                      Que se passe-t-il après les 14 jours ?
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Nous vous demanderons vos informations de paiement. Si
                      vous ne souhaitez pas continuer, votre compte sera
                      simplement désactivé.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-primary/10 bg-card/60 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <h4 className="mb-2 font-semibold">
                      Puis-je importer mes données existantes ?
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Oui, nous proposons des outils d'importation pour la
                      plupart des formats courants et pouvons vous aider à
                      migrer vos données.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-primary/10 bg-card/60 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <h4 className="mb-2 font-semibold">
                      Le support est-il inclus pendant l'essai ?
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Absolument ! Vous bénéficiez du même support que nos
                      clients payants pendant toute la période d'essai.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

export default GetStarted
