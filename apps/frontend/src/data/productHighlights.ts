import type { LucideIcon } from 'lucide-react'
import { BarChart3, FileText, MessageSquare, Shield } from 'lucide-react'

type FeatureColor = 'primary' | 'primary-glow'
type FeatureDelay = '0s' | '0.1s' | '0.2s' | '0.3s'

export type FeatureModule = {
  slug: string
  icon: LucideIcon
  title: string
  subtitle: string
  description: string
  benefits: string[]
  color: FeatureColor
  delay: FeatureDelay
  detail: {
    mission: string
    proofPoints: string[]
    metrics: { label: string; value: string }[]
    integrations: string[]
  }
}

export const featureModules: FeatureModule[] = [
  {
    slug: 'document-ai',
    icon: FileText,
    title: 'IA Documentaire',
    subtitle: 'TRAITEMENT INTELLIGENT',
    description:
      'Analysez automatiquement vos factures, contrats et documents légaux. Notre IA extrait les données clés en quelques secondes.',
    benefits: [
      '99.7% de précision',
      'Traitement en temps réel',
      'Export vers vos outils',
    ],
    color: 'primary',
    delay: '0s',
    detail: {
      mission:
        'Remplacer la saisie manuelle par une capture automatisée adossée à Azure Computer Vision et Cosmos DB.',
      proofPoints: [
        'Contrôles RGPD appliqués dès la capture',
        'Audit trail complet vers MongoDB',
        'Feedback utilisateur intégré après chaque import',
      ],
      metrics: [
        { label: 'Précision mesurée', value: '99.7%' },
        { label: 'Temps moyen', value: '< 5 s/document' },
      ],
      integrations: ['Azure Vision', 'Cosmos DB', 'MongoDB'],
    },
  },
  {
    slug: 'ai-support',
    icon: MessageSquare,
    title: 'Service Client IA',
    subtitle: 'SUPPORT AUTOMATISÉ',
    description:
      'Chatbots intelligents qui comprennent vos clients et résolvent 80% des demandes sans intervention humaine.',
    benefits: [
      '24h/7j disponible',
      'Multilingue FR/EN',
      'Escalade automatique',
    ],
    color: 'primary-glow',
    delay: '0.1s',
    detail: {
      mission:
        'Fournir un support client cohérent, opéré par Azure OpenAI mais supervisé par l’équipe française.',
      proofPoints: [
        'Escalade instantanée vers Zoho Mail pour les cas sensibles',
        'Historique client conservé côté backend Node',
        'Chatbot UI réactivable après la phase de validation',
      ],
      metrics: [
        { label: 'Demandes résolues', value: '80%' },
        { label: 'Disponibilité', value: '24/7' },
      ],
      integrations: ['Azure OpenAI', 'Node.js Backend', 'Zoho Mail'],
    },
  },
  {
    slug: 'business-analytics',
    icon: BarChart3,
    title: 'Analytics Métier',
    subtitle: 'BUSINESS INTELLIGENCE',
    description:
      'Tableaux de bord en temps réel pour piloter votre entreprise. KPIs automatiques et alertes intelligentes.',
    benefits: ['Prédictions IA', 'Alertes proactives', 'ROI mesurable'],
    color: 'primary',
    delay: '0.2s',
    detail: {
      mission:
        'Offrir une vision consolidée des opérations en s’appuyant sur TanStack Query et l’instrumentation Vercel.',
      proofPoints: [
        'Instrumentation @vercel/analytics activée',
        'Alertes backend sur les routes critiques',
        'Feedback post-soumission stocké dans MongoDB',
      ],
      metrics: [
        { label: 'Temps de rafraîchissement', value: '< 60 s' },
        { label: 'KPIs suivis', value: '25+' },
      ],
      integrations: ['TanStack Query', 'MongoDB', 'Vercel Analytics'],
    },
  },
  {
    slug: 'rgpd-security',
    icon: Shield,
    title: 'Conformité RGPD',
    subtitle: 'SÉCURITÉ GARANTIE',
    description:
      'Protection maximale de vos données. Audit automatique de conformité et chiffrement bancaire.',
    benefits: ['Hébergement France', 'Audit continu', 'Certification ISO'],
    color: 'primary-glow',
    delay: '0.3s',
    detail: {
      mission:
        'Garantir que chaque flux – Vercel, Azure Functions, emails Zoho – respecte les exigences européennes.',
      proofPoints: [
        'Données clients hébergées sur Vercel (conformité RGPD)',
        'Azure Functions isolées pour les traitements IA',
        'Politique RGPD actualisée avec TermsFeed',
      ],
      metrics: [
        { label: 'Incidents sécurité', value: '0 signalé' },
        { label: 'SLA support', value: '- 2 h' },
      ],
      integrations: ['Vercel', 'Azure Functions', 'TermsFeed Policies'],
    },
  },
]
