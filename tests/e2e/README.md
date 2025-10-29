# 🧪 End-to-End Tests (Playwright)

Cette suite de tests E2E vérifie le comportement complet de l'application TCDynamics, incluant les interactions utilisateur, la navigation, les formulaires et la responsivité.

## 🚀 Démarrage Rapide

### Prérequis

```bash
# Installer les dépendances
npm install

# Installer Playwright browsers
npx playwright install
```

### Lancer les Tests

```bash
# Tests en mode headless (recommandé pour CI)
npm run test:e2e

# Tests avec interface graphique (pour développement)
npm run test:e2e:ui

# Tests en mode headed (voir le navigateur)
npm run test:e2e:headed

# Mode debug (pause sur chaque action)
npm run test:e2e:debug
```

## 📋 Tests Inclus

### 1. Contact Form Flow (`contact-flow.spec.ts`)

- ✅ Soumission réussie du formulaire de contact
- ✅ Validation des champs requis
- ✅ Validation du format email
- ✅ Gestion des erreurs réseau
- ✅ Responsivité mobile

### 2. Navigation (`navigation.spec.ts`)

- ✅ Chargement de la page d'accueil
- ✅ Navigation entre les sections
- ✅ Gestion de la page 404
- ✅ Scroll fluide vers les sections
- ✅ Comportement du header sticky
- ✅ Menu mobile
- ✅ Fonctionnalité "Retour en haut"
- ✅ Formulaire de démo (si présent)
- ✅ Toggle du moniteur de performance
- ✅ États offline/online

## 🔧 Configuration

### Environnements

Les tests démarrent automatiquement les serveurs de développement :

- **Frontend** : `http://localhost:8080` (port Vite par défaut)
- **Backend** : `http://localhost:8080` (API)

### Configuration Playwright

Voir `playwright.config.ts` pour :

- Configuration multi-navigateurs (Chrome, Firefox, Safari, Mobile)
- Paramètres de capture d'écran et vidéo
- Timeouts et retries
- Setup/teardown globaux

## 🛠️ Développement

### Ajouter un Nouveau Test

1. Créer un fichier `.spec.ts` dans le dossier `e2e/`
2. Utiliser la structure `test.describe()` et `test()`
3. Suivre les patterns existants pour les sélecteurs

### Exemple de Test Simple

```typescript
import { test, expect } from '@playwright/test'

test.describe('Nouvelle Fonctionnalité', () => {
  test('devrait fonctionner correctement', async ({ page }) => {
    await page.goto('/')

    // Votre test ici
    await expect(page.locator('h1')).toBeVisible()
  })
})
```

### Sélecteurs Recommandés

- **Texte** : `page.click('text=Contact')`
- **CSS** : `page.locator('.btn-primary')`
- **Test ID** : `page.locator('[data-testid="my-component"]')`
- **ARIA** : `page.locator('[aria-label="Menu"]')`

## 🔍 Debugging

### Mode Debug

```bash
npm run test:e2e:debug
```

### Mode UI

```bash
npm run test:e2e:ui
```

### Captures d'Écran

Les captures d'écran sont automatiquement prises en cas d'échec et sauvegardées dans `test-results/`.

### Traces

Les traces sont collectées pour les tests échoués et peuvent être visualisées avec :

```bash
npx playwright show-trace test-results/trace.zip
```

## 📊 CI/CD Integration

### GitHub Actions

```yaml
- name: Install dependencies
  run: npm ci

- name: Install Playwright
  run: npx playwright install --with-deps

- name: Run E2E tests
  run: npm run test:e2e
  env:
    PLAYWRIGHT_BASE_URL: ${{ secrets.PLAYWRIGHT_BASE_URL }}

- name: Upload test results
  uses: actions/upload-artifact@v3
  if: always()
  with:
    name: playwright-report
    path: playwright-report/
    retention-days: 30
```

### Variables d'Environnement

- `PLAYWRIGHT_BASE_URL` : URL de base pour les tests (optionnel)
- `CI` : Active le mode CI (workers=1, retries=2)

## 🚨 Bonnes Pratiques

### Attendre les Éléments

```typescript
// ✅ Bien
await expect(page.locator('text=Chargement...')).toBeVisible()

// ❌ Mal
await page.waitForTimeout(1000)
```

### Gestion des Erreurs

```typescript
// Tester les erreurs attendues
await expect(page.locator('text=Erreur réseau')).toBeVisible()
```

### Mobile Testing

```typescript
// Tester sur mobile
await page.setViewportSize({ width: 375, height: 667 })
```

### Network Mocking

```typescript
// Mocker les requêtes API
await page.route('**/api/contact', route => route.abort())
```

## 📈 Métriques et Reporting

### Couverture des Tests

- **Navigation** : Tous les liens principaux
- **Formulaires** : Contact et démo
- **Responsivité** : Desktop et mobile
- **États d'Erreur** : 404, réseau, validation
- **Performance** : Temps de chargement, scroll

### Rapports Générés

- `playwright-report/index.html` : Rapport HTML détaillé
- `test-results/e2e-results.json` : Résultats JSON
- `test-results/` : Captures d'écran et vidéos des échecs

## 🔒 Sécurité

Les tests respectent :

- ✅ CSP (Content Security Policy) avec nonces
- ✅ Headers de sécurité (HSTS, X-Frame-Options, etc.)
- ✅ Validation côté serveur
- ✅ Gestion des erreurs sécurisée

## 🚨 Alertes Importantes

### Performance

- Les tests démarrent les serveurs automatiquement
- Fermez les autres instances de dev servers avant de lancer les tests
- Utilisez `--reuse-existing-server` en développement

### Données de Test

- Les tests utilisent des données fictives
- Aucun impact sur les données de production
- Les emails de test ne sont pas réellement envoyés

---

**🎯 Résultat** : Votre application dispose maintenant d'une suite complète de tests E2E pour garantir la qualité et la stabilité !
