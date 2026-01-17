# Vercel Preview Deployment Script
# This script prepares the environment and deploys to Vercel preview
# Use this to deploy main branch to preview instead of production

Write-Host "Starting Vercel preview deployment..." -ForegroundColor Cyan

# Get the script directory and project root
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir

# Change to project root
Set-Location $ProjectRoot

Write-Host "Project root: $ProjectRoot" -ForegroundColor Gray

# Step 1: Ensure apps/frontend/api is removed before deployment
# Vercel will detect functions from root api/ directory only to avoid duplicates
Write-Host "Ensuring apps/frontend/api is removed before deployment..." -ForegroundColor Yellow
if (Test-Path "apps/frontend/api") {
    Remove-Item -Path "apps/frontend/api" -Recurse -Force
    Write-Host "apps/frontend/api removed (functions will be detected from root api/)" -ForegroundColor Green
}

# Step 2: Deploy from project root as preview (not production)
Write-Host "Deploying to Vercel preview from project root..." -ForegroundColor Yellow
vercel --prod=false --yes

if ($LASTEXITCODE -eq 0) {
    Write-Host "Preview deployment completed successfully!" -ForegroundColor Green
} else {
    Write-Host "Preview deployment failed with exit code $LASTEXITCODE" -ForegroundColor Red
    exit $LASTEXITCODE
}
