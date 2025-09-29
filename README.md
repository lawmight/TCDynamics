# 🚀 TCDynamics - WorkFlowAI

> Solution d'automatisation intelligente pour les entreprises françaises
>
> 💡 **Recently Optimized**: Codebase cleaned and optimized for better performance

[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Coverage](https://img.shields.io/badge/Coverage-75%25-yellow.svg)]()
[![CI/CD](https://github.com/lawmight/TCDynamics/actions/workflows/ci.yml/badge.svg)](https://github.com/lawmight/TCDynamics/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)]()

## 📋 Table des Matières

- [À Propos](#-à-propos)
- [Fonctionnalités](#-fonctionnalités)
- [Technologies](#-technologies)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Développement](#-développement)
- [Tests](#-tests)
- [Déploiement](#-déploiement)
- [Sécurité](#-sécurité)
- [Support](#-support)

## 🎯 À Propos

TCDynamics WorkFlowAI est une plateforme d'automatisation basée sur l'intelligence artificielle, spécialement conçue pour les TPE/PME françaises. Notre solution permet d'automatiser les processus métier, de traiter les documents intelligemment et d'améliorer le service client avec des chatbots IA.

### 🏆 Avantages Clés

- **🤖 IA Documentaire** : Traitement automatique de factures et contrats avec 99.7% de précision
- **💬 Service Client IA** : Chatbots intelligents disponibles 24/7
- **📊 Analytics Métier** : Tableaux de bord en temps réel avec prédictions IA
- **🔒 Conformité RGPD** : Hébergement en France, sécurité bancaire
- **⚡ Performance** : Économisez 10h par semaine grâce à l'automatisation

## ✨ Fonctionnalités

### Frontend

- Interface moderne et responsive (mobile-first)
- Progressive Web App (PWA) avec support offline
- Animations fluides et design élégant
- Accessibilité WCAG 2.1 AA

### Backend

- API RESTful sécurisée
- Rate limiting et protection DDoS
- Système d'emailing avec templates
- Validation des données avec Joi

## 🛠️ Technologies

### Frontend

- **Framework**: React 18.3 + TypeScript
- **Build Tool**: Vite 7.1
- **Styling**: TailwindCSS + Radix UI
- **State Management**: TanStack Query
- **Routing**: React Router v6

### Backend

- **Runtime**: Node.js + Express
- **Security**: Helmet, CORS, Rate Limiting
- **Email**: Nodemailer (Zoho Mail)
- **Validation**: Joi

## 📦 Installation

### Prérequis

- Node.js 18+ et npm 9+
- Git

### Étapes d'installation

1. **Cloner le repository**

```bash
git clone <repository-url>
cd TCDynamics
```

2. **Installer les dépendances Frontend**

```bash
npm install
```

3. **Installer les dépendances Backend**

```bash
cd backend
npm install
cd ..
```

## ⚙️ Configuration

### Variables d'Environnement

1. **Frontend** : Copier et configurer `.env`

```bash
cp env.example .env
# Éditer .env avec vos valeurs
```

2. **Backend** : Copier et configurer `backend/.env`

```bash
cp backend/env.example backend/.env
# Éditer backend/.env avec vos valeurs
```

### Configuration Email

Dans `backend/.env`, configurez :

```env
EMAIL_HOST=your-smtp-host
EMAIL_PORT=465
EMAIL_USER=your-email@domain.com
EMAIL_PASS=your-app-password
```

**⚠️ IMPORTANT**: Utilisez un mot de passe d'application, pas votre mot de passe principal.

## 💻 Développement

### Démarrer en mode développement

**Terminal 1 - Frontend:**

```bash
npm run dev
# Accessible sur http://localhost:8080
```

**Terminal 2 - Backend:**

```bash
cd backend
npm run dev
# API sur http://localhost:3001
```

### Scripts Disponibles

#### Frontend

- `npm run dev` - Serveur de développement
- `npm run build` - Build de production
- `npm run test` - Lancer les tests
- `npm run lint` - Vérifier le code
- `npm run format` - Formater le code

#### Backend

- `npm run start` - Démarrer le serveur
- `npm run dev` - Mode développement avec nodemon

## 🧪 Tests

### Lancer les tests

```bash
# Tests unitaires
npm run test

# Tests avec interface
npm run test:ui

# Avec couverture
npm run test:coverage

# Tests d'intégration backend
cd backend
node test-integration.js
```

### 📊 Couverture de Code

- **Lignes**: 75%+
- **Branches**: 70%+
- **Fonctions**: 70%+
- **Déclarations**: 75%+

Les rapports de couverture sont générés dans le dossier `coverage/` et publiés via CI/CD.

### Coverage actuel

- Frontend: ~15% (en cours d'amélioration)
- Backend: Tests d'intégration disponibles

## 🚀 Déploiement

### Build de Production

```bash
# Build frontend
npm run build

# Les fichiers sont générés dans ./dist
```

### Déploiement sur OVHcloud

1. **Préparer le serveur**

```bash
# Sur votre serveur
git clone <repository-url>
cd TCDynamics
npm install --production
```

2. **Configuration Nginx**

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Frontend
    location / {
        root /var/www/your-app/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

3. **Démarrer avec PM2**

```bash
# Installer PM2
npm install -g pm2

# Démarrer le backend
cd backend
pm2 start src/server.js --name your-app-api

# Sauvegarder la configuration
pm2 save
pm2 startup
```

## 🔒 Sécurité

### Mesures Implémentées

- ✅ Helmet.js pour les headers de sécurité
- ✅ Rate limiting (5 req/15min par IP)
- ✅ Validation des entrées avec Joi
- ✅ CORS configuré
- ✅ Variables sensibles en .env
- ✅ HTTPS en production

### Audit de Sécurité

```bash
# Vérifier les vulnérabilités
npm audit

# Corriger automatiquement
npm audit fix
```

## 📊 Monitoring

### Logs

Les logs sont disponibles dans la console. En production, utilisez PM2 :

```bash
pm2 logs your-app-api
```

### Métriques

- Endpoint de santé : `GET /health`
- Test API : `GET /api/test`

## 🤝 Support

### Contact

- **Email**: your-email@domain.com
- **Support**: Support local disponible
- **Issues**: Utilisez le système d'issues de votre repository

### Équipe

- Développement et maintenance par votre équipe
- Support entreprise disponible

## 📄 License

Copyright © 2024 Your Company. Tous droits réservés.

Ce logiciel est propriétaire et confidentiel. Toute reproduction ou distribution non autorisée est strictement interdite.

---

<div align="center">
  <p>Fait avec ❤️ en France 🇫🇷</p>
  <p>
    <a href="https://your-website.com">Site Web</a> •
    <a href="https://github.com/your-org">GitHub</a>
  </p>
</div>
# Test trigger
// Test comment for deployment
