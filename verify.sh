#!/bin/bash
# Script de vérification complet pour TCDynamics

echo "�� Vérification du projet TCDynamics..."

# Vérifier les dépendances
echo "📦 Vérification des dépendances..."
npx depcheck 2>/dev/null || echo "⚠️ depcheck non installé, ignoré"

# Vérifier le linting
echo "🔍 Vérification du linting..."
npm run lint

# Vérifier le formatage
echo "💅 Vérification du formatage..."
npm run format:check

# Vérifier les types TypeScript
echo "📝 Vérification des types..."
npm run type-check

# Lancer les tests
echo "🧪 Lancement des tests..."
npm run test

# Vérifier que les serveurs peuvent démarrer
echo "🚀 Test de démarrage des serveurs..."
timeout 5s npm run dev > /dev/null 2>&1 &
DEV_PID=$!
sleep 3
if kill -0 $DEV_PID 2>/dev/null; then
  echo "✅ Serveur de développement OK"
  kill $DEV_PID
else
  echo "❌ Serveur de développement FAILED"
fi

echo "✅ Vérification terminée !"

