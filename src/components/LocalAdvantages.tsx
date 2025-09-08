import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, MapPin, Users, GraduationCap, Phone, Flag } from "lucide-react";

const LocalAdvantages = () => {
  const advantages = [
    {
      icon: Phone,
      title: "Support en français",
      description: "Équipe technique francophone disponible aux heures ouvrables",
      badge: "7j/7",
      details: ["Assistance téléphonique", "Chat en direct", "Documentation FR", "Formation vidéo"]
    },
    {
      icon: Shield,
      title: "Données en France",
      description: "Hébergement sécurisé dans nos datacenters français certifiés",
      badge: "ISO 27001",
      details: ["Serveurs à Paris", "Sauvegarde Lille", "Chiffrement AES-256", "Audit mensuel"]
    },
    {
      icon: Flag,
      title: "Conformité RGPD",
      description: "Respect total du règlement général sur la protection des données",
      badge: "100% conforme",
      details: ["DPO certifié", "Audit juridique", "Droit à l'oubli", "Portabilité données"]
    },
    {
      icon: GraduationCap,
      title: "Formation personnalisée",
      description: "Accompagnement sur-mesure pour votre équipe et vos processus",
      badge: "Gratuite",
      details: ["Session individuelle", "Matériel pédagogique", "Suivi 3 mois", "Certification"]
    },
    {
      icon: MapPin,
      title: "Support local",
      description: "Intervention sur site dans la région Île-de-France",
      badge: "24h",
      details: ["Montigny-le-Bretonneux", "Guyancourt", "Saint-Quentin", "Versailles"]
    },
    {
      icon: Users,
      title: "Équipe française",
      description: "Développeurs et consultants basés en France depuis 2019",
      badge: "100% FR",
      details: ["Siège à Paris", "R&D Saclay", "50+ employés", "PME française"]
    }
  ];

  return (
    <section className="relative py-24 bg-gradient-to-b from-background to-background/50 overflow-hidden">
      {/* French Flag Colors Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(45deg, #002395 0%, #FFFFFF 33.33%, #ED2939 66.66%, transparent 100%)`,
          backgroundSize: '300px 300px'
        }} />
      </div>

      {/* Network Pattern */}
      <div className="absolute inset-0 opacity-3">
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="french-network" width="80" height="80" patternUnits="userSpaceOnUse">
              <circle cx="40" cy="40" r="2" fill="hsl(var(--primary))" opacity="0.4"/>
              <path d="M40,40 L80,0 M40,40 L80,80 M40,40 L0,80" stroke="hsl(var(--primary))" strokeWidth="0.5" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#french-network)"/>
        </svg>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 fade-in-up">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="flex items-center gap-1">
              <div className="w-4 h-6 bg-blue-600 rounded-sm"></div>
              <div className="w-4 h-6 bg-white border border-gray-300 rounded-sm"></div>
              <div className="w-4 h-6 bg-red-600 rounded-sm"></div>
            </div>
            <Badge variant="outline" className="border-primary/40 text-primary font-mono">
              100% Français
            </Badge>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gradient">
            Vos avantages locaux
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-mono">
            WorkFlowAI, la solution d'IA française pour les entreprises françaises
          </p>
        </div>

        {/* Advantages Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16">
          {advantages.map((advantage, index) => {
            const IconComponent = advantage.icon;
            return (
              <div 
                key={index} 
                className="fade-in-up group" 
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Card className="h-full bg-card/60 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/10">
                  <CardContent className="p-6">
                    {/* Icon and Badge */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                        <IconComponent className="w-6 h-6 text-primary" />
                      </div>
                      <Badge variant="secondary" className="font-mono text-xs bg-primary/10 text-primary border-primary/20">
                        {advantage.badge}
                      </Badge>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                      {advantage.title}
                    </h3>

                    {/* Description */}
                    <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                      {advantage.description}
                    </p>

                    {/* Details */}
                    <ul className="space-y-2">
                      {advantage.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-center text-xs font-mono">
                          <div className="w-1 h-1 bg-primary rounded-full mr-2 flex-shrink-0" />
                          <span className="text-muted-foreground">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>

        {/* Trust Indicators */}
        <div className="fade-in-up" style={{ animationDelay: "0.8s" }}>
          <div className="bg-card/30 backdrop-blur-sm rounded-2xl border border-primary/20 p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-4 text-gradient">
                Nos certifications et partenaires
              </h3>
              <p className="text-muted-foreground font-mono">
                La confiance de nos clients repose sur nos engagements
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
              {/* Certification Badges */}
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <p className="font-mono text-sm text-muted-foreground">RGPD</p>
                <p className="font-mono text-xs text-primary">Certifié</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Flag className="w-8 h-8 text-primary" />
                </div>
                <p className="font-mono text-sm text-muted-foreground">ISO 27001</p>
                <p className="font-mono text-xs text-primary">Sécurité</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MapPin className="w-8 h-8 text-primary" />
                </div>
                <p className="font-mono text-sm text-muted-foreground">French Tech</p>
                <p className="font-mono text-xs text-primary">Membre</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <p className="font-mono text-sm text-muted-foreground">PME</p>
                <p className="font-mono text-xs text-primary">Française</p>
              </div>
            </div>
          </div>
        </div>

        {/* Local Contact */}
        <div className="text-center mt-12 fade-in-up" style={{ animationDelay: "1s" }}>
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-primary/10 rounded-full border border-primary/20">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="font-mono text-sm text-primary">
              📍 Siège social : 78180 Montigny-le-Bretonneux
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocalAdvantages;