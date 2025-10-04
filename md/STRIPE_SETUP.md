# Configuration Stripe pour TCDynamics

## Prérequis

1. Créer un compte Stripe sur [https://stripe.com](https://stripe.com)
2. Activer le mode test pour le développement

## Configuration des Produits et Prix

### 1. Créer les produits dans Stripe Dashboard

Allez dans **Produits** dans votre dashboard Stripe et créez 3 produits :

#### Produit 1: Starter

- **Nom**: TCDynamics Starter
- **Description**: Parfait pour les petites entreprises
- **Prix**: 29€/mois
- **ID du prix**: Notez l'ID qui commence par `price_`

#### Produit 2: Professional

- **Nom**: TCDynamics Professional
- **Description**: Idéal pour les PME
- **Prix**: 79€/mois
- **ID du prix**: Notez l'ID qui commence par `price_`

#### Produit 3: Enterprise

- **Nom**: TCDynamics Enterprise
- **Description**: Solution complète pour grandes entreprises
- **Prix**: Sur mesure (pas de prix fixe)

### 2. Configuration des Variables d'Environnement

Ajoutez ces variables dans votre fichier `.env` :

```env
# Clés API Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_... # Votre clé publique de test
STRIPE_SECRET_KEY=sk_test_... # Votre clé secrète de test (côté serveur)

# IDs des prix Stripe
VITE_STRIPE_PRICE_STARTER=price_... # ID du prix Starter
VITE_STRIPE_PRICE_PROFESSIONAL=price_... # ID du prix Professional
```

### 3. Configuration Azure Functions

Dans votre Azure Function App, ajoutez les variables d'environnement :

```bash
# Dans Azure Portal > Function App > Configuration
STRIPE_SECRET_KEY=sk_test_...
```

### 4. Configuration du Webhook (Optionnel)

Pour gérer les événements de paiement (succès, échec, renouvellements), configurez un webhook :

1. Dans Stripe Dashboard > Webhooks
2. Ajouter un endpoint : `https://your-azure-function-url/api/webhook`
3. Sélectionner les événements :
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

### 5. Test de l'Intégration

1. Démarrer l'application en mode développement
2. Aller sur `/checkout`
3. Sélectionner un plan
4. Utiliser les cartes de test Stripe :
   - **Succès**: `4242 4242 4242 4242`
   - **Échec**: `4000 0000 0000 0002`
   - **Exigence 3D Secure**: `4000 0025 0000 3155`

### 6. Passage en Production

Quand vous êtes prêt pour la production :

1. Remplacer les clés de test par les clés live
2. Créer les produits en mode live
3. Mettre à jour les URLs de succès/échec
4. Configurer les webhooks pour l'environnement de production

## Sécurité

- ✅ Les clés secrètes sont stockées côté serveur uniquement
- ✅ Utilisation d'Embedded Checkout pour la conformité PCI
- ✅ Chiffrement SSL pour toutes les communications
- ✅ Validation côté serveur des sessions de paiement

## Support

Si vous avez des questions sur la configuration Stripe, consultez :

- [Documentation Stripe Checkout](https://docs.stripe.com/payments/checkout)
- [Guide de démarrage rapide](https://docs.stripe.com/checkout/quickstart)
