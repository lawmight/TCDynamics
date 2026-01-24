import Shield from '~icons/lucide/shield'
import Lock from '~icons/lucide/lock'
import Cloud from '~icons/lucide/cloud'
import Phone from '~icons/lucide/phone'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

const Security = () => {
  const guarantees = [
    {
      icon: Shield,
      title: 'Hébergement en France',
      description: 'Données hébergées sur des infrastructures européennes.',
    },
    {
      icon: Lock,
      title: 'RGPD prêt',
      description:
        'Chiffrement en transit et au repos, DPA fourni sur demande.',
    },
    {
      icon: Cloud,
      title: 'Disponibilité',
      description:
        'Objectif 99.9% de disponibilité. Statuts et alertes en préparation.',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/60">
      <div className="container mx-auto px-6 py-16">
        <div className="mb-12 text-center">
          <Badge
            variant="outline"
            className="mb-4 border-primary/40 text-primary"
          >
            Security & Availability
          </Badge>
          <h1 className="mb-4 text-4xl font-bold text-foreground lg:text-5xl">
            Sécurité, conformité et disponibilité
          </h1>
          <p className="mx-auto max-w-3xl text-lg text-muted-foreground">
            Cette page est un point de passage rapide en attendant la
            publication complète (certifications, statuts temps réel et
            runbooks). Contactez-nous pour obtenir les documents à jour.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {guarantees.map(item => (
            <Card
              key={item.title}
              className="border-primary/20 bg-card/60 backdrop-blur-sm"
            >
              <CardContent className="space-y-3 p-6">
                <div className="flex items-center gap-3">
                  <item.icon className="h-6 w-6 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">
                    {item.title}
                  </h3>
                </div>
                <p className="font-mono text-sm text-muted-foreground">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <Card className="border-primary/20 bg-card/60 backdrop-blur-sm">
            <CardContent className="space-y-3 p-6">
              <h3 className="text-xl font-bold text-foreground">
                Documents disponibles
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• DPA / RGPD</li>
                <li>• Architecture & zones d'hébergement</li>
                <li>• Politique de sauvegarde et rétention</li>
              </ul>
              <p className="text-sm text-muted-foreground">
                Demandez-les lors de la démo ou par le canal support.
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-card/60 backdrop-blur-sm">
            <CardContent className="space-y-3 p-6">
              <h3 className="text-xl font-bold text-foreground">
                Contact sécurité
              </h3>
              <p className="text-sm text-muted-foreground">
                Besoin d'une revue ou d'un questionnaire ? Contactez-nous.
              </p>
              <div className="flex items-center gap-2 font-mono text-sm text-primary">
                <Phone className="h-4 w-4" />
                <Link
                  to="/#contact"
                  className="underline-offset-4 hover:underline"
                >
                  Parler à un expert
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Security

