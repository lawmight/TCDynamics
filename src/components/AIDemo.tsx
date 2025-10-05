import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowRight, Brain, FileText, MessageSquare, Zap } from 'lucide-react'
import { useState } from 'react'
import DocumentProcessor from './DocumentProcessor'

const AIDemo = () => {
  const [activeTab, setActiveTab] = useState('chatbot')

  const demoFeatures = [
    {
      id: 'chatbot',
      icon: MessageSquare,
      title: 'Assistant IA Conversationnel',
      description: 'Chatbot intelligent pour le support client',
      capabilities: [
        'Compréhension du français',
        'Réponses contextuelles',
        'Escalade automatique',
        'Apprentissage continu',
      ],
    },
    {
      id: 'documents',
      icon: FileText,
      title: 'Traitement de Documents',
      description: 'OCR et analyse automatique de documents',
      capabilities: [
        'Extraction de texte précise',
        'Analyse de formulaires',
        'Traitement de factures',
        'Classification automatique',
      ],
    },
  ]

  return (
    <section className="relative py-20 lg:py-32 bg-background overflow-hidden">
      {/* Background Network Patterns */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/6 w-2 h-2 bg-primary rounded-full animate-pulse"></div>
        <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-primary-glow rounded-full animate-pulse fade-delay-10"></div>
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-primary rounded-full animate-pulse fade-delay-20"></div>

        {/* Connection Lines */}
        <svg
          className="absolute inset-0 w-full h-full opacity-10"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient
              id="demo-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="hsl(284 100% 67%)" />
              <stop offset="100%" stopColor="hsl(142 76% 36%)" />
            </linearGradient>
          </defs>
          <line
            x1="20%"
            y1="30%"
            x2="50%"
            y2="50%"
            stroke="url(#demo-gradient)"
            strokeWidth="1"
          />
          <line
            x1="50%"
            y1="50%"
            x2="80%"
            y2="40%"
            stroke="url(#demo-gradient)"
            strokeWidth="1"
          />
          <line
            x1="30%"
            y1="70%"
            x2="50%"
            y2="50%"
            stroke="url(#demo-gradient)"
            strokeWidth="1"
          />
        </svg>
      </div>

      <div className="relative z-10 container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 bg-card/50 backdrop-blur-sm border border-border rounded-lg px-3 py-2 text-xs font-mono text-muted-foreground">
            <Brain className="w-4 h-4" />
            DÉMONSTRATION IA EN TEMPS RÉEL
          </div>

          <h2 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight tracking-tight">
            Découvrez l'IA en <span className="text-gradient">Action</span>
          </h2>

          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Testez nos fonctionnalités d'intelligence artificielle propulsées
            par Azure.
            <span className="text-primary-glow">
              {' '}
              Essayez gratuitement dès maintenant !
            </span>
          </p>
        </div>

        {/* Demo Tabs */}
        <div className="max-w-6xl mx-auto">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
            aria-label="Fonctionnalités de démonstration IA"
          >
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-card/50 backdrop-blur-sm">
              {demoFeatures.map(feature => {
                const IconComponent = feature.icon
                return (
                  <TabsTrigger
                    key={feature.id}
                    value={feature.id}
                    className="flex items-center gap-3 py-4 font-mono data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    aria-label={`Démonstration de ${feature.title}`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-semibold">{feature.title}</div>
                      <div className="text-xs opacity-70">
                        {feature.description}
                      </div>
                    </div>
                  </TabsTrigger>
                )
              })}
            </TabsList>

            {/* Chatbot Demo Tab */}
            <TabsContent value="chatbot" className="space-y-8">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Feature Description */}
                <div className="space-y-6">
                  <Card className="bg-card/30 backdrop-blur-sm border-primary/20">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/20 rounded-lg">
                          <MessageSquare className="w-6 h-6 text-primary" />
                        </div>
                        <CardTitle className="text-2xl font-mono">
                          Assistant IA Conversationnel
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground font-mono">
                        Notre chatbot alimenté par GPT-3.5-turbo comprend le
                        français et peut aider vos clients 24h/24 avec des
                        réponses contextuelles et pertinentes.
                      </p>

                      <div className="space-y-3">
                        {demoFeatures[0].capabilities.map(
                          (capability, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-3"
                            >
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                              <span className="text-sm font-mono">
                                {capability}
                              </span>
                            </div>
                          )
                        )}
                      </div>

                      <div className="bg-primary/5 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="w-4 h-4 text-primary" />
                          <span className="font-mono text-sm font-semibold">
                            Technologie:
                          </span>
                        </div>
                        <Badge variant="secondary" className="font-mono">
                          Azure OpenAI GPT-3.5-turbo
                        </Badge>
                      </div>

                      <Button
                        className="w-full group font-mono"
                        aria-label="Ouvrir le chatbot IA pour tester les fonctionnalités"
                      >
                        Tester le Chatbot
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Sample Conversations */}
                  <Card className="bg-card/30 backdrop-blur-sm border-primary/10">
                    <CardHeader>
                      <CardTitle className="text-lg font-mono">
                        Exemples de Conversations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-sm font-mono">
                        <div className="bg-muted/50 rounded-lg p-3">
                          <div className="text-muted-foreground mb-1">
                            Client:
                          </div>
                          <div>
                            "Comment configurer l'automatisation de mes factures
                            ?"
                          </div>
                        </div>
                        <div className="bg-primary/10 rounded-lg p-3">
                          <div className="text-primary mb-1">IA:</div>
                          <div>
                            "Je peux vous guider à travers les étapes de
                            configuration..."
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Interactive Demo Area */}
                <div className="space-y-6">
                  <Card className="bg-card/50 backdrop-blur-sm border-primary/30">
                    <CardHeader>
                      <CardTitle className="text-xl font-mono">
                        Testez l'IA en Temps Réel
                      </CardTitle>
                      <p className="text-muted-foreground font-mono text-sm">
                        Cliquez sur le bouton bleu en bas à droite de l'écran
                        pour ouvrir le chatbot
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-muted/30 rounded-lg p-6 text-center">
                        <MessageSquare className="w-16 h-16 mx-auto mb-4 text-primary/50" />
                        <h3 className="font-mono text-lg mb-2">
                          Chatbot Interactif
                        </h3>
                        <p className="text-muted-foreground font-mono text-sm mb-4">
                          Essayez de poser une question sur WorkFlowAI ou
                          l'automatisation d'entreprise
                        </p>
                        <Badge className="bg-primary/20 text-primary font-mono">
                          Disponible 24h/24
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                          80%
                        </div>
                        <div className="text-sm font-mono text-green-700 dark:text-green-300">
                          des demandes résolues automatiquement
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                          24/7
                        </div>
                        <div className="text-sm font-mono text-blue-700 dark:text-blue-300">
                          disponibilité du support
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Document Processing Demo Tab */}
            <TabsContent value="documents" className="space-y-8">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Feature Description */}
                <div className="space-y-6">
                  <Card className="bg-card/30 backdrop-blur-sm border-primary/20">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/20 rounded-lg">
                          <FileText className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl font-mono">
                            Traitement de Documents IA
                          </CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground font-mono">
                        Notre système d'IA analyse automatiquement vos documents
                        avec une précision de 99.7% et extrait les données
                        pertinentes en quelques secondes.
                      </p>

                      <div className="space-y-3">
                        {demoFeatures[1].capabilities.map(
                          (capability, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-3"
                            >
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                              <span className="text-sm font-mono">
                                {capability}
                              </span>
                            </div>
                          )
                        )}
                      </div>

                      <div className="bg-primary/5 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="w-4 h-4 text-primary" />
                          <span className="font-mono text-sm font-semibold">
                            Technologie:
                          </span>
                        </div>
                        <Badge variant="secondary" className="font-mono">
                          Azure AI Vision OCR
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Use Cases */}
                  <Card className="bg-card/30 backdrop-blur-sm border-primary/10">
                    <CardHeader>
                      <CardTitle className="text-lg font-mono">
                        Cas d'Usage
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                          <FileText className="w-5 h-5 text-primary" />
                          <div>
                            <div className="font-mono text-sm font-semibold">
                              Factures
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Extraction automatique des montants et dates
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                          <FileText className="w-5 h-5 text-primary" />
                          <div>
                            <div className="font-mono text-sm font-semibold">
                              Contrats
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Analyse des clauses et conditions
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                          <FileText className="w-5 h-5 text-primary" />
                          <div>
                            <div className="font-mono text-sm font-semibold">
                              Formulaires
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Remplissage automatique des données
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Document Processor Demo */}
                <div>
                  <DocumentProcessor />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4 font-mono">
                Prêt à Automatiser Votre Entreprise ?
              </h3>
              <p className="text-muted-foreground mb-6 font-mono">
                Ces technologies d'IA sont maintenant intégrées à notre
                plateforme et consomment activement votre crédit Azure pour des
                fonctionnalités réelles.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="font-mono">
                  Démarrer l'Essai Gratuit
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button size="lg" variant="outline" className="font-mono">
                  Planifier une Démo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

export default AIDemo
