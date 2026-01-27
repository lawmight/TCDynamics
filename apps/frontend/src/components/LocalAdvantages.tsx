import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import Flag from '~icons/lucide/flag'
import GraduationCap from '~icons/lucide/graduation-cap'
import MapPin from '~icons/lucide/map-pin'
import Phone from '~icons/lucide/phone'
import Shield from '~icons/lucide/shield'
import Users from '~icons/lucide/users'

const LocalAdvantages = () => {
  const advantages = [
    {
      icon: Phone,
      title: 'Support en français',
      description:
        'Équipe technique francophone disponible aux heures ouvrables',
      badge: '7j/7',
      details: [
        'Assistance téléphonique',
        'Chat en direct',
        'Documentation FR',
        'Formation vidéo',
      ],
    },
    {
      icon: Shield,
      title: 'Données en France',
      description:
        'Hébergement sécurisé dans nos datacenters français certifiés',
      badge: 'ISO 27001',
      details: [
        'Serveurs à Paris',
        'Sauvegarde Lille',
        'Chiffrement AES-256',
        'Audit mensuel',
      ],
    },
    {
      icon: Flag,
      title: 'Conformité RGPD',
      description:
        'Respect total du règlement général sur la protection des données',
      badge: '100% conforme',
      details: [
        'DPO certifié',
        'Audit juridique',
        "Droit à l'oubli",
        'Portabilité données',
      ],
    },
    {
      icon: GraduationCap,
      title: 'Formation personnalisée',
      description:
        'Accompagnement sur-mesure pour votre équipe et vos processus',
      badge: 'Gratuite',
      details: [
        'Session individuelle',
        'Matériel pédagogique',
        'Suivi 3 mois',
        'Certification',
      ],
    },
    {
      icon: MapPin,
      title: 'Support local',
      description: 'Intervention sur site dans la région Île-de-France',
      badge: '24h',
      details: [
        'Montigny-le-Bretonneux',
        'Guyancourt',
        'Saint-Quentin',
        'Versailles',
      ],
    },
    {
      icon: Users,
      title: 'Équipe française',
      description: 'Développeurs et consultants basés en France depuis 2019',
      badge: '100% FR',
      details: ['Siège à Paris', 'R&D Saclay', '50+ employés', 'PME française'],
    },
  ]

  return (
    <section className="from-background to-background/50 relative overflow-hidden bg-gradient-to-b py-24">
      {/* French Flag Colors Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="french-flag-gradient absolute inset-0" />
      </div>

      {/* Network Pattern */}
      <div className="opacity-3 absolute inset-0">
        <svg
          className="absolute inset-0 size-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="french-network"
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
          <rect width="100%" height="100%" fill="url(#french-network)" />
        </svg>
      </div>

      <div className="container relative z-10 mx-auto px-4">
        {/* Header */}
        <div className="fade-in-up mb-16 text-center">
          <div className="mb-6 inline-flex items-center gap-3">
            <div className="flex items-center gap-1">
              <div className="h-6 w-4 rounded-sm bg-blue-600"></div>
              <div className="border-border h-6 w-4 rounded-sm border bg-white"></div>
              <div className="h-6 w-4 rounded-sm bg-red-600"></div>
            </div>
            <Badge
              variant="outline"
              className="border-primary/40 text-primary font-mono"
            >
              100% Français
            </Badge>
          </div>
          <h2 className="text-gradient mb-6 text-4xl font-bold leading-tight md:text-5xl md:leading-[1.1]">
            Vos avantages locaux
          </h2>
          <p className="text-muted-foreground mx-auto max-w-3xl font-mono text-xl">
            TCDynamics, la solution d'IA française pour les entreprises
            françaises
          </p>
        </div>

        {/* Advantages Grid */}
        <div className="mx-auto mb-16 grid max-w-7xl gap-8 md:grid-cols-2 lg:grid-cols-3">
          {advantages.map((advantage, index) => {
            const IconComponent = advantage.icon
            return (
              <div
                key={index}
                className={`fade-in-up group ${
                  index === 0
                    ? 'fade-delay-00'
                    : index === 1
                      ? 'fade-delay-01'
                      : index === 2
                        ? 'fade-delay-02'
                        : index === 3
                          ? 'fade-delay-03'
                          : index === 4
                            ? 'fade-delay-04'
                            : index === 5
                              ? 'fade-delay-05'
                              : ''
                }`}
              >
                <Card className="border-primary/20 bg-card/60 hover:border-primary/40 hover:shadow-primary/10 h-full backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg">
                  <CardContent className="p-6">
                    {/* Icon and Badge */}
                    <div className="mb-4 flex items-start justify-between">
                      <div className="bg-primary/10 group-hover:bg-primary/20 rounded-full p-3 transition-colors">
                        <IconComponent className="text-primary size-6" />
                      </div>
                      <Badge
                        variant="secondary"
                        className="border-primary/20 bg-primary/10 text-primary font-mono text-xs"
                      >
                        {advantage.badge}
                      </Badge>
                    </div>

                    {/* Title */}
                    <h3 className="group-hover:text-primary mb-3 text-xl font-bold transition-colors">
                      {advantage.title}
                    </h3>

                    {/* Description */}
                    <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                      {advantage.description}
                    </p>

                    {/* Details */}
                    <ul className="space-y-2">
                      {advantage.details.map((detail, detailIndex) => (
                        <li
                          key={detailIndex}
                          className="flex items-center font-mono text-xs"
                        >
                          <div className="bg-primary mr-2 size-1 shrink-0 rounded-full" />
                          <span className="text-muted-foreground">
                            {detail}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            )
          })}
        </div>

        {/* Trust Indicators */}
        <div className="fade-in-up fade-delay-08">
          <div className="border-primary/20 bg-card/30 rounded-2xl border p-8 backdrop-blur-sm">
            <div className="mb-8 text-center">
              <h3 className="text-gradient mb-4 text-2xl font-bold">
                Nos certifications et partenaires
              </h3>
              <p className="text-muted-foreground font-mono">
                La confiance de nos clients repose sur nos engagements
              </p>
            </div>

            <div className="grid grid-cols-2 items-center gap-8 md:grid-cols-4">
              {/* Certification Badges */}
              <div className="text-center">
                <div className="bg-primary/10 mx-auto mb-3 flex size-16 items-center justify-center rounded-full">
                  <Shield className="text-primary size-8" />
                </div>
                <p className="text-muted-foreground font-mono text-sm">RGPD</p>
                <p className="text-primary font-mono text-xs">Certifié</p>
              </div>

              <div className="text-center">
                <div className="bg-primary/10 mx-auto mb-3 flex size-16 items-center justify-center rounded-full">
                  <Flag className="text-primary size-8" />
                </div>
                <p className="text-muted-foreground font-mono text-sm">
                  ISO 27001
                </p>
                <p className="text-primary font-mono text-xs">Sécurité</p>
              </div>

              <div className="text-center">
                <div className="bg-primary/10 mx-auto mb-3 flex size-16 items-center justify-center rounded-full">
                  <MapPin className="text-primary size-8" />
                </div>
                <p className="text-muted-foreground font-mono text-sm">
                  French Tech
                </p>
                <p className="text-primary font-mono text-xs">Membre</p>
              </div>

              <div className="text-center">
                <div className="bg-primary/10 mx-auto mb-3 flex size-16 items-center justify-center rounded-full">
                  <Users className="text-primary size-8" />
                </div>
                <p className="text-muted-foreground font-mono text-sm">PME</p>
                <p className="text-primary font-mono text-xs">Française</p>
              </div>
            </div>
          </div>
        </div>

        {/* Local Contact */}
        <div className="fade-in-up fade-delay-10 mt-12 text-center">
          <div className="border-primary/20 bg-primary/10 inline-flex items-center gap-2 rounded-full border px-6 py-3">
            <MapPin className="text-primary size-4" />
            <span className="text-primary font-mono text-sm">
              📍 Siège social : 78180 Montigny-le-Bretonneux
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default LocalAdvantages
