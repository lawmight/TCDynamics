#!/bin/bash
# Script de nettoyage complet pour TCDynamics

echo "�� Nettoyage du projet TCDynamics..."

# Supprimer les anciens fichiers de build et cache
echo "🗂️ Suppression des fichiers temporaires..."
rm -rf dist/
rm -rf .vite/
rm -rf coverage/
rm -rf .nyc_output/

# Nettoyer les node_modules et reinstaller
echo "📦 Nettoyage des dépendances..."
rm -rf node_modules/
rm -f package-lock.json
npm install

# Lancer les tests
echo "🧪 Lancement des tests..."
npm run test

# Linter et formatter
echo "🔍 Vérification du code..."
npm run lint:fix
npm run format

# Vérification des types
echo "📝 Vérification des types TypeScript..."
npm run type-check

echo "✅ Nettoyage terminé !"

