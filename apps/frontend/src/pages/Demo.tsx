import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useDemoForm } from '@/hooks/useDemoForm'
import {
  ArrowRight,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  MessageSquare,
  Play,
  Users,
  Video,
  Zap,
} from 'lucide-react'
import { Link } from 'react-router-dom'

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
              <Video className="w-3 h-3 mr-1" />
              Démonstration Interactive
            </Badge>

            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
              Découvrez <span className="text-gradient">WorkFlowAI</span> en
              Action
            </h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Voyez comment notre plateforme d'intelligence artificielle peut
              transformer votre entreprise avec une démonstration personnalisée
              et interactive.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="group" asChild>
                <a href="#demo-form">
                  <Calendar className="w-4 h-4 mr-2" />
                  Réserver une démo
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#demo-video">
                  <Play className="w-4 h-4 mr-2" />
                  Voir la vidéo de démo
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Features */}
      <section className="py-16 bg-card/20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Ce que vous allez découvrir
            </h2>
            <p className="text-muted-foreground text-lg">
              Une démonstration complète de nos fonctionnalités phares
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {demoFeatures.map((feature, index) => (
              <Card
                key={index}
                className="bg-card/60 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all"
              >
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
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
          <div className="max-w-4xl mx-auto">
            <Card className="bg-card/60 backdrop-blur-sm border-primary/20">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Play className="w-6 h-6 text-primary" />
                  Vidéo de Démonstration
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* TODO: Embed actual demo video when available */}
                <div className="aspect-video bg-muted/30 rounded-lg flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <Video className="w-16 h-16 text-primary/50 mx-auto" />
                    <div>
                      <h3 className="font-semibold text-lg mb-2">
                        Vidéo de démonstration à venir
                      </h3>
                      <p className="text-sm text-muted-foreground max-w-md">
                        En attendant, réservez une démonstration personnalisée
                        avec notre équipe pour découvrir toutes les
                        fonctionnalités en détail.
                      </p>
                    </div>
                    <Button asChild>
                      <a href="#demo-form">
                        <Calendar className="w-4 h-4 mr-2" />
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
      <section id="demo-form" className="py-16 bg-card/20">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Form */}
              <div>
                <Card className="bg-card/60 backdrop-blur-sm border-primary/20">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <Calendar className="w-5 h-5 text-primary" />
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
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Prénom *
                          </label>
                          <Input
                            name="firstName"
                            placeholder="Jean"
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
                          className="bg-background/50"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Téléphone
                          </label>
                          <Input
                            name="phone"
                            type="tel"
                            placeholder="01 23 45 67 89"
                            className="bg-background/50"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Nb employés
                          </label>
                          <Input
                            name="employees"
                            type="number"
                            placeholder="ex: 25"
                            className="bg-background/50"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Entreprise *
                        </label>
                        <Input
                          name="company"
                          placeholder="Nom de votre entreprise"
                          className="bg-background/50"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Besoins spécifiques
                        </label>
                        <Textarea
                          name="needs"
                          placeholder="Décrivez brièvement vos processus à automatiser..."
                          className="bg-background/50 min-h-[100px]"
                        />
                      </div>

                      <Button
                        className="w-full"
                        size="lg"
                        disabled={demoForm.isSubmitting}
                      >
                        {demoForm.isSubmitting ? (
                          'Envoi en cours...'
                        ) : (
                          <>
                            <Calendar className="w-4 h-4 mr-2" />
                            Réserver ma démo gratuite
                          </>
                        )}
                      </Button>
                    </form>

                    {demoForm.response && (
                      <div
                        className={`p-4 rounded-lg mt-4 ${
                          demoForm.response.success
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : 'bg-red-100 text-red-800 border border-red-200'
                        }`}
                      >
                        {demoForm.response.message}
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground text-center mt-4">
                      Démonstration de 45min • Sans engagement • Réponse sous 2h
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* What's Included */}
              <div className="space-y-6">
                <Card className="bg-card/60 backdrop-blur-sm border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <CheckCircle className="w-6 h-6 text-primary" />
                      Inclus dans votre démo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {demoIncludes.map((item, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-card/60 backdrop-blur-sm border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Clock className="w-5 h-5 text-primary" />
                      Comment ça se passe ?
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-4">
                      <li className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-primary text-sm">
                          1
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">
                            Remplissez le formulaire
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Partagez vos besoins et coordonnées
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-primary text-sm">
                          2
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">
                            Notre équipe vous contacte
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Sous 2h pour planifier un créneau
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-primary text-sm">
                          3
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">
                            Démonstration personnalisée
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            45min de démo adaptée à vos besoins
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-primary text-sm">
                          4
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">
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

                <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <Users className="w-6 h-6 text-primary flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold mb-2">
                          Accompagnement personnalisé
                        </h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          Notre équipe française vous accompagne tout au long du
                          processus, de la démonstration à la mise en
                          production.
                        </p>
                        <Button asChild variant="outline" size="sm">
                          <Link to="/contact">
                            En savoir plus
                            <ArrowRight className="w-4 h-4 ml-2" />
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
          <Card className="max-w-4xl mx-auto bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-8 md:p-12 text-center">
              <h2 className="text-3xl font-bold mb-4">
                Prêt à transformer votre entreprise ?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                Rejoignez les centaines d'entreprises françaises qui ont déjà
                fait confiance à WorkFlowAI pour automatiser leurs processus
                métier.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link to="/get-started">
                    <Zap className="w-4 h-4 mr-2" />
                    Démarrer l'essai gratuit
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/pricing">
                    Voir les tarifs
                    <ArrowRight className="w-4 h-4 ml-2" />
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
