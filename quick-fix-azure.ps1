# Quick Fix for Azure Functions 401 Deployment Error
# Since SCM Basic Auth is already enabled, this fixes stale publish profile credentials

Write-Host "🚀 Quick Fix for Azure Functions 401 Deployment Error" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "Since SCM Basic Auth is already enabled, the issue is likely stale publish profile credentials." -ForegroundColor Yellow
Write-Host ""

# Configuration - Update these values for your setup
$ResourceGroupName = "your-resource-group-name"  # Replace with your RG name
$FunctionAppName = "func-tcdynamics-contact"
$GitHubRepo = "your-github-username/your-repo-name"  # Replace with your repo

Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  Resource Group: $ResourceGroupName" -ForegroundColor White
Write-Host "  Function App: $FunctionAppName" -ForegroundColor White
Write-Host "  GitHub Repo: $GitHubRepo" -ForegroundColor White
Write-Host ""

# Check Azure CLI
try {
    $azVersion = az version --query '"azure-cli"' -o tsv 2>$null
    Write-Host "✅ Azure CLI found: $azVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Azure CLI not found!" -ForegroundColor Red
    Write-Host "Install from: https://aka.ms/installazurecliwindows" -ForegroundColor Yellow
    exit 1
}

# Check login status
try {
    $account = az account show --query "name" -o tsv 2>$null
    Write-Host "✅ Logged in to: $account" -ForegroundColor Green
} catch {
    Write-Host "🔐 Please login to Azure first..." -ForegroundColor Yellow
    az login
}

Write-Host ""
Write-Host "🔧 Generating fresh publish profile..." -ForegroundColor Cyan

$publishFile = "$FunctionAppName-fresh-publish-profile.PublishSettings"

try {
    # Generate fresh publish profile
    az functionapp deployment list-publishing-profiles --name $FunctionAppName --resource-group $ResourceGroupName --xml > $publishFile

    Write-Host "✅ Fresh publish profile saved to: $publishFile" -ForegroundColor Green
    Write-Host ""

    # Show the content (first few lines for verification)
    Write-Host "📄 Profile content preview:" -ForegroundColor Cyan
    Get-Content $publishFile -First 5 | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
    Write-Host "   ... (truncated)" -ForegroundColor Gray
    Write-Host ""

} catch {
    Write-Host "❌ Error generating publish profile: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Manual steps:" -ForegroundColor Yellow
    Write-Host "1. Go to Azure Portal → Function App '$FunctionAppName' → Overview" -ForegroundColor White
    Write-Host "2. Click 'Get publish profile'" -ForegroundColor White
    Write-Host "3. Download the .PublishSettings file" -ForegroundColor White
    Write-Host "4. Continue with step 5 below" -ForegroundColor White
    exit 1
}

Write-Host "📋 Instructions to fix the deployment:" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. 📂 Open the file: $publishFile" -ForegroundColor White
Write-Host "2. 📋 Copy the entire XML content (all text in the file)" -ForegroundColor White
Write-Host "3. 🌐 Go to GitHub.com → $GitHubRepo → Settings → Secrets and variables → Actions" -ForegroundColor White
Write-Host "4. 🔍 Find the secret: AZURE_FUNCTIONAPP_PUBLISH_PROFILE" -ForegroundColor White
Write-Host "5. ✏️  Click 'Update secret' and paste the new XML content" -ForegroundColor White
Write-Host "6. 💾 Save the secret" -ForegroundColor White
Write-Host "7. 🚀 Commit and push any change to trigger deployment" -ForegroundColor White
Write-Host ""

Write-Host "🎯 Why this fixes the issue:" -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor Cyan
Write-Host "• When SCM Basic Auth is enabled/disabled, the publish profile credentials become stale" -ForegroundColor White
Write-Host "• The old profile still contains the previous credentials" -ForegroundColor White
Write-Host "• You must download a fresh profile after enabling Basic Auth" -ForegroundColor White
Write-Host "• This new profile contains the correct, updated credentials" -ForegroundColor White
Write-Host ""

Write-Host "🧪 Testing the fix:" -ForegroundColor Cyan
Write-Host "==================" -ForegroundColor Cyan
Write-Host "After updating the GitHub secret:" -ForegroundColor White
Write-Host "1. Push a commit to trigger the deployment workflow" -ForegroundColor White
Write-Host "2. Check the GitHub Actions logs" -ForegroundColor White
Write-Host "3. The 401 error should be resolved!" -ForegroundColor White
Write-Host ""

Write-Host "📖 Additional help: AZURE_DEPLOYMENT_FIX.md" -ForegroundColor Cyan
Write-Host "🔧 Diagnostic script: .\diagnose-azure-401.ps1" -ForegroundColor Cyan
