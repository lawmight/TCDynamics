# Quick script to find Azure resource group containing the Function App

Write-Host "🔍 Finding your Azure resource group..." -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

$FunctionAppName = "func-tcdynamics-contact"

# Check if Azure CLI is available and user is logged in
try {
    $account = az account show --query "name" -o tsv 2>$null
    Write-Host "✅ Logged in to: $account" -ForegroundColor Green
} catch {
    Write-Host "❌ Please login to Azure first with: az login" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Searching for resource group containing: $FunctionAppName" -ForegroundColor White

try {
    # Find the resource group containing the function app
    $resourceGroup = az functionapp show --name $FunctionAppName --query "resourceGroup" -o tsv 2>$null

    if ($resourceGroup) {
        Write-Host "✅ Found resource group: $resourceGroup" -ForegroundColor Green
        Write-Host ""
        Write-Host "📋 Update your quick-fix-azure.ps1 script with:" -ForegroundColor Cyan
        Write-Host "`$ResourceGroupName = `"$resourceGroup`"" -ForegroundColor White
        Write-Host ""
        Write-Host "Then run the script again: .\quick-fix-azure.ps1" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Could not find function app '$FunctionAppName'" -ForegroundColor Red
        Write-Host "Please check the function app name and try again" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Error finding resource group: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Manual check:" -ForegroundColor Yellow
    Write-Host "Go to Azure Portal → Function App → Overview → Resource group" -ForegroundColor White
}
