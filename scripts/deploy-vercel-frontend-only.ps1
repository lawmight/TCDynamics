# Vercel Frontend-Only Production Deployment Script
# This script deploys only the frontend build (static files) without serverless API functions
# This avoids Vercel Hobby plan's 12 function limit

Write-Host "Starting Vercel frontend-only production deployment..." -ForegroundColor Cyan

# Get the script directory and project root
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir

# Change to project root (uses root vercel.json)
Set-Location $ProjectRoot

Write-Host "Deploying from: $(Get-Location)" -ForegroundColor Gray

# Ensure API directory doesn't exist in apps/frontend (cleanup from previous deployments)
# Without the api directory, Vercel won't create serverless functions
if (Test-Path "apps\frontend\api") {
    Write-Host "Removing apps/frontend/api directory to deploy frontend-only..." -ForegroundColor Yellow
    Remove-Item -Path "apps\frontend\api" -Recurse -Force
    Write-Host "API directory removed (will deploy static frontend only)" -ForegroundColor Green
}

# Build the frontend
Write-Host "Building frontend..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed with exit code $LASTEXITCODE" -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host "Build completed successfully" -ForegroundColor Green

# Deploy to Vercel production (from root, uses root vercel.json)
Write-Host "Deploying to Vercel production (frontend-only, no serverless functions)..." -ForegroundColor Yellow
vercel --prod --yes

if ($LASTEXITCODE -eq 0) {
    Write-Host "Deployment completed successfully!" -ForegroundColor Green
} else {
    Write-Host "Deployment failed with exit code $LASTEXITCODE" -ForegroundColor Red
    exit $LASTEXITCODE
}
