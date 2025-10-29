import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowRight,
  CheckCircle,
  Clock,
  Gift,
  Lock,
  Mail,
  Rocket,
  Shield,
  Sparkles,
  Zap,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const GetStarted = () => {
  const navigate = useNavigate()
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

  const plans = [
    {
      id: 'starter' as const,
      name: 'Starter',
      price: '29€',
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
      price: '79€',
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
      title: '14 jours gratuits',
      description: 'Essayez toutes les fonctionnalités sans engagement',
    },
    {
      icon: Lock,
      title: 'Sans carte bancaire',
      description: 'Aucune information de paiement requise pour démarrer',
    },
    {
      icon: Zap,
      title: 'Activation instantanée',
      description: 'Accédez à votre compte en moins de 2 minutes',
    },
    {
      icon: Shield,
      title: 'Données sécurisées',
      description: 'Conformité RGPD et hébergement en France',
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

    // TODO: Implement actual trial signup logic
    // For now, simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Redirect to checkout for subscription setup
    navigate(`/checkout?plan=${selectedPlan}`)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/50">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/6 w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-primary-glow rounded-full animate-pulse"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge
              variant="outline"
              className="mb-6 border-primary/40 text-primary"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              14 jours d'essai gratuit
            </Badge>

            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
              Démarrez avec <span className="text-gradient">WorkFlowAI</span>
            </h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Essayez gratuitement pendant 14 jours. Aucune carte bancaire
              requise. Annulation possible à tout moment.
            </p>

            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>Sans engagement</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>Configuration en 2 min</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>Support inclus</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trial Benefits */}
      <section className="py-12 bg-card/20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {trialBenefits.map((benefit, index) => (
              <Card
                key={index}
                className="bg-card/60 backdrop-blur-sm border-primary/20 text-center"
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold mb-2">{benefit.title}</h3>
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
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Plan Selection & Form */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold text-foreground mb-4">
                    Choisissez votre plan
                  </h2>
                  <p className="text-muted-foreground">
                    Tous les plans incluent 14 jours d'essai gratuit
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
                    <TabsContent key={plan.id} value={plan.id} className="mt-6">
                      <Card className="bg-card/60 backdrop-blur-sm border-primary/20">
                        <CardContent className="p-6">
                          <div className="flex items-baseline justify-between mb-4">
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
                                <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
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
                <Card className="bg-card/60 backdrop-blur-sm border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <Rocket className="w-6 h-6 text-primary" />
                      Créez votre compte
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Prénom *
                          </label>
                          <Input
                            name="firstName"
                            placeholder="Jean"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className="bg-background/50"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Nom *
                          </label>
                          <Input
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
                        <label className="text-sm font-medium mb-2 block">
                          Email professionnel *
                        </label>
                        <Input
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
                        <label className="text-sm font-medium mb-2 block">
                          Entreprise *
                        </label>
                        <Input
                          name="company"
                          placeholder="Nom de votre entreprise"
                          value={formData.company}
                          onChange={handleInputChange}
                          className="bg-background/50"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Téléphone (optionnel)
                        </label>
                        <Input
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
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Création en cours...
                          </>
                        ) : (
                          <>
                            <Rocket className="w-4 h-4 mr-2" />
                            Démarrer l'essai gratuit
                          </>
                        )}
                      </Button>

                      <p className="text-xs text-muted-foreground text-center">
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
                <Card className="bg-card/60 backdrop-blur-sm border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <Clock className="w-6 h-6 text-primary" />
                      Processus d'onboarding
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-4">
                      {onboardingSteps.map((step, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-primary text-sm">
                            {step.step}
                          </div>
                          <div>
                            <h4 className="font-semibold mb-1">{step.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {step.description}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200 dark:border-green-800">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <Gift className="w-8 h-8 text-green-600 dark:text-green-400 flex-shrink-0" />
                      <div>
                        <h3 className="font-bold text-lg mb-2">
                          14 jours pour tout essayer
                        </h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                            Accès complet à toutes les fonctionnalités
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                            Support technique inclus
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                            Annulation en un clic
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                            Aucun engagement
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card/60 backdrop-blur-sm border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <Mail className="w-6 h-6 text-primary flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold mb-2">
                          Besoin d'aide pour démarrer ?
                        </h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          Notre équipe est disponible pour vous accompagner dans
                          la configuration de votre compte.
                        </p>
                        <div className="flex flex-col gap-2">
                          <Button asChild variant="outline" size="sm">
                            <Link to="/demo">
                              Demander une démo
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                          </Button>
                          <Button asChild variant="outline" size="sm">
                            <Link to="/contact">
                              Contacter le support
                              <ArrowRight className="w-4 h-4 ml-2" />
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
      <section className="py-16 bg-card/20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Questions fréquentes
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-card/60 backdrop-blur-sm border-primary/10">
                <CardContent className="p-6">
                  <h4 className="font-semibold mb-2">
                    Puis-je changer de plan pendant l'essai ?
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Oui, vous pouvez passer à un plan supérieur ou inférieur à
                    tout moment pendant votre période d'essai.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card/60 backdrop-blur-sm border-primary/10">
                <CardContent className="p-6">
                  <h4 className="font-semibold mb-2">
                    Que se passe-t-il après les 14 jours ?
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Nous vous demanderons vos informations de paiement. Si vous
                    ne souhaitez pas continuer, votre compte sera simplement
                    désactivé.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card/60 backdrop-blur-sm border-primary/10">
                <CardContent className="p-6">
                  <h4 className="font-semibold mb-2">
                    Puis-je importer mes données existantes ?
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Oui, nous proposons des outils d'importation pour la plupart
                    des formats courants et pouvons vous aider à migrer vos
                    données.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card/60 backdrop-blur-sm border-primary/10">
                <CardContent className="p-6">
                  <h4 className="font-semibold mb-2">
                    Le support est-il inclus pendant l'essai ?
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Absolument ! Vous bénéficiez du même support que nos clients
                    payants pendant toute la période d'essai.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default GetStarted
