# Simple OVH Deployment Script for WorkFlowAI

Write-Host "🚀 WorkFlowAI Simple OVH Deployment" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green

# Default OVH path (you may need to change this)
$OVHPath = "C:\path\to\your\ovh\hosting"

Write-Host "📁 Deploying from: $(Get-Location)\dist" -ForegroundColor Yellow
Write-Host "📁 Deploying to: $OVHPath" -ForegroundColor Yellow

# Check if dist folder exists
if (-not (Test-Path "dist")) {
    Write-Host "❌ dist folder not found. Please run npm run build first." -ForegroundColor Red
    exit 1
}

# Check if OVH path exists
if (-not (Test-Path $OVHPath)) {
    Write-Host "❌ OVH hosting path not found: $OVHPath" -ForegroundColor Red
    Write-Host "Please update the OVHPath variable in this script." -ForegroundColor Yellow
    Write-Host "Example: `$OVHPath = \"C:\Users\Tomco\OneDrive\OVH Hosting\tcdynamics.fr\"`" -ForegroundColor Cyan
    exit 1
}

# Create backup
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupPath = "$OVHPath\backup-$timestamp"

Write-Host "📦 Creating backup at: $backupPath" -ForegroundColor Yellow
if (Test-Path "$OVHPath\*") {
    New-Item -ItemType Directory -Path $backupPath -Force | Out-Null
    Copy-Item "$OVHPath\*" -Destination $backupPath -Recurse -Force
    Write-Host "✅ Backup created" -ForegroundColor Green
}

# Deploy
Write-Host "📤 Deploying application..." -ForegroundColor Yellow
try {
    # Remove old files (keep backups)
    Get-ChildItem -Path $OVHPath -Exclude "backup-*" | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
    
    # Copy new files
    Copy-Item "dist\*" -Destination $OVHPath -Recurse -Force
    
    Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
    
    # Show summary
    $filesCount = (Get-ChildItem -Path $OVHPath -Recurse -File | Measure-Object).Count
    Write-Host "📁 Files deployed: $filesCount" -ForegroundColor White
    
} catch {
    Write-Host "❌ Deployment failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host "" -ForegroundColor Green
Write-Host "🎉 WorkFlowAI deployed to OVH!" -ForegroundColor Green
Write-Host "🌐 Your website should be live at your OVH domain" -ForegroundColor Cyan