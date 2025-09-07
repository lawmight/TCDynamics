import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Calendar, 
  Users, 
  CheckCircle,
  Building,
  Car,
  Train
} from "lucide-react";

const Contact = () => {
  const contactInfo = [
    {
      icon: Building,
      title: "Siège social",
      details: [
        "WorkFlowAI France",
        "12 Avenue des Prés",
        "78180 Montigny-le-Bretonneux",
        "Île-de-France"
      ]
    },
    {
      icon: Phone,
      title: "Téléphone",
      details: [
        "Standard : 01 39 44 75 00",
        "Support : 01 39 44 75 01", 
        "Commercial : 01 39 44 75 02",
        "Lundi-Vendredi 8h-19h"
      ]
    },
    {
      icon: Mail,
      title: "Email",
      details: [
        "contact@workflowai.fr",
        "demo@workflowai.fr",
        "support@workflowai.fr",
        "Réponse sous 2h"
      ]
    },
    {
      icon: Car,
      title: "Accès",
      details: [
        "RER C : Gare de Saint-Quentin",
        "A86/N12 : Sortie Guyancourt",
        "Parking gratuit sur site",
        "15min de Versailles"
      ]
    }
  ];

  const benefits = [
    "Démonstration personnalisée 45min",
    "Analyse gratuite de vos processus", 
    "Devis sur mesure immédiat",
    "Test avec vos données réelles"
  ];

  return (
    <section className="relative py-24 bg-gradient-to-b from-background to-background/50 overflow-hidden">
      {/* Network Background */}
      <div className="absolute inset-0 opacity-5">
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="contact-network" width="80" height="80" patternUnits="userSpaceOnUse">
              <circle cx="40" cy="40" r="2" fill="hsl(var(--primary))" opacity="0.4"/>
              <path d="M40,40 L80,0 M40,40 L80,80 M40,40 L0,80" stroke="hsl(var(--primary))" strokeWidth="0.5" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#contact-network)"/>
        </svg>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 fade-in-up">
          <Badge variant="outline" className="border-primary/40 text-primary font-mono mb-6">
            Contactez-nous
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gradient">
            Prêt à automatiser ?
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-mono">
            Découvrez comment WorkFlowAI peut transformer votre entreprise
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
          {/* Demo Request Form */}
          <div className="fade-in-up" style={{ animationDelay: "0.2s" }}>
            <Card className="bg-card/60 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all duration-300">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">Réserver une démo</CardTitle>
                </div>
                <p className="text-muted-foreground font-mono text-sm">
                  Démonstration personnalisée avec vos données
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Benefits */}
                <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    Inclus dans votre démonstration :
                  </h4>
                  <ul className="space-y-2">
                    {benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center text-sm font-mono">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3 flex-shrink-0" />
                        <span className="text-muted-foreground">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Demo Form */}
                <form className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Prénom *</label>
                      <Input placeholder="Jean" className="bg-background/50" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Nom *</label>
                      <Input placeholder="Dupont" className="bg-background/50" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Email professionnel *</label>
                    <Input type="email" placeholder="jean.dupont@entreprise.fr" className="bg-background/50" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Téléphone</label>
                      <Input placeholder="01 23 45 67 89" className="bg-background/50" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Nb employés</label>
                      <Input placeholder="ex: 25" className="bg-background/50" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Entreprise *</label>
                    <Input placeholder="Nom de votre entreprise" className="bg-background/50" />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Besoins spécifiques</label>
                    <Textarea 
                      placeholder="Décrivez brièvement vos processus à automatiser..."
                      className="bg-background/50 min-h-[100px]"
                    />
                  </div>
                  
                  <Button className="w-full" size="lg" variant="hero">
                    <Calendar className="w-4 h-4 mr-2" />
                    Réserver ma démo gratuite
                  </Button>
                </form>

                <p className="text-xs text-muted-foreground font-mono text-center">
                  Démonstration de 45min • Sans engagement • Réponse sous 2h
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information & General Form */}
          <div className="space-y-8">
            {/* Contact Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 fade-in-up" style={{ animationDelay: "0.4s" }}>
              {contactInfo.map((info, index) => {
                const IconComponent = info.icon;
                return (
                  <Card key={index} className="bg-card/40 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-all duration-300">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-full flex-shrink-0">
                          <IconComponent className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm mb-2">{info.title}</h4>
                          <div className="space-y-1">
                            {info.details.map((detail, detailIndex) => (
                              <p key={detailIndex} className="text-xs font-mono text-muted-foreground">
                                {detail}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* General Contact Form */}
            <Card className="bg-card/60 backdrop-blur-sm border-primary/20 fade-in-up" style={{ animationDelay: "0.6s" }}>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle>Nous contacter</CardTitle>
                </div>
                <p className="text-muted-foreground font-mono text-sm">
                  Une question ? Notre équipe vous répond rapidement
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <form className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Prénom *</label>
                      <Input placeholder="Prénom" className="bg-background/50" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Nom *</label>
                      <Input placeholder="Nom" className="bg-background/50" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Email *</label>
                    <Input type="email" placeholder="votre@email.fr" className="bg-background/50" />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Sujet</label>
                    <Input placeholder="Support technique, question commerciale..." className="bg-background/50" />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Message *</label>
                    <Textarea 
                      placeholder="Décrivez votre demande..."
                      className="bg-background/50 min-h-[120px]"
                    />
                  </div>
                  
                  <Button className="w-full" variant="outline">
                    <Mail className="w-4 h-4 mr-2" />
                    Envoyer le message
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Local Office Highlight */}
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 fade-in-up" style={{ animationDelay: "0.8s" }}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/20 rounded-full">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Bureau local Île-de-France</h3>
                    <p className="text-muted-foreground mb-3 font-mono text-sm">
                      Équipe française basée à Montigny-le-Bretonneux, proche de Guyancourt
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs font-mono bg-primary/10 text-primary">
                        Intervention sur site
                      </Badge>
                      <Badge variant="secondary" className="text-xs font-mono bg-primary/10 text-primary">
                        Support local
                      </Badge>
                      <Badge variant="secondary" className="text-xs font-mono bg-primary/10 text-primary">
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
        <div className="text-center mt-16 fade-in-up" style={{ animationDelay: "1s" }}>
          <div className="flex flex-wrap justify-center gap-6 text-sm font-mono text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span>Réponse sous 2h</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <span>Équipe française</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span>RGPD conforme</span>
            </div>
            <div className="flex items-center gap-2">
              <Train className="w-4 h-4 text-primary" />
              <span>Accès RER C</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;