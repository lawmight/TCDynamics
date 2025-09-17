# TCDynamics OVHcloud Deployment Script
# This script helps deploy frontend files to OVHcloud hosting

param(
    [string]$OVHcloudPath = "C:\path\to\your\ovhcloud\folder",
    [switch]$Backup = $true
)

Write-Host "🚀 TCDynamics OVHcloud Deployment" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Check if OVHcloud path exists
if (-not (Test-Path $OVHcloudPath)) {
    Write-Host "❌ OVHcloud path not found: $OVHcloudPath" -ForegroundColor Red
    Write-Host "Please update the OVHcloudPath parameter or create the directory." -ForegroundColor Yellow
    exit 1
}

# Create backup if requested
if ($Backup) {
    $backupPath = "$OVHcloudPath\backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    Write-Host "📦 Creating backup at: $backupPath" -ForegroundColor Yellow
    
    if (Test-Path "$OVHcloudPath\index.html") {
        New-Item -ItemType Directory -Path $backupPath -Force | Out-Null
        Copy-Item "$OVHcloudPath\*" -Destination $backupPath -Recurse -Force
        Write-Host "✅ Backup created successfully" -ForegroundColor Green
    }
}

# Copy frontend files
Write-Host "📁 Copying frontend files..." -ForegroundColor Yellow

$files = @(
    "TCDynamics\index.html",
    "TCDynamics\style.css", 
    "TCDynamics\script.js",
    "TCDynamics\README.md"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Copy-Item $file -Destination $OVHcloudPath -Force
        Write-Host "✅ Copied: $file" -ForegroundColor Green
    } else {
        Write-Host "❌ File not found: $file" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🎉 Deployment completed!" -ForegroundColor Green
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Test your website at your OVHcloud domain" -ForegroundColor White
Write-Host "2. Verify contact form works with Azure Functions" -ForegroundColor White
Write-Host "3. Check that all styling and interactions work" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Your website should be available at your OVHcloud domain" -ForegroundColor Cyan
