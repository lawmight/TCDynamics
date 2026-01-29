# Polar : Gestion des Factures et Obligations Fiscales/Sociales

## Comment Polar gère les factures

### 1. Factures clients (Customer Invoices)

Polar génère automatiquement des factures pour vos clients lorsqu'ils effectuent un paiement :

- **Génération automatique** : Les factures sont créées lors de chaque commande payée
- **Stockage** : Les factures sont stockées dans S3 et accessibles via des URLs pré-signées (TTL de 10 minutes)
- **Contenu des factures** :
  - Nom et adresse de facturation
  - Détails de la commande (produits, quantités, montants)
  - Sous-total, réductions, solde appliqué
  - Informations fiscales (montant TVA, taux, raison de l'assujettissement)
  - Numéro de TVA si fourni
  - Numéro et date de facture

### 2. Factures inversées (Reverse Invoices / Payout Invoices)

Puisque Polar agit comme **Merchant of Record**, vous devez facturer Polar pour les montants qui vous sont versés :

- **Génération** : Disponible depuis la page **Payouts** sous **Finance** dans votre dashboard Polar
- **Contenu** :
  - Montant brut des ventes de services/produits numériques
  - Part de revenus Polar (frais de plateforme)
  - Frais de paiement
  - Période couverte par les transactions
  - Méthode et ID de paiement
  - Détails de conversion de devise si applicable

**Important** : Une fois générée, la facture inversée ne peut plus être modifiée. Vérifiez vos informations de facturation avant de la générer.

### 3. Configuration requise pour les factures inversées

Vous devez configurer dans votre compte Polar :

- Nom de facturation (`billing_name`)
- Adresse de facturation (`billing_address`)
- Informations supplémentaires (optionnel)
- Notes en bas de facture (optionnel)
- Format du numéro de facture (par défaut : `POLAR-0001`)

### 4. Merchant of Record - Implications fiscales

Polar Software, Inc. est le Merchant of Record qui :

- **Facture les clients** : Les clients reçoivent des factures de Polar
- **Gère la TVA internationale** : Polar collecte et reverse la TVA internationale selon les besoins
- **Paiements sans TVA** : Les paiements que vous recevez (factures inversées) sont **sans TVA** car Polar a déjà géré la fiscalité

**Conséquence** : Vous recevez des revenus nets (après frais de plateforme) sans TVA à déclarer sur ces montants.

## Documents à envoyer aux impôts et à l'URSSAF

### Pour les impôts (DGFIP)

#### Documents principaux

1. **Déclaration de revenus**
   - Formulaire 2042 pour les particuliers
   - Formulaire 2035 pour les auto-entrepreneurs
   - Liasse fiscale pour les entreprises (BIC, BNC selon votre activité)

2. **Déclaration de TVA** (si applicable)
   - Si vous dépassez les seuils de franchise en base :
     - Activités commerciales : 91 900 €
     - Prestations de services : 36 800 €
   - Déclaration mensuelle ou trimestrielle selon votre régime

3. **Justificatifs de revenus**
   - **Factures inversées Polar** : Ces documents prouvent vos revenus reçus de Polar
   - Relevés bancaires professionnels
   - Livre des recettes (pour micro-entrepreneurs)

4. **Justificatifs de charges**
   - Factures d'achats professionnels
   - Relevés bancaires
   - Registre des achats

#### Mentions obligatoires sur vos factures inversées

Si vous êtes en franchise de TVA, mentionnez :

- "TVA non applicable, art. 293 B du CGI"
- Numéro SIRET
- Numéro de facture unique et séquentiel
- Dates et coordonnées complètes

### Pour l'URSSAF

#### Déclaration Sociale des Indépendants (DSI)

1. **Déclaration des revenus professionnels**
   - Utilisez les **factures inversées Polar** comme justificatifs de vos revenus
   - Déclarez le montant net reçu (après frais de plateforme Polar)

2. **Cotisations sociales concernées**
   - Assurance maladie-maternité
   - Allocations familiales
   - Retraite de base et complémentaire
   - Invalidité-décès
   - CSG-CRDS
   - Formation professionnelle

3. **Justificatifs à conserver**
   - **Factures inversées Polar** (revenus)
   - Factures fournisseurs (charges déductibles)
   - Relevés bancaires professionnels
   - Livre des recettes (micro-entrepreneurs)
   - Déclarations fiscales (2035 ou 2042-C-PRO)

### Facturation électronique (obligation progressive)

- **2026** : Réception obligatoire des factures électroniques
- **2027** : Émission obligatoire pour toutes les entreprises

Assurez-vous que vos factures inversées Polar sont conformes aux formats électroniques requis.

## Workflow recommandé

### 1. Récupération des factures Polar

```javascript
// Les factures sont disponibles via l'API Polar
// ou depuis le dashboard Polar > Finance > Payouts
```

### 2. Archivage

- Téléchargez toutes les factures inversées Polar
- Archivez-les avec vos autres documents comptables
- Conservez-les pendant les délais légaux (10 ans pour les entreprises)

### 3. Déclaration fiscale

- Utilisez les montants des factures inversées pour déclarer vos revenus
- Les montants sont **nets** (après frais Polar, sans TVA)
- Déclarez selon votre régime fiscal (micro-entreprise, BIC, BNC, etc.)

### 4. Déclaration sociale (URSSAF)

- Déclarez les revenus nets reçus de Polar dans votre DSI
- Joignez les factures inversées comme justificatifs si demandé
- Calculez vos cotisations sur la base de ces revenus

## Points d'attention

### ⚠️ Important

1. **Pas de TVA à déclarer** sur les revenus Polar : Polar a déjà géré la TVA en tant que Merchant of Record
2. **Montants nets** : Les factures inversées montrent les montants après frais de plateforme
3. **Conservation** : Gardez toutes les factures pendant 10 ans (obligation légale)
4. **Vérification** : Vérifiez vos informations de facturation avant de générer une facture inversée (elle ne peut plus être modifiée)

### 📋 Checklist avant déclaration

- [ ] Toutes les factures inversées Polar téléchargées
- [ ] Relevés bancaires correspondants
- [ ] Informations de facturation à jour dans Polar
- [ ] Livre des recettes tenu à jour (si micro-entrepreneur)
- [ ] Déclarations précédentes consultées pour cohérence

## Ressources

- **Polar Dashboard** : Finance > Payouts > Download invoice
- **API Polar** : Documentation sur la génération de factures
- **Impôts** : impots.gouv.fr
- **URSSAF** : urssaf.fr
- **Expert-comptable** : Recommandé pour un accompagnement personnalisé

## Notes techniques

### Dans votre codebase

Votre application gère les webhooks Polar dans :

- `api/polar/webhook.js` : Réception des événements Polar
- `api/polar/checkout.js` : Création de sessions de paiement

Les événements `order.paid` et les mises à jour de `subscription` sont enregistrés dans MongoDB via le modèle `PolarEvent`.

### Accès aux factures

Les factures Polar sont accessibles via :

1. Le dashboard Polar (interface web)
2. L'API Polar (endpoints de facturation)
3. Les webhooks (notifications de génération)

---

**Dernière mise à jour** : Janvier 2026
**Source** : Documentation Polar + Recherche Légifrance
