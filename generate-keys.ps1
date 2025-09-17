# Script pour générer des clés sécurisées pour TCDynamics
Write-Host "🔐 Génération de clés sécurisées pour TCDynamics" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Yellow

Write-Host "`n🔑 Génération des clés..." -ForegroundColor Green

# Fonction pour générer une clé hexadécimale de 64 caractères (32 bytes)
function Generate-SecureKey {
    $bytes = New-Object byte[] 32
    [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
    return [System.BitConverter]::ToString($bytes).Replace("-", "").ToLower()
}

# Génère les clés
$adminKey = Generate-SecureKey
$sessionSecret = Generate-SecureKey
$adminApiKey = Generate-SecureKey
$jwtSecret = Generate-SecureKey
$apiKeySecret = Generate-SecureKey
$postgresPassword = Generate-SecureKey
$grafanaPassword = Generate-SecureKey
$pm2PublicKey = Generate-SecureKey
$pm2SecretKey = Generate-SecureKey

Write-Host "`n✅ Clés générées avec succès !" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor White

Write-Host "`n📋 Valeurs générées :" -ForegroundColor Yellow
Write-Host "====================" -ForegroundColor White

Write-Host "`n# ADMIN_KEY=$adminKey" -ForegroundColor Cyan
Write-Host "# SESSION_SECRET=$sessionSecret" -ForegroundColor Cyan
Write-Host "# ADMIN_API_KEY=$adminApiKey" -ForegroundColor Cyan
Write-Host "# JWT_SECRET=$jwtSecret" -ForegroundColor Cyan
Write-Host "# API_KEY_SECRET=$apiKeySecret" -ForegroundColor Cyan
Write-Host "# POSTGRES_PASSWORD=$postgresPassword" -ForegroundColor Cyan
Write-Host "# GRAFANA_PASSWORD=$grafanaPassword" -ForegroundColor Cyan
Write-Host "# PM2_PUBLIC_KEY=$pm2PublicKey" -ForegroundColor Cyan
Write-Host "# PM2_SECRET_KEY=$pm2SecretKey" -ForegroundColor Cyan

Write-Host "`n📝 Création des fichiers .env..." -ForegroundColor Green

# Créer le fichier .env principal
$mainEnv = @"
# Azure Functions Environment Variables
# Copy this file to .env and fill in your actual values

# Zoho Email Configuration
ZOHO_EMAIL=contact@tcdynamics.fr
ZOHO_PASSWORD=votre-mot-de-passe-zoho-app

# Database Configuration (choose one)
# Option 1: Azure Cosmos DB (recommended for production)
COSMOS_CONNECTION_STRING=votre-cosmos-connection-string

# Option 2: Azure Table Storage (cost-effective alternative)
AZURE_STORAGE_CONNECTION_STRING=votre-storage-connection-string

# Security & Admin
ADMIN_KEY=$adminKey

# Azure Functions Configuration
APPLICATIONINSIGHTS_CONNECTION_STRING=votre-app-insights-connection
FUNCTIONS_WORKER_RUNTIME=python
AzureWebJobsStorage=UseDevelopmentStorage=true

# Optional: Redis Cache (for enhanced performance)
REDIS_CONNECTION_STRING=votre-redis-connection-string
"@

$mainEnv | Out-File -FilePath ".env" -Encoding UTF8

# Créer le fichier backend/.env
$backendEnv = @"
# Backend Environment Variables
# NEVER commit the .env file to version control!

# Server Configuration
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:8080

# Email Configuration (Zoho Mail)
EMAIL_HOST=smtp.zoho.eu
EMAIL_PORT=465
EMAIL_USER=contact@tcdynamics.fr
EMAIL_PASS=votre-mot-de-passe-zoho-app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=5

# Security
SESSION_SECRET=$sessionSecret
ADMIN_API_KEY=$adminApiKey
JWT_SECRET=$jwtSecret
API_KEY=$apiKeySecret

# URLs
FRONTEND_URL=http://localhost:8080
BACKEND_URL=http://localhost:3001

# CORS Configuration (comma-separated list of allowed origins)
ALLOWED_ORIGINS=http://localhost:8080,https://tcdynamics.fr,https://www.tcdynamics.fr

# Database (optional for future use)
DATABASE_URL=
"@

$backendEnv | Out-File -FilePath "backend/.env" -Encoding UTF8

# Créer le fichier docker-env si nécessaire
$dockerEnv = @"
# Docker Environment Configuration for TCDynamics
# Copy this file to .env and customize the values

# Application Configuration
NODE_ENV=production
PORT=3001

# Frontend Configuration
FRONTEND_URL=http://localhost
FRONTEND_PORT=80
HTTPS_PORT=443

# Backend Configuration
BACKEND_PORT=3001
LOG_LEVEL=info

# Database Configuration
POSTGRES_DB=tcdynamics
POSTGRES_USER=tcdynamics
POSTGRES_PASSWORD=$postgresPassword
POSTGRES_PORT=5432
DATABASE_URL=postgresql://tcdynamics:$postgresPassword@postgres:5432/tcdynamics

# Redis Configuration
REDIS_URL=redis://redis:6379
REDIS_PORT=6379

# Email Configuration (Zoho Mail)
EMAIL_HOST=smtp.zoho.eu
EMAIL_PORT=465
EMAIL_USER=contact@tcdynamics.fr
EMAIL_PASS=votre-mot-de-passe-zoho-app

# Security Configuration
JWT_SECRET=$jwtSecret
SESSION_SECRET=$sessionSecret
API_KEY_SECRET=$apiKeySecret

# Monitoring Configuration (Optional)
PROMETHEUS_ENABLED=true
GRAFANA_USER=admin
GRAFANA_PASSWORD=$grafanaPassword

# PM2 Configuration
PM2_PUBLIC_KEY=$pm2PublicKey
PM2_SECRET_KEY=$pm2SecretKey

# Nginx Configuration
NGINX_WORKER_PROCESSES=auto

# Backup Configuration
BACKUP_ENABLED=true
BACKUP_INTERVAL=86400
"@

$dockerEnv | Out-File -FilePath "docker-env" -Encoding UTF8

Write-Host "✅ Fichiers .env créés avec succès !" -ForegroundColor Green

Write-Host "`n⚠️  IMPORTANT :" -ForegroundColor Red
Write-Host "- Remplacez 'votre-mot-de-passe-zoho-app' par votre vrai mot de passe d'application Zoho"
Write-Host "- Configurez vos vraies chaînes de connexion Azure"
Write-Host "- Ne jamais commiter ces fichiers .env dans Git"
Write-Host "- Gardez ces clés en sécurité"

Write-Host "`n🎉 Configuration terminée !" -ForegroundColor Green
Write-Host "Vous pouvez maintenant utiliser votre application TCDynamics en toute sécurité."
