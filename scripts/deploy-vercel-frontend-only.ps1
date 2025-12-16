# Vercel Frontend-Only Production Deployment Script
# This script deploys only the frontend build (static files) without serverless API functions
# This avoids Vercel Hobby plan's 12 function limit

Write-Host "Starting Vercel frontend-only production deployment..." -ForegroundColor Cyan

# Get the script directory and project root
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir

# Change to frontend directory
Set-Location "$ProjectRoot\apps\frontend"

Write-Host "Deploying from: $(Get-Location)" -ForegroundColor Gray

# Ensure API directory doesn't exist (cleanup from previous deployments)
# Without the api directory, Vercel won't create serverless functions
if (Test-Path "api") {
    Write-Host "Removing api directory to deploy frontend-only..." -ForegroundColor Yellow
    Remove-Item -Path "api" -Recurse -Force
    Write-Host "API directory removed (will deploy static frontend only)" -ForegroundColor Green
}

# Temporarily remove functions section from vercel.json to avoid deployment errors
if (Test-Path "vercel.json") {
    Write-Host "Temporarily removing functions section from vercel.json..." -ForegroundColor Yellow
    # Create backup
    Copy-Item "vercel.json" "vercel.json.backup" -Force
    
    # Use Node.js to properly remove functions section from JSON
    $nodeScript = @"
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
delete config.functions;
fs.writeFileSync('vercel.json', JSON.stringify(config, null, 2) + '\n');
"@
    $nodeScript | node
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Warning: Failed to remove functions section, continuing anyway..." -ForegroundColor Yellow
    } else {
        Write-Host "Functions section removed from vercel.json" -ForegroundColor Green
    }
}

# Build the frontend
Write-Host "Building frontend..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed with exit code $LASTEXITCODE" -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host "Build completed successfully" -ForegroundColor Green

# Deploy to Vercel production
Write-Host "Deploying to Vercel production (frontend-only, no serverless functions)..." -ForegroundColor Yellow
vercel --prod --yes

# Restore original vercel.json if backup exists
if (Test-Path "vercel.json.backup") {
    Remove-Item "vercel.json" -Force
    Rename-Item -Path "vercel.json.backup" -NewName "vercel.json" -Force
    Write-Host "Restored original vercel.json" -ForegroundColor Gray
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "Deployment completed successfully!" -ForegroundColor Green
} else {
    Write-Host "Deployment failed with exit code $LASTEXITCODE" -ForegroundColor Red
    # Restore backup even on failure
    if (Test-Path "vercel.json.backup") {
        if (Test-Path "vercel.json") {
            Remove-Item "vercel.json" -Force
        }
        Rename-Item -Path "vercel.json.backup" -NewName "vercel.json" -Force
    }
    exit $LASTEXITCODE
}
