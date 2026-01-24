import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useDemoForm } from '@/hooks/useDemoForm'
import ArrowRight from '~icons/lucide/arrow-right'
import Calendar from '~icons/lucide/calendar'
import CheckCircle from '~icons/lucide/check-circle'
import Clock from '~icons/lucide/clock'
import FileText from '~icons/lucide/file-text'
import MessageSquare from '~icons/lucide/message-square'
import Play from '~icons/lucide/play'
import Users from '~icons/lucide/users'
import Video from '~icons/lucide/video'
import Zap from '~icons/lucide/zap'


const Demo = () => {
  const demoForm = useDemoForm()

  const demoFeatures = [
    {
      icon: MessageSquare,
      title: 'Chatbot IA Conversationnel',
      description: 'Testez notre assistant intelligent en temps réel',
    },
    {
      icon: FileText,
      title: 'Traitement de Documents',
      description: 'Analysez vos documents avec notre IA de pointe',
    },
    {
      icon: Zap,
      title: 'Automatisation de Workflows',
      description: 'Découvrez comment automatiser vos processus métier',
    },
  ]

  const demoIncludes = [
    'Démonstration personnalisée de 45 minutes',
    'Analyse gratuite de vos processus actuels',
    'Devis sur mesure adapté à vos besoins',
    'Test avec vos propres données',
    'Session de questions-réponses',
    'Documentation et ressources',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/50">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="left-1/6 absolute top-1/4 h-2 w-2 animate-pulse rounded-full bg-primary"></div>
          <div className="absolute right-1/4 top-1/2 h-1 w-1 animate-pulse rounded-full bg-primary-glow"></div>
        </div>

        <div className="container relative z-10 mx-auto px-6">
          <div className="mx-auto max-w-4xl text-center">
            <Badge
              variant="outline"
              className="mb-6 border-primary/40 text-primary"
            >
              <Video className="mr-1 h-3 w-3" />
              Démonstration Interactive
            </Badge>

            <h1 className="mb-6 text-4xl font-bold text-foreground lg:text-6xl">
              Découvrez <span className="text-gradient">WorkFlowAI</span> en
              Action
            </h1>

            <p className="mx-auto mb-8 max-w-2xl text-xl text-muted-foreground">
              Voyez comment notre plateforme d'intelligence artificielle peut
              transformer votre entreprise avec une démonstration personnalisée
              et interactive.
            </p>

            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button size="lg" className="group" asChild>
                <a href="#demo-form">
                  <Calendar className="mr-2 h-4 w-4" />
                  Réserver une démo
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#demo-video">
                  <Play className="mr-2 h-4 w-4" />
                  Voir la vidéo de démo
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Features */}
      <section className="bg-card/20 py-16">
        <div className="container mx-auto px-6">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground lg:text-4xl">
              Ce que vous allez découvrir
            </h2>
            <p className="text-lg text-muted-foreground">
              Une démonstration complète de nos fonctionnalités phares
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
            {demoFeatures.map((feature, index) => (
              <Card
                key={index}
                className="border-primary/20 bg-card/60 backdrop-blur-sm transition-all hover:border-primary/40"
              >
                <CardContent className="p-6 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Video Demo Section - Placeholder */}
      <section id="demo-video" className="py-16">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-4xl">
            <Card className="border-primary/20 bg-card/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Play className="h-6 w-6 text-primary" />
                  Vidéo de Démonstration
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* TODO: Embed actual demo video when available */}
                <div className="flex aspect-video items-center justify-center rounded-lg bg-muted/30">
                  <div className="space-y-4 text-center">
                    <Video className="mx-auto h-16 w-16 text-primary/50" />
                    <div>
                      <h3 className="mb-2 text-lg font-semibold">
                        Vidéo de démonstration à venir
                      </h3>
                      <p className="max-w-md text-sm text-muted-foreground">
                        En attendant, réservez une démonstration personnalisée
                        avec notre équipe pour découvrir toutes les
                        fonctionnalités en détail.
                      </p>
                    </div>
                    <Button asChild>
                      <a href="#demo-form">
                        <Calendar className="mr-2 h-4 w-4" />
                        Réserver une démo live
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Demo Request Form */}
      <section id="demo-form" className="bg-card/20 py-16">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-12 lg:grid-cols-2">
              {/* Form */}
              <div>
                <Card className="border-primary/20 bg-card/60 backdrop-blur-sm">
                  <CardHeader>
                    <div className="mb-2 flex items-center gap-3">
                      <div className="rounded-full bg-primary/10 p-2">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-2xl">
                        Réserver votre démonstration
                      </CardTitle>
                    </div>
                    <p className="text-muted-foreground">
                      Remplissez le formulaire et notre équipe vous contactera
                      sous 2h pour planifier votre démo personnalisée
                    </p>
                  </CardHeader>
                  <CardContent>
                    <form
                      className="space-y-4"
                      onSubmit={async e => {
                        e.preventDefault()
                        const form = e.currentTarget
                        const formData = new FormData(form)
                        const firstName = formData.get('firstName') as string
                        const lastName = formData.get('lastName') as string
                        const data = {
                          name: `${firstName} ${lastName}`.trim(),
                          email: formData.get('email') as string,
                          phone: formData.get('phone') as string,
                          company: formData.get('company') as string,
                          companySize: formData.get('employees') as string,
                          businessNeeds: formData.get('needs') as string,
                        }
                        const result = await demoForm.submitForm(data)
                        if (result.success) {
                          form.reset()
                          setTimeout(() => demoForm.clearResponse(), 5000)
                        }
                      }}
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="demo-firstName"
                            className="mb-2 block text-sm font-medium"
                          >
                            Prénom *
                          </label>
                          <Input
                            id="demo-firstName"
                            name="firstName"
                            placeholder="Jean"
                            className="bg-background/50"
                            required
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="demo-lastName"
                            className="mb-2 block text-sm font-medium"
                          >
                            Nom *
                          </label>
                          <Input
                            id="demo-lastName"
                            name="lastName"
                            placeholder="Dupont"
                            className="bg-background/50"
                            required
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
                        <Input
                          id="demo-email"
                          name="email"
                          type="email"
                          placeholder="jean.dupont@entreprise.fr"
                          className="bg-background/50"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="demo-phone"
                            className="mb-2 block text-sm font-medium"
                          >
                            Téléphone
                          </label>
                          <Input
                            id="demo-phone"
                            name="phone"
                            type="tel"
                            placeholder="01 23 45 67 89"
                            className="bg-background/50"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="demo-employees"
                            className="mb-2 block text-sm font-medium"
                          >
                            Nb employés
                          </label>
                          <Input
                            id="demo-employees"
                            name="employees"
                            type="number"
                            placeholder="ex: 25"
                            className="bg-background/50"
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="demo-company"
                          className="mb-2 block text-sm font-medium"
                        >
                          Entreprise *
                        </label>
                        <Input
                          id="demo-company"
                          name="company"
                          placeholder="Nom de votre entreprise"
                          className="bg-background/50"
                          required
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="demo-needs"
                          className="mb-2 block text-sm font-medium"
                        >
                          Besoins spécifiques
                        </label>
                        <Textarea
                          id="demo-needs"
                          name="needs"
                          placeholder="Décrivez brièvement vos processus à automatiser..."
                          className="min-h-[100px] bg-background/50"
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        size="lg"
                        disabled={demoForm.isSubmitting}
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
                        className={`mt-4 rounded-lg p-4 ${
                          demoForm.response.success
                            ? 'border border-primary/20 bg-primary/10 text-primary'
                            : 'border border-destructive/20 bg-destructive/10 text-destructive'
                        }`}
                      >
                        {demoForm.response.message}
                      </div>
                    )}

                    <p className="mt-4 text-center text-xs text-muted-foreground">
                      Démonstration de 45min • Sans engagement • Réponse sous 2h
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* What's Included */}
              <div className="space-y-6">
                <Card className="border-primary/20 bg-card/60 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <CheckCircle className="h-6 w-6 text-primary" />
                      Inclus dans votre démo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {demoIncludes.map((item, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-primary/20 bg-card/60 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Clock className="h-5 w-5 text-primary" />
                      Comment ça se passe ?
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-4">
                      <li className="flex items-start gap-3">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                          1
                        </div>
                        <div>
                          <h4 className="mb-1 font-semibold">
                            Remplissez le formulaire
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Partagez vos besoins et coordonnées
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                          2
                        </div>
                        <div>
                          <h4 className="mb-1 font-semibold">
                            Notre équipe vous contacte
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Sous 2h pour planifier un créneau
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                          3
                        </div>
                        <div>
                          <h4 className="mb-1 font-semibold">
                            Démonstration personnalisée
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            45min de démo adaptée à vos besoins
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                          4
                        </div>
                        <div>
                          <h4 className="mb-1 font-semibold">
                            Devis sur mesure
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Recevez une proposition adaptée
                          </p>
                        </div>
                      </li>
                    </ol>
                  </CardContent>
                </Card>

                <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <Users className="h-6 w-6 flex-shrink-0 text-primary" />
                      <div>
                        <h4 className="mb-2 font-semibold">
                          Accompagnement personnalisé
                        </h4>
                        <p className="mb-4 text-sm text-muted-foreground">
                          Notre équipe française vous accompagne tout au long du
                          processus, de la démonstration à la mise en
                          production.
                        </p>
                        <Button asChild variant="outline" size="sm">
                          <Link to="/#contact">
                            En savoir plus
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <Card className="mx-auto max-w-4xl border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5">
            <CardContent className="p-8 text-center md:p-12">
              <h2 className="mb-4 text-3xl font-bold">
                Prêt à transformer votre entreprise ?
              </h2>
              <p className="mx-auto mb-8 max-w-2xl text-muted-foreground">
                Rejoignez les centaines d'entreprises françaises qui ont déjà
                fait confiance à WorkFlowAI pour automatiser leurs processus
                métier.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Button size="lg" asChild>
                  <Link to="/get-started">
                    <Zap className="mr-2 h-4 w-4" />
                    Démarrer l'essai gratuit
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/#pricing">
                    Voir les tarifs
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}

export default Demo
