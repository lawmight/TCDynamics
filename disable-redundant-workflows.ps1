# TCDynamics - Disable Redundant Workflows Script
# This script disables redundant GitHub Actions workflows

Write-Host "🔄 TCDynamics - Disabling Redundant Workflows" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Check if .github/workflows directory exists
if (-not (Test-Path ".github/workflows")) {
    Write-Host "❌ .github/workflows directory not found!" -ForegroundColor Red
    Write-Host "Please run this script from the root of your TCDynamics repository." -ForegroundColor Yellow
    exit 1
}

# List of workflows to disable (rename to .disabled)
$redundantWorkflows = @(
    "deploy-frontend.yml",
    "deploy-backend.yml", 
    "deploy-azure-functions.yml",
    "test-frontend.yml",
    "test-backend.yml",
    "ci.yml",
    "cd.yml",
    "build-and-deploy.yml",
    "frontend-deploy.yml",
    "backend-deploy.yml",
    "azure-functions-deploy.yml"
)

$disabledCount = 0
$skippedCount = 0

Write-Host "`n📋 Checking for redundant workflows..." -ForegroundColor Yellow

foreach ($workflow in $redundantWorkflows) {
    $workflowPath = ".github/workflows/$workflow"
    
    if (Test-Path $workflowPath) {
        Write-Host "📝 Disabling: $workflow" -ForegroundColor Green
        Rename-Item $workflowPath "$workflowPath.disabled"
        $disabledCount++
    } else {
        Write-Host "ℹ️  Not found: $workflow" -ForegroundColor Gray
        $skippedCount++
    }
}

Write-Host "`n✅ Workflow Management Complete!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host "📊 Disabled: $disabledCount workflows" -ForegroundColor Green
Write-Host "📊 Skipped: $skippedCount workflows" -ForegroundColor Gray
Write-Host "📊 Active: 1 workflow (tcdynamics-hybrid-deploy.yml)" -ForegroundColor Cyan

Write-Host "`n🎯 Active Workflow:" -ForegroundColor Cyan
Write-Host "  • tcdynamics-hybrid-deploy.yml" -ForegroundColor White

Write-Host "`n📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Commit and push these changes to GitHub" -ForegroundColor White
Write-Host "2. Configure GitHub Secrets for Azure deployment" -ForegroundColor White
Write-Host "3. Set up environment variables in Azure Functions" -ForegroundColor White
Write-Host "4. Test the hybrid deployment workflow" -ForegroundColor White

Write-Host "`n🔧 Required GitHub Secrets:" -ForegroundColor Yellow
Write-Host "  • AZURE_CREDENTIALS" -ForegroundColor White
Write-Host "  • AZURE_FUNCTIONAPP_PUBLISH_PROFILE" -ForegroundColor White

Write-Host "`n📚 For detailed setup instructions, see DEPLOYMENT.md" -ForegroundColor Cyan

# Check if git is available
if (Get-Command git -ErrorAction SilentlyContinue) {
    Write-Host "`n🚀 Ready to commit changes? (y/n): " -ForegroundColor Yellow -NoNewline
    $commit = Read-Host
    
    if ($commit -eq "y" -or $commit -eq "Y") {
        Write-Host "📝 Committing changes..." -ForegroundColor Green
        git add .github/workflows/
        git commit -m "Disable redundant workflows - keep only hybrid deployment"
        Write-Host "✅ Changes committed! Run 'git push' to push to GitHub." -ForegroundColor Green
    }
} else {
    Write-Host "`n⚠️  Git not found. Please commit changes manually:" -ForegroundColor Yellow
    Write-Host "   git add .github/workflows/" -ForegroundColor White
    Write-Host "   git commit -m 'Disable redundant workflows'" -ForegroundColor White
    Write-Host "   git push" -ForegroundColor White
}

Write-Host "`n🎉 TCDynamics workflow cleanup complete!" -ForegroundColor Green

