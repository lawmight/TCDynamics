# Vercel Production Deployment Script
# This script prepares the environment and deploys to Vercel production
# It mirrors the GitHub Actions workflow process

Write-Host "🚀 Starting Vercel production deployment..." -ForegroundColor Cyan

# Get the script directory and project root
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir

# Change to project root
Set-Location $ProjectRoot

Write-Host "📁 Project root: $ProjectRoot" -ForegroundColor Gray

# Step 1: Copy API directory to apps/frontend/api (mirroring GitHub Actions workflow)
Write-Host "📦 Copying API directory to apps/frontend/api..." -ForegroundColor Yellow
if (Test-Path "apps/frontend/api") {
    Remove-Item -Path "apps/frontend/api" -Recurse -Force
}
Copy-Item -Path "api" -Destination "apps/frontend/api" -Recurse -Force
Write-Host "✅ API directory copied to apps/frontend/api" -ForegroundColor Green

# Step 2: Install API dependencies
Write-Host "📥 Installing API dependencies..." -ForegroundColor Yellow
Set-Location "apps/frontend/api"
npm install --production
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Warning: npm install in api directory had issues (non-blocking)" -ForegroundColor Yellow
}
Write-Host "✅ API dependencies installed" -ForegroundColor Green

# Step 3: Change to frontend directory and deploy
Set-Location ..
Write-Host "🎯 Deploying to Vercel production from apps/frontend..." -ForegroundColor Yellow
vercel --prod --yes

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Deployment failed with exit code $LASTEXITCODE" -ForegroundColor Red
    exit $LASTEXITCODE
}
