#!/bin/bash

# Script de déploiement automatique vers OVH
# Usage: ./deploy-to-ovh.sh

echo "🚀 Déploiement automatique vers OVH..."

# Configuration OVH
FTP_HOST="ftp.cluster021.hosting.ovh.net"
FTP_USER="tcdynau"
FTP_DIR="/home/tcdynau"

# Vérifier que dist/ existe
if [ ! -d "dist" ]; then
    echo "❌ Dossier dist/ non trouvé. Lancez d'abord: npm run build"
    exit 1
fi

# Installer lftp si pas présent
if ! command -v lftp &> /dev/null; then
    echo "📦 Installation de lftp..."
    sudo pacman -S lftp
fi

# Demander le mot de passe
echo "🔐 Entrez votre mot de passe OVH:"
read -s FTP_PASS

echo "📤 Upload des fichiers vers OVH..."

# Upload via lftp
lftp -u "$FTP_USER,$FTP_PASS" "$FTP_HOST" << EOF
cd $FTP_DIR
mirror -R dist/ . --delete --verbose
quit
EOF

if [ $? -eq 0 ]; then
    echo "✅ Déploiement réussi!"
    echo "🌐 Votre site est maintenant disponible sur: https://tcdynamics.fr"
else
    echo "❌ Erreur lors du déploiement"
    exit 1
fi

