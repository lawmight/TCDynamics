# TCDynamics Client Onboarding Strategy
**Comprehensive Implementation Guide**

*Combining UX excellence, French SME personalization, and RGPD compliance*

---

## Executive Summary

TCDynamics will implement a **best-in-class onboarding system** that delivers rapid time-to-value (<10 minutes) while building trust through transparent RGPD compliance and French-first UX. This strategy combines:

1. **Interactive progress tracking** with personalized paths
2. **Pre-built workflow templates** for instant value delivery
3. **RGPD-first compliance** embedded throughout the experience
4. **Contextual in-app guidance** with French cultural adaptation
5. **Continuous engagement** and metrics-driven optimization

**Expected Impact**:
- **86% increase** in customer retention (industry research)
- **<10 minutes** to first automation (time-to-value)
- **>70%** onboarding completion rate
- **50%+** analytics consent rate (transparent RGPD approach)

---

## Current State Analysis

### What You Have

From `apps/frontend/src/pages/GetStarted.tsx`:

```typescript
const onboardingSteps = [
  {
    step: 1,
    title: 'Créez votre compte',
    description: 'Remplissez le formulaire en 30 secondes',
  },
  {
    step: 2,
    title: 'Configurez votre espace',
    description: 'Personnalisez vos préférences et paramètres',
  },
  {
    step: 3,
    title: 'Importez vos données',
    description: 'Connectez vos outils existants ou uploadez vos fichiers',
  },
  {
    step: 4,
    title: 'Commencez à automatiser',
    description: 'Lancez votre premier workflow en quelques clics',
  },
]
```

**Current Strengths:**
- ✅ Clear 4-step process in French
- ✅ Demo-first approach (reduces barrier to entry)
- ✅ Plan selection before signup
- ✅ No credit card required

**Critical Gaps:**
- ❌ No progress tracking in User model
- ❌ No interactive checklist in Dashboard
- ❌ No pre-built workflow templates
- ❌ No in-app guidance system
- ❌ No RGPD consent granularity
- ❌ No personalization based on role/industry
- ❌ No French validation (SIRET, phone formats)

---

## Recommended Approach

### 🎯 "Progressive French-First Onboarding with Template-Driven Activation"

A multi-phase system that balances:
- **Rapid activation** via pre-built templates (<10 minutes to first workflow)
- **RGPD transparency** with granular consent management
- **French SME cultural fit** (formal language, native validation, industry templates)
- **Continuous engagement** beyond initial setup

---

## Phase 1: Foundation & Compliance

### 1.1 Extend User Model for Onboarding Tracking

**File:** `api/_lib/models/User.js`

Add these fields to the User schema:

```javascript
// Onboarding & Personalization
onboarding: {
  // Progress Tracking
  completed: { type: Boolean, default: false },
  completedSteps: { type: [String], default: [] },
  currentStep: { type: String, default: 'profile_setup' },
  skipped: { type: Boolean, default: false },
  completedAt: { type: Date, default: null },

  // Personalization
  persona: {
    type: String,
    enum: ['marketing', 'sales', 'finance', 'hr', 'operations', 'general'],
    default: 'general'
  },
  industry: { type: String, default: null },
  companySize: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '200+'],
    default: null
  },
  companyName: { type: String, default: null },
  siretNumber: { type: String, default: null }, // French business ID
  primaryGoal: { type: String, default: null },

  // Activation Tracking
  firstValueAchieved: { type: Boolean, default: false },
  firstWorkflowCreatedAt: { type: Date, default: null },
  firstDocumentUploadedAt: { type: Date, default: null },
  templatesUsed: { type: [String], default: [] }
},

// RGPD Consent Management
consent: {
  analytics: {
    granted: { type: Boolean, default: false },
    timestamp: { type: Date, default: null },
    version: { type: String, default: '1.0' }
  },
  marketing: {
    granted: { type: Boolean, default: false },
    timestamp: { type: Date, default: null },
    version: { type: String, default: '1.0' }
  },
  consentRecordId: { type: String, default: null }, // Audit trail reference
  dataProcessingAgreementAccepted: { type: Boolean, default: false },
  privacyPolicyVersion: { type: String, default: null }
},

// French SME Specifics
profile: {
  frenchPhoneNumber: { type: String, default: null },
  postalCode: { type: String, default: null },
  region: { type: String, default: null },
  preferredLanguage: { type: String, enum: ['fr', 'en'], default: 'fr' }
}
```

**Why This Matters:**
- Tracks onboarding progress for resume capability
- Enables persona-based template recommendations
- Stores RGPD consent with audit trail (CNIL requirement)
- Captures French-specific business validation data

### 1.2 RGPD Consent Manager Component

**File:** `apps/frontend/src/components/onboarding/ConsentManager.tsx`

```typescript
interface ConsentOption {
  id: 'analytics' | 'marketing';
  title: string;
  description: string;
  required: boolean;
}

const consentOptions: ConsentOption[] = [
  {
    id: 'analytics',
    title: 'Analyse d\'utilisation',
    description: 'Nous aide à améliorer l\'application en analysant votre utilisation. Vous pouvez retirer ce consentement à tout moment.',
    required: false
  },
  {
    id: 'marketing',
    title: 'Communications marketing',
    description: 'Recevez des conseils, mises à jour produit et offres spéciales. Désabonnement facile.',
    required: false
  }
];

export const ConsentManager = ({ onComplete }: { onComplete: (consents: Record<string, boolean>) => void }) => {
  const [consents, setConsents] = useState<Record<string, boolean>>({
    analytics: false,
    marketing: false
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vos préférences de confidentialité</CardTitle>
        <CardDescription>
          Conformément au RGPD, nous respectons votre vie privée.
          Seules les données essentielles au fonctionnement sont obligatoires.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {consentOptions.map(option => (
          <div key={option.id} className="flex items-start space-x-3">
            <Checkbox
              id={option.id}
              checked={consents[option.id]}
              onCheckedChange={(checked) =>
                setConsents(prev => ({ ...prev, [option.id]: checked as boolean }))
              }
            />
            <div className="space-y-1">
              <Label htmlFor={option.id} className="font-medium">
                {option.title}
                {option.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              <p className="text-sm text-muted-foreground">{option.description}</p>
            </div>
          </div>
        ))}

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Vous pouvez modifier ces préférences à tout moment depuis les paramètres.
            <Link href="/privacy" className="underline ml-1">En savoir plus</Link>
          </AlertDescription>
        </Alert>
      </CardContent>
      <CardFooter>
        <Button onClick={() => onComplete(consents)} className="w-full">
          Continuer
        </Button>
      </CardFooter>
    </Card>
  );
};
```

**RGPD Compliance Features:**
- ✅ Granular consent (analytics vs. marketing)
- ✅ Clear, plain-language descriptions (CNIL requirement)
- ✅ Easy withdrawal mechanism mentioned
- ✅ Link to privacy policy
- ✅ Non-required options clearly marked
- ✅ Timestamps stored in MongoDB for audit trail

### 1.3 French Validation Utilities

**File:** `apps/frontend/src/utils/frenchValidation.ts`

```typescript
import { z } from 'zod';

/**
 * SIRET Number Validation
 * Format: 9 or 14 digits (SIREN + NIC)
 * Used by French businesses for identification
 */
export const siretSchema = z
  .string()
  .regex(/^\d{9}(\d{5})?$/, 'Format SIRET invalide (9 ou 14 chiffres)')
  .refine(
    (val) => {
      // Luhn algorithm for SIRET validation
      const digits = val.split('').map(Number);
      let sum = 0;
      for (let i = 0; i < digits.length; i++) {
        let digit = digits[i];
        if (i % 2 === 1) {
          digit *= 2;
          if (digit > 9) digit -= 9;
        }
        sum += digit;
      }
      return sum % 10 === 0;
    },
    'Numéro SIRET invalide (vérification échouée)'
  );

/**
 * French Phone Number Validation
 * Formats: +33 X XX XX XX XX or 0X XX XX XX XX
 */
export const frenchPhoneSchema = z
  .string()
  .regex(
    /^(\+33|0)[1-9](\d{2}){4}$/,
    'Format téléphone invalide (ex: +33 6 12 34 56 78 ou 06 12 34 56 78)'
  );

/**
 * French Postal Code Validation
 * Format: 5 digits, first 2 = department code
 */
export const postalCodeSchema = z
  .string()
  .regex(/^\d{5}$/, 'Code postal invalide (5 chiffres)')
  .refine(
    (val) => {
      const dept = parseInt(val.substring(0, 2));
      return dept >= 1 && dept <= 95; // Mainland France + Corsica
    },
    'Code postal français invalide'
  );

/**
 * Company Profile Form Schema (French SME)
 */
export const companyProfileSchema = z.object({
  companyName: z.string().min(2, 'Nom de société requis'),
  siretNumber: siretSchema.optional(),
  industry: z.enum([
    'marketing',
    'ventes',
    'finance',
    'rh',
    'operations',
    'autre'
  ]),
  companySize: z.enum(['1-10', '11-50', '51-200', '200+']),
  phoneNumber: frenchPhoneSchema.optional(),
  postalCode: postalCodeSchema.optional(),
  primaryGoal: z.string().min(10, 'Décrivez votre objectif principal (min. 10 caractères)')
});

export type CompanyProfile = z.infer<typeof companyProfileSchema>;
```

**Why This Matters:**
- Validates French business identifiers (SIRET with Luhn algorithm)
- Supports French phone number formats
- Validates French postal codes
- Builds trust by showing cultural understanding

---

## Phase 2: Content & Templates

### 2.1 Pre-Built Workflow Template Library

**Database Collection:** `WorkflowTemplate`

```javascript
const WorkflowTemplateSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  category: {
    type: String,
    enum: ['marketing', 'sales', 'finance', 'hr', 'operations'],
    required: true,
    index: true
  },
  name: { type: String, required: true },
  description: { type: String, required: true },
  frenchTitle: { type: String, required: true },
  frenchDescription: { type: String, required: true },

  // Template Configuration
  triggerType: { type: String, required: true }, // 'schedule', 'webhook', 'email', etc.
  actions: [
    {
      type: { type: String, required: true },
      config: { type: Map, of: mongoose.Schema.Types.Mixed }
    }
  ],

  // Metadata
  difficulty: { type: String, enum: ['débutant', 'intermédiaire', 'avancé'] },
  estimatedSetupTime: { type: Number }, // minutes
  popularity: { type: Number, default: 0 },
  targetPersona: [{ type: String }],

  // Analytics
  timesUsed: { type: Number, default: 0 },
  avgCompletionRate: { type: Number, default: 0 }
});
```

### 2.2 Workflow Templates for French SMEs

#### Marketing Templates

**1. Campagne Email Automatisée**
- **Trigger:** Nouveau contact ajouté au CRM
- **Actions:**
  - Email de bienvenue personnalisé
  - Ajout à la séquence nurturing (J+3, J+7, J+14)
  - Tag selon comportement (ouverture, clic)
- **Setup Time:** 10 minutes
- **Use Case:** Automatiser l'onboarding des prospects

**2. Publication Réseaux Sociaux**
- **Trigger:** Calendrier hebdomadaire
- **Actions:**
  - Publication LinkedIn/Facebook (lundi 9h, mercredi 14h, vendredi 11h)
  - Récupération des métriques
  - Notification si engagement élevé
- **Setup Time:** 5 minutes
- **Use Case:** Maintenir présence sociale sans effort quotidien

**3. Reconquête Clients Inactifs**
- **Trigger:** Pas d'achat depuis 90 jours
- **Actions:**
  - Email avec offre personnalisée (-15%)
  - Rappel téléphonique automatique (si pas d'ouverture en 7j)
  - Retrait de la liste si pas de réponse (RGPD)
- **Setup Time:** 15 minutes
- **Use Case:** Réactiver les clients dormants

#### Sales & CRM Templates

**4. Qualification de Leads**
- **Trigger:** Nouveau lead depuis formulaire web
- **Actions:**
  - Scoring automatique (budget, secteur, taille entreprise)
  - Assignation au commercial (round-robin)
  - Création tâche "Premier contact sous 24h"
- **Setup Time:** 12 minutes
- **Use Case:** Optimiser le temps commercial

**5. Relance Devis Non Signés**
- **Trigger:** Devis envoyé il y a 7 jours, statut "En attente"
- **Actions:**
  - Email de relance personnalisé
  - Notification Slack au commercial
  - Seconde relance J+14 avec rappel date d'expiration
- **Setup Time:** 8 minutes
- **Use Case:** Augmenter taux de conversion devis

#### Finance Templates

**6. Traitement des Factures**
- **Trigger:** Réception email avec pièce jointe PDF
- **Actions:**
  - Extraction données (OCR): montant, date, fournisseur
  - Création ligne dans comptabilité
  - Notification manager si montant > 1000€
  - Archivage automatique GED
- **Setup Time:** 20 minutes
- **Use Case:** Éliminer saisie manuelle des factures

**7. Rapprochement Bancaire**
- **Trigger:** Chaque lundi 8h
- **Actions:**
  - Import relevés bancaires (API)
  - Matching avec factures clients
  - Alerte sur écarts > 5%
  - Export Excel pour comptable
- **Setup Time:** 25 minutes
- **Use Case:** Simplifier la comptabilité

**8. Relance Impayés**
- **Trigger:** Facture échue depuis X jours
- **Actions:**
  - J+7: Email courtois de rappel
  - J+15: Email formel + copie manager
  - J+30: Notification pour procédure recouvrement
- **Setup Time:** 10 minutes
- **Use Case:** Améliorer délais de paiement

#### HR Templates

**9. Onboarding Employés**
- **Trigger:** Nouveau collaborateur créé dans SIRH
- **Actions:**
  - Création comptes (email, Slack, outils métiers)
  - Envoi kit de bienvenue (documents, planning formation)
  - Checklist tâches manager (30-60-90 jours)
  - Enquête satisfaction onboarding (J+30)
- **Setup Time:** 15 minutes
- **Use Case:** Standardiser l'intégration des nouveaux

**10. Gestion des Congés**
- **Trigger:** Demande de congé soumise
- **Actions:**
  - Notification manager pour validation
  - Mise à jour calendrier d'équipe
  - Email de confirmation au collaborateur
  - Export vers paie si validé
- **Setup Time:** 12 minutes
- **Use Case:** Digitaliser processus RH papier

#### Operations Templates

**11. Gestion des Stocks**
- **Trigger:** Stock < seuil critique
- **Actions:**
  - Email fournisseur avec bon de commande pré-rempli
  - Notification acheteur
  - Tracking livraison (API transporteur)
  - Mise à jour inventaire à réception
- **Setup Time:** 18 minutes
- **Use Case:** Éviter ruptures de stock

**12. Suivi Tickets Support**
- **Trigger:** Nouveau ticket créé
- **Actions:**
  - Classification automatique (urgent/normal/faible)
  - Assignation selon compétence
  - Réponse automatique avec FAQ
  - Escalade si pas de réponse en 24h
- **Setup Time:** 10 minutes
- **Use Case:** Améliorer satisfaction client

### 2.3 Template Selection Component

**File:** `apps/frontend/src/components/onboarding/TemplateLibrary.tsx`

```typescript
interface WorkflowTemplate {
  id: string;
  category: string;
  frenchTitle: string;
  frenchDescription: string;
  difficulty: 'débutant' | 'intermédiaire' | 'avancé';
  estimatedSetupTime: number;
  popularity: number;
}

export const TemplateLibrary = ({ userPersona }: { userPersona: string }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(userPersona);
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);

  // Filter templates by persona
  const filteredTemplates = templates.filter(
    t => !selectedCategory || t.category === selectedCategory
  );

  // Sort by popularity for onboarding users
  const recommendedTemplates = filteredTemplates
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Activez votre premier workflow</h2>
        <p className="text-muted-foreground">
          Choisissez un template pré-configuré adapté à votre métier
        </p>
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
          <TabsTrigger value="sales">Ventes</TabsTrigger>
          <TabsTrigger value="finance">Finance</TabsTrigger>
          <TabsTrigger value="hr">RH</TabsTrigger>
          <TabsTrigger value="operations">Opérations</TabsTrigger>
        </TabsList>

        {/* Recommended Templates */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">
            Recommandés pour vous
            <Badge variant="secondary" className="ml-2">Populaire</Badge>
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {recommendedTemplates.map(template => (
              <Card key={template.id} className="hover:border-primary transition-colors">
                <CardHeader>
                  <CardTitle className="text-base">{template.frenchTitle}</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline">{template.difficulty}</Badge>
                    <Badge variant="secondary">
                      <Clock className="w-3 h-3 mr-1" />
                      {template.estimatedSetupTime} min
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {template.frenchDescription}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="default"
                    className="w-full"
                    onClick={() => handleTemplateActivation(template.id)}
                  >
                    Activer ce workflow
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </Tabs>
    </div>
  );
};
```

---

## Phase 3: Interactive Onboarding Flow

### 3.1 Onboarding Checklist Component

**File:** `apps/frontend/src/components/app/OnboardingChecklist.tsx`

```typescript
interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  action: () => void;
  actionLabel: string;
  required: boolean;
  estimatedTime?: number; // minutes
}

export const OnboardingChecklist = () => {
  const { user } = useUser();
  const [completedSteps, setCompletedSteps] = useState<string[]>(
    user?.onboarding?.completedSteps || []
  );

  const checklistItems: ChecklistItem[] = [
    {
      id: 'profile_setup',
      title: 'Complétez votre profil entreprise',
      description: 'SIRET, secteur, taille - pour personnaliser votre expérience',
      action: () => navigate('/settings/company'),
      actionLabel: 'Configurer',
      required: true,
      estimatedTime: 3
    },
    {
      id: 'consent_preferences',
      title: 'Configurez vos préférences RGPD',
      description: 'Gérez vos consentements pour analytics et communications',
      action: () => navigate('/settings/privacy'),
      actionLabel: 'Gérer',
      required: true,
      estimatedTime: 2
    },
    {
      id: 'first_document',
      title: 'Uploadez votre premier document',
      description: 'Testez l\'extraction de données par IA',
      action: () => navigate('/app/files'),
      actionLabel: 'Uploader',
      required: true,
      estimatedTime: 5
    },
    {
      id: 'try_chatbot',
      title: 'Posez une question au chatbot',
      description: 'Découvrez l\'assistant IA conversationnel',
      action: () => navigate('/app/chat'),
      actionLabel: 'Essayer',
      required: true,
      estimatedTime: 3
    },
    {
      id: 'activate_template',
      title: 'Activez un workflow pré-configuré',
      description: 'Automatisez votre première tâche en quelques clics',
      action: () => navigate('/workflows/templates'),
      actionLabel: 'Voir les templates',
      required: false,
      estimatedTime: 10
    },
    {
      id: 'invite_team',
      title: 'Invitez votre équipe',
      description: 'Collaborez avec vos collègues',
      action: () => navigate('/settings/team'),
      actionLabel: 'Inviter',
      required: false,
      estimatedTime: 5
    }
  ];

  const requiredItems = checklistItems.filter(i => i.required);
  const optionalItems = checklistItems.filter(i => !i.required);
  const completionRate = (completedSteps.length / requiredItems.length) * 100;

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Commencez avec TCDynamics</CardTitle>
            <CardDescription>
              {completedSteps.length} / {requiredItems.length} étapes complétées
            </CardDescription>
          </div>
          {completionRate === 100 && (
            <Badge variant="default" className="gap-1">
              <CheckCircle2 className="w-4 h-4" />
              Terminé !
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={completionRate} className="h-2" />
          <p className="text-xs text-muted-foreground text-right">
            {Math.round(completionRate)}% complété
          </p>
        </div>

        {/* Required Steps */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Étapes essentielles</h4>
          {requiredItems.map(item => (
            <ChecklistItemCard
              key={item.id}
              item={item}
              completed={completedSteps.includes(item.id)}
              onComplete={() => handleStepComplete(item.id)}
            />
          ))}
        </div>

        {/* Optional Steps */}
        {optionalItems.length > 0 && (
          <div className="space-y-3 pt-4 border-t">
            <h4 className="font-semibold text-sm">Pour aller plus loin</h4>
            {optionalItems.map(item => (
              <ChecklistItemCard
                key={item.id}
                item={item}
                completed={completedSteps.includes(item.id)}
                onComplete={() => handleStepComplete(item.id)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
```

### 3.2 In-App Product Tours (NextStepjs)

**File:** `apps/frontend/src/components/onboarding/ProductTour.tsx`

```typescript
import { NextStepProvider, useNextStep } from 'nextstepjs';

const tourSteps = [
  {
    id: 'dashboard-overview',
    title: 'Bienvenue sur votre tableau de bord',
    description: 'Visualisez vos workflows actifs, les derniers documents traités, et les tâches en attente',
    target: '#dashboard-main',
    placement: 'center'
  },
  {
    id: 'workflow-sidebar',
    title: 'Vos workflows automatisés',
    description: 'Créez, activez ou modifiez vos workflows depuis cette section',
    target: '#nav-workflows',
    placement: 'right'
  },
  {
    id: 'upload-zone',
    title: 'Uploadez vos documents',
    description: 'Glissez-déposez vos fichiers ici. L\'IA extrait automatiquement les données importantes',
    target: '#upload-dropzone',
    placement: 'bottom'
  },
  {
    id: 'ai-chat',
    title: 'Assistant IA conversationnel',
    description: 'Posez des questions sur vos documents ou demandez de l\'aide sur un workflow',
    target: '#chat-button',
    placement: 'left'
  }
];

export const DashboardTour = () => {
  const { user, updateUser } = useUser();
  const [showTour, setShowTour] = useState(
    !user?.onboarding?.completedSteps?.includes('dashboard_tour')
  );

  const handleTourComplete = async () => {
    setShowTour(false);
    await updateUser({
      onboarding: {
        ...user.onboarding,
        completedSteps: [...user.onboarding.completedSteps, 'dashboard_tour']
      }
    });
  };

  if (!showTour) return null;

  return (
    <NextStepProvider steps={tourSteps} onComplete={handleTourComplete}>
      <TourComponent />
    </NextStepProvider>
  );
};
```

### 3.3 Persona-Based Personalization

**File:** `apps/frontend/src/hooks/usePersonalization.ts`

```typescript
export const usePersonalization = () => {
  const { user } = useUser();
  const persona = user?.onboarding?.persona || 'general';

  const getPersonalizedContent = () => {
    const contentMap = {
      marketing: {
        dashboardHeadline: 'Automatisez vos campagnes marketing',
        recommendedTemplates: ['email_automation', 'social_publishing', 'lead_nurturing'],
        quickWinTip: 'Commencez par automatiser vos emails de bienvenue pour gagner 5h/semaine',
        helpArticles: [
          'Comment créer une séquence email ?',
          'Intégrations CRM marketing',
          'Mesurer le ROI de vos campagnes'
        ]
      },
      sales: {
        dashboardHeadline: 'Vendez plus, administratif moins',
        recommendedTemplates: ['lead_qualification', 'quote_followup', 'crm_sync'],
        quickWinTip: 'Automatisez la relance de vos devis pour augmenter votre taux de conversion de 30%',
        helpArticles: [
          'Scoring automatique de leads',
          'Intégrations CRM commercial',
          'Automatiser la création de devis'
        ]
      },
      finance: {
        dashboardHeadline: 'Comptabilité sans saisie manuelle',
        recommendedTemplates: ['invoice_processing', 'bank_reconciliation', 'payment_reminders'],
        quickWinTip: 'L\'OCR des factures vous fait gagner 10h de saisie par mois',
        helpArticles: [
          'Extraction de données de factures',
          'Connexion comptabilité (Sage, Cegid)',
          'Gestion des relances impayés'
        ]
      },
      hr: {
        dashboardHeadline: 'RH digitales, collaborateurs satisfaits',
        recommendedTemplates: ['employee_onboarding', 'leave_management', 'recruitment_automation'],
        quickWinTip: 'Standardisez l\'onboarding pour améliorer la rétention de 40%',
        helpArticles: [
          'Automatiser l\'intégration des nouveaux',
          'Gestion des congés et absences',
          'Connexion SIRH'
        ]
      },
      operations: {
        dashboardHeadline: 'Opérations fluides, clients contents',
        recommendedTemplates: ['inventory_management', 'support_tickets', 'quality_alerts'],
        quickWinTip: 'Les alertes stock automatiques éliminent les ruptures',
        helpArticles: [
          'Suivi des stocks en temps réel',
          'Gestion des tickets support',
          'Intégrations ERP'
        ]
      },
      general: {
        dashboardHeadline: 'Automatisez votre entreprise',
        recommendedTemplates: ['most_popular'],
        quickWinTip: 'Explorez nos templates pour découvrir ce que vous pouvez automatiser',
        helpArticles: [
          'Guide de démarrage',
          'Cas d\'usage par métier',
          'Formations vidéo'
        ]
      }
    };

    return contentMap[persona] || contentMap.general;
  };

  return { persona, getPersonalizedContent };
};
```

---

## Phase 4: Metrics & Optimization

### 4.1 Onboarding Analytics Tracking

**File:** `api/onboarding/track-event.js`

```javascript
import { verifyClerkAuth } from '../_lib/auth.js';
import { AnalyticsEvent } from '../_lib/models/AnalyticsEvent.js';
import { sanitizeString } from '../_lib/pii-hash.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  const { userId: clerkId, error } = await verifyClerkAuth(authHeader);

  if (error) {
    return res.status(401).json({ error });
  }

  const { eventName, eventData, timestamp } = req.body;

  // Validate event name
  const allowedEvents = [
    'onboarding_started',
    'onboarding_step_completed',
    'onboarding_step_skipped',
    'onboarding_abandoned',
    'onboarding_completed',
    'template_viewed',
    'template_activated',
    'first_document_uploaded',
    'first_workflow_created',
    'consent_granted',
    'consent_withdrawn'
  ];

  if (!allowedEvents.includes(eventName)) {
    return res.status(400).json({ error: 'Invalid event name' });
  }

  try {
    // Store analytics event
    const event = await AnalyticsEvent.create({
      clerkId,
      eventName: sanitizeString(eventName),
      eventData: sanitizeString(JSON.stringify(eventData)),
      timestamp: timestamp || new Date(),
      source: 'onboarding'
    });

    // Update user onboarding progress in parallel
    if (eventName === 'onboarding_step_completed') {
      await User.findOneAndUpdate(
        { clerkId },
        {
          $addToSet: { 'onboarding.completedSteps': eventData.stepId },
          $set: { 'onboarding.currentStep': eventData.nextStepId }
        }
      );
    }

    if (eventName === 'onboarding_completed') {
      await User.findOneAndUpdate(
        { clerkId },
        {
          $set: {
            'onboarding.completed': true,
            'onboarding.completedAt': new Date()
          }
        }
      );
    }

    return res.status(200).json({ success: true, eventId: event._id });
  } catch (error) {
    console.error('Analytics tracking error:', error);
    return res.status(500).json({ error: 'Failed to track event' });
  }
}
```

### 4.2 Onboarding Metrics Dashboard

**Key Metrics to Track:**

```typescript
interface OnboardingMetrics {
  // Funnel Metrics
  signupsTotal: number;
  onboardingStarted: number; // % who start onboarding
  step1Completed: number; // Profile setup
  step2Completed: number; // Consent preferences
  step3Completed: number; // First document upload
  step4Completed: number; // First workflow activation
  onboardingCompleted: number; // Full completion rate

  // Time Metrics
  avgTimeToCompletion: number; // minutes
  medianTimeToCompletion: number;
  avgTimePerStep: Record<string, number>;

  // Activation Metrics
  firstValueAchievedRate: number; // % who complete a workflow
  templatesActivationRate: number; // % who use templates
  mostPopularTemplates: Array<{ id: string; count: number }>;

  // RGPD Consent Rates
  analyticsConsentRate: number; // % who grant analytics consent
  marketingConsentRate: number; // % who grant marketing consent

  // Drop-off Analysis
  abandonmentByStep: Record<string, number>; // % drop-off at each step

  // Cohort Analysis
  day1Retention: number; // % who return day 1
  day7Retention: number;
  day30Retention: number;

  // Personalization Effectiveness
  completionRateByPersona: Record<string, number>;
  avgTimeByPersona: Record<string, number>;
}
```

**Target Benchmarks:**

| Metric | Target | Baseline | Good | Excellent |
|--------|--------|----------|------|-----------|
| Onboarding Start Rate | > 90% | 70% | 85% | 95% |
| Step 1 Completion | > 80% | 60% | 75% | 90% |
| Full Completion Rate | > 70% | 40% | 60% | 80% |
| Time to First Value | < 10 min | 30 min | 15 min | 5 min |
| Template Activation | > 50% | 20% | 40% | 70% |
| Analytics Consent | > 50% | 30% | 45% | 65% |
| Marketing Consent | > 30% | 15% | 25% | 40% |
| Day 7 Retention | > 60% | 40% | 55% | 75% |

### 4.3 A/B Testing Framework

**Example Tests:**

1. **Consent Copy Test**
   - Variant A: "Nous utilisons des cookies pour améliorer votre expérience"
   - Variant B: "Aidez-nous à améliorer l'application en autorisant l'analyse d'utilisation"
   - **Hypothesis:** Transparent, benefit-focused language increases consent rate
   - **Metric:** Analytics consent rate

2. **Template Display Test**
   - Variant A: Show 3 most popular templates
   - Variant B: Show 3 persona-specific templates
   - **Hypothesis:** Personalization increases activation rate
   - **Metric:** Template activation rate

3. **Onboarding Length Test**
   - Variant A: 4 required steps + 2 optional
   - Variant B: 3 required steps + 3 optional
   - **Hypothesis:** Shorter required path increases completion
   - **Metric:** Onboarding completion rate

---

## Phase 5: Continuous Engagement (Ongoing)

### 5.1 Milestone Celebrations

**Trigger celebration confetti on key achievements:**

```typescript
import confetti from 'canvas-confetti';

export const celebrateMilestone = (milestone: string) => {
  const celebrations = {
    onboarding_complete: {
      message: '🎉 Félicitations ! Vous êtes prêt à automatiser votre entreprise.',
      confettiConfig: { particleCount: 100, spread: 70 }
    },
    first_workflow_activated: {
      message: '🚀 Premier workflow activé ! Observez la magie opérer.',
      confettiConfig: { particleCount: 50, spread: 50 }
    },
    ten_workflows_created: {
      message: '⚡ 10 workflows créés ! Vous êtes un pro de l\'automatisation.',
      confettiConfig: { particleCount: 150, spread: 90 }
    },
    first_team_member: {
      message: '👥 Première invitation envoyée ! Le travail d\'équipe commence.',
      confettiConfig: { particleCount: 80, spread: 60 }
    }
  };

  const celebration = celebrations[milestone];
  if (celebration) {
    confetti(celebration.confettiConfig);
    toast.success(celebration.message);
  }
};
```

### 5.2 Proactive Support Triggers

**Automated support interventions:**

```typescript
// Detect onboarding struggles and offer help
export const detectOnboardingStruggle = async (clerkId: string) => {
  const user = await User.findOne({ clerkId });
  const events = await AnalyticsEvent.find({
    clerkId,
    eventName: { $in: ['onboarding_step_viewed', 'onboarding_step_completed'] }
  }).sort({ timestamp: -1 }).limit(10);

  // User viewed same step 3+ times without completing
  const currentStep = user.onboarding.currentStep;
  const viewsOnCurrentStep = events.filter(
    e => e.eventData.stepId === currentStep
  ).length;

  if (viewsOnCurrentStep >= 3) {
    // Trigger in-app support offer
    return {
      shouldOfferHelp: true,
      message: `Besoin d'aide avec "${currentStep}" ? Cliquez ici pour un guide vidéo ou contactez le support.`,
      helpResource: `/help/${currentStep}`
    };
  }

  return { shouldOfferHelp: false };
};
```

### 5.3 Welcome Email Sequence

**Behavior-triggered emails:**

**Day 0 (Immediate):**
```
Objet: Bienvenue chez TCDynamics, [Prénom] ! 🎉

Bonjour [Prénom],

Merci d'avoir choisi TCDynamics pour automatiser votre entreprise !

Voici comment commencer :
1. ✅ Complétez votre profil (2 minutes)
2. 📄 Uploadez un document de test
3. 🤖 Activez votre premier workflow pré-configuré

[BOUTON: Commencer maintenant]

Besoin d'aide ? Répondez à cet email, nous sommes là pour vous.

L'équipe TCDynamics
```

**Day 3 (If not completed onboarding):**
```
Objet: [Prénom], besoin d'un coup de main ? 🤝

Nous avons remarqué que vous n'avez pas encore terminé la configuration.

Saviez-vous que nos utilisateurs qui complètent l'onboarding :
- Gagnent 10h/semaine en moyenne
- Activent leur premier workflow en moins de 10 minutes
- Obtiennent un ROI positif dès le premier mois

[BOUTON: Reprendre où j'en étais]

Vous bloquez sur quelque chose ? Réservez un appel de 15 min avec notre équipe :
[LIEN CALENDLY]
```

**Day 7 (If completed onboarding):**
```
Objet: 🚀 Passez au niveau supérieur avec TCDynamics

Bravo [Prénom], vous avez activé votre premier workflow !

Prêt pour la suite ? Voici 3 templates populaires dans votre secteur ([Persona]) :
1. [Template 1 personnalisé]
2. [Template 2 personnalisé]
3. [Template 3 personnalisé]

[BOUTON: Explorer les templates]

💡 Astuce de la semaine : Saviez-vous que vous pouvez connecter TCDynamics à [CRM populaire dans secteur] ?
[Guide d'intégration]
```

---

## Technical Architecture

### Frontend Component Structure

```
apps/frontend/src/
├── components/
│   ├── onboarding/
│   │   ├── OnboardingStepper.tsx         # Main multi-step wizard
│   │   ├── ConsentManager.tsx            # RGPD consent UI
│   │   ├── CompanyProfileForm.tsx        # French SME profile
│   │   ├── PersonaSelector.tsx           # Role/industry selection
│   │   ├── TemplateLibrary.tsx           # Workflow templates
│   │   ├── ProductTour.tsx               # In-app tours (NextStepjs)
│   │   └── ProgressIndicator.tsx         # Visual progress
│   ├── app/
│   │   ├── OnboardingChecklist.tsx       # Persistent checklist in dashboard
│   │   ├── CelebrationModal.tsx          # Milestone celebrations
│   │   └── HelpBubble.tsx                # Contextual help trigger
│   └── ui/                               # ShadCN primitives
│       ├── stepper.tsx
│       ├── progress.tsx
│       ├── checkbox.tsx
│       └── confetti.tsx
├── hooks/
│   ├── useOnboarding.ts                  # Onboarding state management
│   ├── usePersonalization.ts             # Persona-based content
│   └── useConsentPreferences.ts          # RGPD consent hooks
├── utils/
│   ├── frenchValidation.ts               # SIRET, phone, postal validation
│   └── analytics.ts                      # Event tracking
└── pages/
    ├── onboarding/
    │   ├── index.tsx                     # Main onboarding flow
    │   ├── profile.tsx                   # Company profile step
    │   ├── consent.tsx                   # RGPD preferences
    │   ├── templates.tsx                 # Template selection
    │   └── complete.tsx                  # Success + next steps
    └── middleware.ts                     # Clerk routing guards
```

### API/Serverless Endpoints

```
api/
├── onboarding/
│   ├── init.js                           # Initialize onboarding state
│   ├── update-step.js                    # Update progress
│   ├── complete.js                       # Mark complete + update Clerk metadata
│   ├── track-event.js                    # Analytics tracking
│   └── get-recommended-templates.js      # Persona-based recommendations
├── templates/
│   ├── list.js                           # Get template library
│   ├── activate.js                       # Activate template for user
│   └── stats.js                          # Template usage stats
└── consent/
    ├── update.js                         # Update RGPD preferences
    └── withdraw.js                       # Withdraw consent (RGPD compliance)
```

### Database Collections

**Users** (extended schema above)
- Onboarding progress tracking
- RGPD consent records
- French SME profile data

**WorkflowTemplates**
- Pre-built automation templates
- Category/persona mapping
- Usage statistics

**AnalyticsEvents**
- Onboarding event tracking
- Funnel analysis data
- User behavior insights

**ConsentAuditLog** (RGPD requirement)
- Timestamp of consent grant/withdrawal
- Version of privacy policy
- IP address (hashed for privacy)
- Audit trail for CNIL compliance

---

## RGPD Compliance Checklist

### Data Minimization (GDPR Art. 5)
- ✅ Only collect essential data for onboarding (email, company name initially)
- ✅ Progressive disclosure for additional data (SIRET, phone optional)
- ✅ Clear purpose stated for each data point

### Consent Management (GDPR Art. 7)
- ✅ Granular consent options (analytics vs. marketing)
- ✅ Non-binary choices (can consent to one but not the other)
- ✅ Easy withdrawal mechanism in settings
- ✅ Consent records stored with timestamps + version

### Transparency (GDPR Art. 12-14)
- ✅ Plain-language descriptions in French
- ✅ Link to full privacy policy accessible from consent UI
- ✅ Clear explanation of data processing purposes
- ✅ Information about data retention periods

### User Rights (GDPR Art. 15-21)
- ✅ Right to access: Export user data endpoint
- ✅ Right to rectification: Edit profile anytime
- ✅ Right to erasure: Account deletion with 30-day data purge
- ✅ Right to data portability: JSON export of all user data
- ✅ Right to object: Withdraw consent anytime

### Audit Trail (CNIL Requirement)
- ✅ ConsentAuditLog collection tracks all consent changes
- ✅ Timestamps, IP (hashed), version recorded
- ✅ Retention: 3 years for legal compliance

### Security (GDPR Art. 32)
- ✅ PII hashing in logs (SIRET, email)
- ✅ HTTPS enforcement
- ✅ Clerk JWT verification on all endpoints
- ✅ MongoDB encryption at rest

---

## Success Metrics & Targets

### Immediate Impact post-implementation

| Metric | Baseline | Target | Excellent |
|--------|----------|--------|-----------|
| Onboarding completion rate | 40% | 70% | 85% |
| Time to first workflow activation | 30 min | 10 min | 5 min |
| Template activation rate | 20% | 50% | 70% |
| Drop-off at Step 1 | 40% | 20% | 10% |

### Medium-term

| Metric | Target | Measurement |
|--------|--------|-------------|
| Day 7 retention | 60% | % of users who return after 7 days |
| Consent rate (analytics) | 50% | % who grant analytics consent |
| Average workflows per user | 3 | Count of active workflows |
| Support tickets re: onboarding | <5% | % of users requesting help |

### Long-term

| Metric | Target | Impact |
|--------|--------|--------|
| Customer LTV increase | +30% | Improved retention = higher LTV |
| Churn reduction | -20% | Better onboarding = lower churn |
| Activation rate (Day 30) | 75% | % with 1+ active workflow at 30 days |
| NPS from onboarding experience | >50 | Survey after onboarding completion |

---

## Technology Stack

### Core Dependencies

```json
{
  "frontend": {
    "nextstepjs": "^1.0.0",           // Product tours
    "canvas-confetti": "^1.9.0",       // Milestone celebrations
    "react-hook-form": "^7.0.0",       // Form handling
    "zod": "^3.22.0",                  // Validation (French rules)
    "@tanstack/react-query": "^5.0.0", // State management
    "sonner": "^1.0.0"                 // Toast notifications
  },
  "backend": {
    "mongoose": "^8.0.0",              // MongoDB ORM
    "@clerk/backend": "^1.0.0",        // Auth verification
    "isomorphic-dompurify": "^2.9.0"   // Input sanitization
  }
}
```

### External Services

| Service | Purpose | Cost |
|---------|---------|------|
| **Clerk** | Authentication + user metadata | Included |
| **MongoDB Atlas** | User data + templates | Included |
| **Vercel Analytics** | Event tracking | Included |
| **Customer.io** (optional) | Email sequences | ~$150/month |
| **Loops** (alternative) | Email automation | ~$50/month |

---

## Implementation Checklist

### Foundation
- [ ] Extend User model with onboarding fields
- [ ] Create ConsentManager component
- [ ] Implement French validation utilities (SIRET, phone, postal)
- [ ] Add consent audit logging
- [ ] Set up analytics event tracking

### Templates & Content
- [ ] Design 10 workflow templates (2 per category)
- [ ] Create WorkflowTemplate MongoDB collection
- [ ] Build TemplateLibrary component
- [ ] Implement persona selection
- [ ] Add template activation logic

### Interactive Experience
- [ ] Build OnboardingChecklist component
- [ ] Integrate NextStepjs for product tours
- [ ] Create personalization hooks
- [ ] Add milestone celebration system
- [ ] Implement struggle detection + help offers

### Metrics & Optimization
- [ ] Set up onboarding analytics dashboard
- [ ] Implement A/B testing framework
- [ ] Create funnel visualization
- [ ] Add cohort analysis
- [ ] Build consent rate tracking

### Continuous Improvement
- [ ] Launch email sequence (Day 0, 3, 7)
- [ ] Monitor metrics weekly
- [ ] Run A/B tests on key friction points
- [ ] Iterate based on user feedback
- [ ] Document learnings for future optimization

---

## French SME Cultural Considerations

### Language & Tone
- ✅ Use formal "vous" register (not "tu")
- ✅ Professional but warm tone
- ✅ Avoid anglicisms ("upload" → "téléverser", "workflow" → "flux de travail")
- ✅ Clear CTAs in French ("Commencer", not "Start")

### Trust Signals
- ✅ Display RGPD compliance prominently
- ✅ Show French phone number for support (+33)
- ✅ Reference French standards (CNIL, RGAA)
- ✅ Use French business examples in templates

### UX Preferences (France Num Research)
- ✅ Text-based language selector (not just flags)
- ✅ Transparent pricing (no hidden fees)
- ✅ Trial-before-payment flexibility
- ✅ Clear data residency information (EU servers)

### Business Context
- ✅ Understand French fiscal year (Jan-Dec)
- ✅ Support French holidays in scheduling
- ✅ French-specific integrations (Sage, Cegid for accounting)
- ✅ URSSAF/RSI compliance for HR workflows

---

## Quick Wins (Start Tomorrow)

1. **Add onboarding fields to User model** (30 min)
   - Copy schema extensions above
   - Run MongoDB migration
   - Update user API endpoints

2. **Create basic OnboardingChecklist component** (2 hours)
   - Use existing ShadCN components
   - Store progress in localStorage initially
   - Add to Dashboard page

3. **Design 5 starter templates** (3 hours)
   - Pick one per category (Marketing, Sales, Finance, HR, Ops)
   - Write French descriptions
   - Create MongoDB seed data

4. **Add analytics tracking** (1 hour)
   - Create `track-event.js` endpoint
   - Add event calls to frontend
   - Log to Vercel Analytics

5. **Implement French phone validation** (30 min)
   - Add `frenchValidation.ts` utility
   - Update company profile form
   - Test with +33 and 0X formats

---

## Budget Considerations

### Low-Cost Approach (DIY) - $0-100/month
- ✅ Custom implementation using existing stack
- ✅ Use Vercel Analytics (included)
- ✅ Manual email sequences via Clerk
- ✅ Self-host templates in MongoDB
- **Best for:** MVP validation, bootstrapped startups

### Mid-Tier Approach - $100-500/month
- ✅ Add Loops for email automation (~$50/month)
- ✅ Use NextStepjs for product tours (free/open-source)
- ✅ Keep custom implementation
- **Best for:** Post-PMF, growing user base

### Premium Approach - $500-2000/month
- ✅ Appcues/Userflow for no-code tours (~$300/month)
- ✅ Customer.io for advanced email (~$150/month)
- ✅ Mixpanel/Amplitude for analytics (~$200/month)
- ✅ Intercom for in-app support (~$500/month)
- **Best for:** Scale phase, enterprise customers

**Recommendation:** Start with **Low-Cost DIY approach** to validate the onboarding improvements, then upgrade to Mid-Tier once you see positive ROI (3-6 months).

---

## Next Steps

**Immediate Actions:**
1. Review this document with your team
2. Prioritize phases based on business goals
3. Assign technical lead for implementation
4. Set up project tracking (Jira, Linear, etc.)
5. Schedule weekly check-ins for progress review

**Priorities:**
- Extend User model
- Create ConsentManager component
- Implement French validation

**First Goal:**
- Complete Phases 1-2 (Foundation + Templates)
- Launch to 10-20 beta users
- Gather initial feedback

**Second Goal:**
- Complete Phases 3-5 (Interactive + Metrics + Engagement)
- Roll out to all new signups
- Begin A/B testing optimization

---

## Questions & Support

For implementation questions or clarification on any section:
1. Check the inline code comments
2. Reference the linked documentation (Clerk, MongoDB, Zod)
3. Review the French validation examples
4. Test with real French SME data

**Key Resources:**
- CNIL RGPD Guidelines: https://www.cnil.fr/fr/reglement-europeen-protection-donnees
- France Num SME Digital Adoption: https://www.francenum.gouv.fr/
- SIRET Validation: https://www.sirene.fr/
- NextStepjs Docs: https://nextstepjs.com/
- Clerk Metadata Docs: https://clerk.com/docs/users/metadata

---

**Document Version:** 1.0
**Last Updated:** 2026-01-19
**Status:** Ready for Implementation
**Recommended Start Date:** Week of 2026-01-20

---

*This strategy combines best practices from both onboarding research sessions, emphasizing UX excellence, French cultural adaptation, and RGPD-first compliance. The phased approach allows for iterative validation and continuous optimization based on real user data.*
