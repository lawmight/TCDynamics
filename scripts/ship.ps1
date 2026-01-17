# Ship - Commit, push, and deploy to Vercel
# This script automates the full deployment workflow
# By default, deploys to preview (use --prod flag for production)

param(
    [string]$Message = "",
    [switch]$Prod = $false
)

Write-Host "🚀 Starting ship workflow..." -ForegroundColor Cyan

# Get the script directory and project root
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir

# Change to project root
Set-Location $ProjectRoot

Write-Host "Project root: $ProjectRoot" -ForegroundColor Gray

# Step 1: Check if there are changes to commit
$gitStatus = git status --porcelain
if ([string]::IsNullOrWhiteSpace($gitStatus)) {
    Write-Host "No changes to commit. Proceeding to deployment..." -ForegroundColor Yellow
} else {
    Write-Host "Changes detected. Staging all changes..." -ForegroundColor Yellow
    git add -A
    
    # Generate commit message if not provided
    if ([string]::IsNullOrWhiteSpace($Message)) {
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        $Message = "chore: ship deployment at $timestamp"
    }
    
    Write-Host "Committing changes with message: $Message" -ForegroundColor Yellow
    git commit -m $Message
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Commit failed. Aborting ship." -ForegroundColor Red
        exit $LASTEXITCODE
    }
    
    Write-Host "Pushing to origin..." -ForegroundColor Yellow
    git push origin main
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Push failed. Aborting ship." -ForegroundColor Red
        exit $LASTEXITCODE
    }
    
    Write-Host "Changes committed and pushed successfully!" -ForegroundColor Green
}

# Step 2: Deploy to Vercel
if ($Prod) {
    Write-Host "Deploying to Vercel production..." -ForegroundColor Yellow
    & "$ScriptDir\deploy-vercel.ps1"
} else {
    Write-Host "Deploying to Vercel preview..." -ForegroundColor Yellow
    & "$ScriptDir\deploy-vercel-preview.ps1"
}

if ($LASTEXITCODE -eq 0) {
    $deployType = if ($Prod) { "production" } else { "preview" }
    Write-Host "✅ Ship to $deployType completed successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Ship failed during deployment" -ForegroundColor Red
    exit $LASTEXITCODE
}