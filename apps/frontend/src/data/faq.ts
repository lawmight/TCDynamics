/**
 * Single source of truth for FAQ content.
 * Used by FAQ.tsx (UI) and for FAQPage JSON-LD schema (structured data).
 */

export interface FaqItem {
  id: string
  question: string
  answer: string[]
}

export const faqs: FaqItem[] = [
  {
    id: 'security',
    question: 'Vos données sont-elles sécurisées ?',
    answer: [
      'Absolument. La sécurité de vos données est notre priorité absolue :',
      '• **Hébergement français** : Nos serveurs sont situés en France (Paris et Lille)',
      '• **Chiffrement AES-256** : Toutes vos données sont chiffrées en transit et au repos',
      '• **Conformité RGPD** : Respect total du règlement européen sur la protection des données',
      '• **Certifications** : ISO 27001, SOC 2 Type II, et audits de sécurité réguliers',
      '• **Sauvegarde** : Sauvegardes automatiques quotidiennes avec rétention 30 jours',
      "• **Accès contrôlé** : Authentification multi-facteurs et gestion des droits d'accès",
    ],
  },
  {
    id: 'integration',
    question: 'Comment intégrer avec nos outils existants ?',
    answer: [
      "TCDynamics s'intègre facilement avec vos outils actuels :",
      '• **Connecteurs natifs** : Office 365, Google Workspace, Salesforce, HubSpot',
      '• **APIs REST** : Plus de 200 intégrations disponibles via notre marketplace',
      '• **Import de données** : Migration assistée depuis vos fichiers Excel, CSV, PDF',
      '• **Webhooks** : Synchronisation en temps réel avec vos systèmes métier',
      '• **Formation incluse** : Notre équipe vous accompagne dans la mise en place',
      "• **Support technique** : Assistance dédiée pendant toute la phase d'intégration",
      '• **Temps de déploiement** : Généralement 24-48h pour une configuration standard',
    ],
  },
  {
    id: 'support',
    question: 'Quel support technique proposez-vous ?',
    answer: [
      'Notre support technique français est disponible quand vous en avez besoin :',
      '• **Équipe francophone** : Support 100% en français par des experts locaux',
      '• **Horaires étendus** : Lundi-Vendredi 8h-19h, Samedi 9h-17h',
      '• **Canaux multiples** : Téléphone, chat, email, visioconférence',
      '• **Intervention sur site** : Possible dans la région Île-de-France',
      '• **Documentation complète** : Base de connaissances, tutoriels vidéo, FAQ',
      '• **Formation personnalisée** : Sessions individuelles ou en groupe',
      '• **Temps de réponse** : Moins de 2h en moyenne, 30min pour les urgences',
    ],
  },
  {
    id: 'trial',
    question: 'Puis-je essayer gratuitement ?',
    answer: [
      'Bien sûr ! Nous proposons plusieurs options pour découvrir TCDynamics :',
      '• **Essai gratuit 30 jours** : Accès complet sans engagement ni carte bancaire',
      '• **Démonstration personnalisée** : Présentation adaptée à vos besoins (1h)',
      '• **Environnement de test** : Testez avec vos propres données en toute sécurité',
      "• **Support pendant l'essai** : Accompagnement complet de notre équipe",
      '• **Migration des données** : Import gratuit de vos données existantes',
      '• **Formation incluse** : Sessions de prise en main personnalisées',
      "• **Pas d'engagement** : Résiliation possible à tout moment sans frais",
    ],
  },
]

export const additionalFaqs: FaqItem[] = [
  {
    id: 'pricing',
    question: 'Quels sont vos tarifs et conditions ?',
    answer: [
      'Nos tarifs sont transparents et adaptés aux entreprises françaises :',
      '• **Starter 29$/mois** : Parfait pour les petites entreprises (1-10 utilisateurs)',
      "• **Professional 79$/mois** : Idéal pour les PME (jusqu'à 50 utilisateurs)",
      '• **Enterprise sur mesure** : Solutions personnalisées pour les grandes entreprises',
      "• **Facturation mensuelle** : Pas d'engagement annuel obligatoire",
      "• **Réduction annuelle** : -20% sur les abonnements payés à l'année",
      '• **Formation incluse** : Prise en main gratuite avec tous les plans',
    ],
  },
  {
    id: 'team',
    question: "Combien d'utilisateurs peuvent utiliser la plateforme ?",
    answer: [
      "TCDynamics s'adapte à la taille de votre équipe :",
      "• **Gestion flexible** : Ajout/suppression d'utilisateurs en quelques clics",
      '• **Rôles personnalisés** : Administrateur, utilisateur, invité, consultant',
      '• **Droits granulaires** : Contrôle précis des accès par département/projet',
      '• **Facturation proportionnelle** : Payez uniquement pour les utilisateurs actifs',
      '• **Comptes invités** : Collaboration gratuite avec vos partenaires externes',
      "• **Single Sign-On** : Connexion simplifiée via votre annuaire d'entreprise",
    ],
  },
]

/** All FAQs merged (for schema and UI). Prefer 3–6 for rich results; we have 6. */
export const allFaqs: FaqItem[] = [...faqs, ...additionalFaqs]
