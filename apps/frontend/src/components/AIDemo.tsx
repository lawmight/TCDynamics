import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import DocumentProcessor from './DocumentProcessor'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ArrowRight from '~icons/lucide/arrow-right'
import Brain from '~icons/lucide/brain'
import FileText from '~icons/lucide/file-text'
import MessageSquare from '~icons/lucide/message-square'
import Zap from '~icons/lucide/zap'

const AIDemo = () => {
  const navigate = useNavigate()
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
    <section className="bg-background relative overflow-hidden py-20 lg:py-32">
      {/* Background Network Patterns */}
      <div className="absolute inset-0 opacity-20">
        <div className="left-1/6 bg-primary absolute top-1/4 size-2 animate-pulse rounded-full"></div>
        <div className="fade-delay-10 bg-primary-glow absolute right-1/4 top-1/2 size-1 animate-pulse rounded-full"></div>
        <div className="fade-delay-20 bg-primary absolute bottom-1/4 left-1/3 size-1.5 animate-pulse rounded-full"></div>

        {/* Connection Lines */}
        <svg
          className="absolute inset-0 size-full opacity-10"
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

      <div className="container relative z-10 mx-auto px-6">
        {/* Section Header */}
        <div className="mb-16 space-y-6 text-center">
          <div className="border-border bg-card/50 text-muted-foreground inline-flex items-center gap-2 rounded-lg border px-3 py-2 font-mono text-xs backdrop-blur-sm">
            <Brain className="size-4" />
            DÉMONSTRATION IA EN TEMPS RÉEL
          </div>

          <h2 className="text-foreground text-4xl font-bold leading-tight tracking-tight lg:text-6xl">
            Découvrez l'IA en <span className="text-gradient">Action</span>
          </h2>

          <p className="text-muted-foreground mx-auto max-w-3xl text-xl">
            Testez nos fonctionnalités d'intelligence artificielle propulsées
            par Azure.
            <span className="text-primary-glow">
              {' '}
              Essayez gratuitement dès maintenant !
            </span>
          </p>
        </div>

        {/* Demo Tabs */}
        <div className="mx-auto max-w-6xl">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
            aria-label="Fonctionnalités de démonstration IA"
          >
            <TabsList className="bg-card/50 mb-8 grid w-full grid-cols-2 backdrop-blur-sm">
              {demoFeatures.map(feature => {
                const IconComponent = feature.icon
                return (
                  <TabsTrigger
                    key={feature.id}
                    value={feature.id}
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-3 py-4 font-mono"
                    aria-label={`Démonstration de ${feature.title}`}
                  >
                    <IconComponent className="size-5" />
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
              <div className="grid gap-8 lg:grid-cols-2">
                {/* Feature Description */}
                <div className="space-y-6">
                  <Card className="border-primary/20 bg-card/30 backdrop-blur-sm">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/20 rounded-lg p-2">
                          <MessageSquare className="text-primary size-6" />
                        </div>
                        <CardTitle className="font-mono text-2xl">
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
                              <div className="bg-primary size-2 rounded-full"></div>
                              <span className="font-mono text-sm">
                                {capability}
                              </span>
                            </div>
                          )
                        )}
                      </div>

                      <div className="bg-primary/5 rounded-lg p-4">
                        <div className="mb-2 flex items-center gap-2">
                          <Zap className="text-primary size-4" />
                          <span className="font-mono text-sm font-semibold">
                            Technologie:
                          </span>
                        </div>
                        <Badge variant="secondary" className="font-mono">
                          Azure OpenAI GPT-3.5-turbo
                        </Badge>
                      </div>

                      <Button
                        className="group w-full font-mono"
                        aria-label="Ouvrir le chatbot IA pour tester les fonctionnalités"
                        onClick={() => {
                          // The chatbot is already available via LazyAIChatbot component
                          // You can trigger it to open or scroll to a demo section
                          window.dispatchEvent(new CustomEvent('openChatbot'))
                        }}
                      >
                        Tester le Chatbot
                        <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Sample Conversations */}
                  <Card className="border-primary/10 bg-card/30 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="font-mono text-lg">
                        Exemples de Conversations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 font-mono text-sm">
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
                  <Card className="border-primary/30 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="font-mono text-xl">
                        Testez l'IA en Temps Réel
                      </CardTitle>
                      <p className="text-muted-foreground font-mono text-sm">
                        Cliquez sur le bouton bleu en bas à droite de l'écran
                        pour ouvrir le chatbot
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-muted/30 rounded-lg p-6 text-center">
                        <MessageSquare className="text-primary/50 mx-auto mb-4 size-16" />
                        <h3 className="mb-2 font-mono text-lg">
                          Chatbot Interactif
                        </h3>
                        <p className="text-muted-foreground mb-4 font-mono text-sm">
                          Essayez de poser une question sur TCDynamics ou
                          l'automatisation d'entreprise
                        </p>
                        <Badge className="bg-primary/20 text-primary font-mono">
                          Disponible 24h/24
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-2 gap-4">
                    <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
                      <CardContent className="p-4 text-center">
                        <div className="mb-1 text-2xl font-bold text-green-600 dark:text-green-400">
                          80%
                        </div>
                        <div className="font-mono text-sm text-green-700 dark:text-green-300">
                          des demandes résolues automatiquement
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
                      <CardContent className="p-4 text-center">
                        <div className="mb-1 text-2xl font-bold text-blue-600 dark:text-blue-400">
                          24/7
                        </div>
                        <div className="font-mono text-sm text-blue-700 dark:text-blue-300">
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
              <div className="grid gap-8 lg:grid-cols-2">
                {/* Feature Description */}
                <div className="space-y-6">
                  <Card className="border-primary/20 bg-card/30 backdrop-blur-sm">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/20 rounded-lg p-2">
                          <FileText className="text-primary size-6" />
                        </div>
                        <div>
                          <CardTitle className="font-mono text-2xl">
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
                              <div className="bg-primary size-2 rounded-full"></div>
                              <span className="font-mono text-sm">
                                {capability}
                              </span>
                            </div>
                          )
                        )}
                      </div>

                      <div className="bg-primary/5 rounded-lg p-4">
                        <div className="mb-2 flex items-center gap-2">
                          <Zap className="text-primary size-4" />
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
                  <Card className="border-primary/10 bg-card/30 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="font-mono text-lg">
                        Cas d'Usage
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="bg-muted/30 flex items-center gap-3 rounded-lg p-3">
                          <FileText className="text-primary size-5" />
                          <div>
                            <div className="font-mono text-sm font-semibold">
                              Factures
                            </div>
                            <div className="text-muted-foreground text-xs">
                              Extraction automatique des montants et dates
                            </div>
                          </div>
                        </div>
                        <div className="bg-muted/30 flex items-center gap-3 rounded-lg p-3">
                          <FileText className="text-primary size-5" />
                          <div>
                            <div className="font-mono text-sm font-semibold">
                              Contrats
                            </div>
                            <div className="text-muted-foreground text-xs">
                              Analyse des clauses et conditions
                            </div>
                          </div>
                        </div>
                        <div className="bg-muted/30 flex items-center gap-3 rounded-lg p-3">
                          <FileText className="text-primary size-5" />
                          <div>
                            <div className="font-mono text-sm font-semibold">
                              Formulaires
                            </div>
                            <div className="text-muted-foreground text-xs">
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
        <div className="mt-16 text-center">
          <Card className="border-primary/20 from-primary/10 to-primary/5 mx-auto max-w-2xl bg-gradient-to-r">
            <CardContent className="p-8">
              <h3 className="mb-4 font-mono text-2xl font-bold">
                Prêt à Automatiser Votre Entreprise ?
              </h3>
              <p className="text-muted-foreground mb-6 font-mono">
                Ces technologies d'IA sont maintenant intégrées à notre
                plateforme et consomment activement votre crédit Azure pour des
                fonctionnalités réelles.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Button
                  size="lg"
                  className="font-mono"
                  onClick={() => navigate('/get-started')}
                >
                  Démarrer l'Essai Gratuit
                  <ArrowRight className="ml-2 size-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="font-mono"
                  onClick={() => navigate('/demo')}
                >
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
