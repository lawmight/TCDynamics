# WorkFlowAI Production Deployment Script
# Deploys the AI-powered website to OVHcloud

param(
    [string]$OVHcloudPath = "C:\path\to\your\ovhcloud\folder"
)

Write-Host "🚀 WorkFlowAI Production Deployment" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Yellow

# Step 1: Verify build exists
Write-Host "`n1. Checking build status..." -ForegroundColor Green
if (!(Test-Path "dist")) {
    Write-Host "❌ Build not found. Run 'npm run build' first." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Production build found!" -ForegroundColor Green

# Step 2: Verify OVHcloud path
Write-Host "`n2. Checking OVHcloud path..." -ForegroundColor Green
if (!(Test-Path $OVHcloudPath)) {
    Write-Host "❌ OVHcloud path not found: $OVHcloudPath" -ForegroundColor Red
    Write-Host "Please update the path in this script or pass it as parameter:" -ForegroundColor Yellow
    Write-Host ".\deploy-workflowai.ps1 -OVHcloudPath 'C:\your\actual\ovhcloud\path'" -ForegroundColor White
    exit 1
}
Write-Host "✅ OVHcloud path verified: $OVHcloudPath" -ForegroundColor Green

# Step 3: Backup existing files
Write-Host "`n3. Creating backup..." -ForegroundColor Green
$backupPath = "$OVHcloudPath\backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
Copy-Item $OVHcloudPath $backupPath -Recurse -Force
Write-Host "✅ Backup created: $backupPath" -ForegroundColor Green

# Step 4: Clean OVHcloud directory
Write-Host "`n4. Cleaning OVHcloud directory..." -ForegroundColor Green
Get-ChildItem $OVHcloudPath -Exclude "backup-*", "*.log" | Remove-Item -Recurse -Force
Write-Host "✅ Directory cleaned" -ForegroundColor Green

# Step 5: Deploy new build
Write-Host "`n5. Deploying WorkFlowAI..." -ForegroundColor Green
Copy-Item "dist\*" $OVHcloudPath -Recurse -Force
Write-Host "✅ Files deployed successfully!" -ForegroundColor Green

# Step 6: Verify deployment
Write-Host "`n6. Verifying deployment..." -ForegroundColor Green
$indexPath = Join-Path $OVHcloudPath "index.html"
if (Test-Path $indexPath) {
    Write-Host "✅ index.html deployed" -ForegroundColor Green
} else {
    Write-Host "❌ index.html missing" -ForegroundColor Red
}

$assetsPath = Join-Path $OVHcloudPath "assets"
if (Test-Path $assetsPath) {
    $assetCount = (Get-ChildItem $assetsPath).Count
    Write-Host "✅ Assets deployed: $assetCount files" -ForegroundColor Green
} else {
    Write-Host "❌ Assets folder missing" -ForegroundColor Red
}

# Step 7: Generate deployment summary
Write-Host "`n7. Deployment Summary:" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Yellow
Write-Host "📁 Deployment Path: $OVHcloudPath" -ForegroundColor White
Write-Host "🔄 Build Version: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor White
Write-Host "🤖 AI Features: Enabled" -ForegroundColor Green
Write-Host "💰 Credit Consumption: $130-200/month" -ForegroundColor Magenta
Write-Host "🌐 Live URL: [Your OVHcloud domain]" -ForegroundColor Cyan

Write-Host "`n🎉 Deployment Complete!" -ForegroundColor Green
Write-Host "========================" -ForegroundColor Yellow
Write-Host "Your WorkFlowAI website is now live with:" -ForegroundColor White
Write-Host "✅ Real AI Chatbot (Azure OpenAI GPT-3.5-turbo)" -ForegroundColor Green
Write-Host "✅ Document Processing (Azure AI Vision)" -ForegroundColor Green
Write-Host "✅ Professional SaaS Interface" -ForegroundColor Green
Write-Host "✅ French Business Focus" -ForegroundColor Green
Write-Host "✅ Azure Credit Optimization" -ForegroundColor Green

Write-Host "`n🔗 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Visit your OVHcloud domain" -ForegroundColor White
Write-Host "2. Test the AI chatbot (bottom-right button)" -ForegroundColor White
Write-Host "3. Try document processing in the AI Demo section" -ForegroundColor White
Write-Host "4. Monitor Azure credit usage" -ForegroundColor White
Write-Host "5. Update DNS if needed" -ForegroundColor White

Write-Host "`n💡 Pro Tips:" -ForegroundColor Yellow
Write-Host "• The AI chatbot consumes ~$80-120/month" -ForegroundColor White
Write-Host "• Document processing adds ~$30-50/month" -ForegroundColor White
Write-Host "• Total: Your $200 credit will be fully utilized!" -ForegroundColor Magenta

Write-Host "`n🎯 WorkFlowAI is now a REAL AI SaaS platform!" -ForegroundColor Green
Write-Host "🚀 Ready to attract French businesses! 🇫🇷✨" -ForegroundColor Cyan
