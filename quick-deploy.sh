#!/bin/bash

echo "🚀 Déploiement rapide vers OVH..."

# Vérifier que dist/ existe
if [ ! -d "dist" ]; then
    echo "❌ Dossier dist/ non trouvé. Lancez d'abord: npm run build"
    exit 1
fi

echo "📁 Contenu du dossier dist/:"
ls -la dist/

echo ""
echo "🌐 Utilisez cette méthode rapide:"
echo "1. Ouvrez votre navigateur"
echo "2. Allez sur: ftp://tcdynau@ftp.cluster021.hosting.ovh.net:21/"
echo "3. Entrez votre mot de passe OVH"
echo "4. Supprimez les anciens fichiers"
echo "5. Upload le dossier dist/ complet"
echo ""
echo "✅ Votre site sera disponible sur: https://tcdynamics.fr"

