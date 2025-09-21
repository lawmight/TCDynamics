# Script to set required Azure Functions configuration for v2 Python model

Write-Host "🔧 Azure Functions v2 Configuration Setup" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# Configuration
$ResourceGroupName = "your-resource-group-name"  # Replace with your RG
$FunctionAppName = "func-tcdynamics-contact"

Write-Host "Target Function App: $FunctionAppName" -ForegroundColor Yellow
Write-Host "Resource Group: $ResourceGroupName" -ForegroundColor Yellow
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

# Check login
try {
    $account = az account show --query "name" -o tsv 2>$null
    Write-Host "✅ Logged in to: $account" -ForegroundColor Green
} catch {
    Write-Host "🔐 Please login to Azure first with: az login" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📋 Setting required configuration for Azure Functions v2 Python model..." -ForegroundColor Cyan
Write-Host ""

# Set FUNCTIONS_WORKER_RUNTIME
Write-Host "1️⃣ Setting FUNCTIONS_WORKER_RUNTIME..." -ForegroundColor Yellow
try {
    az functionapp config appsettings set --name $FunctionAppName --resource-group $ResourceGroupName --setting FUNCTIONS_WORKER_RUNTIME=python | Out-Null
    Write-Host "✅ FUNCTIONS_WORKER_RUNTIME = python" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to set FUNCTIONS_WORKER_RUNTIME: $($_.Exception.Message)" -ForegroundColor Red
}

# Set WEBSITE_RUN_FROM_PACKAGE
Write-Host "2️⃣ Setting WEBSITE_RUN_FROM_PACKAGE..." -ForegroundColor Yellow
try {
    az functionapp config appsettings set --name $FunctionAppName --resource-group $ResourceGroupName --setting WEBSITE_RUN_FROM_PACKAGE=1 | Out-Null
    Write-Host "✅ WEBSITE_RUN_FROM_PACKAGE = 1" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to set WEBSITE_RUN_FROM_PACKAGE: $($_.Exception.Message)" -ForegroundColor Red
}

# Set FUNCTIONS_EXTENSION_VERSION (CRITICAL for v2 model)
Write-Host "3️⃣ Setting FUNCTIONS_EXTENSION_VERSION (CRITICAL)..." -ForegroundColor Yellow
try {
    az functionapp config appsettings set --name $FunctionAppName --resource-group $ResourceGroupName --setting FUNCTIONS_EXTENSION_VERSION=~4 | Out-Null
    Write-Host "✅ FUNCTIONS_EXTENSION_VERSION = ~4" -ForegroundColor Green
    Write-Host "   This enables Azure Functions v2 runtime!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to set FUNCTIONS_EXTENSION_VERSION: $($_.Exception.Message)" -ForegroundColor Red
}

# Set AzureWebJobsFeatureFlags (CRITICAL for v2 model)
Write-Host "4️⃣ Setting AzureWebJobsFeatureFlags (CRITICAL)..." -ForegroundColor Yellow
try {
    az functionapp config appsettings set --name $FunctionAppName --resource-group $ResourceGroupName --setting AzureWebJobsFeatureFlags=EnableWorkerIndexing | Out-Null
    Write-Host "✅ AzureWebJobsFeatureFlags = EnableWorkerIndexing" -ForegroundColor Green
    Write-Host "   This enables function discovery for @app.route() decorators!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to set AzureWebJobsFeatureFlags: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🔄 Restarting function app to apply changes..." -ForegroundColor Cyan
try {
    az functionapp restart --name $FunctionAppName --resource-group $ResourceGroupName | Out-Null
    Write-Host "✅ Function app restarted!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to restart function app: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "📋 Verification - Current settings:" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan

# Verify all settings
$settings = @(
    "FUNCTIONS_WORKER_RUNTIME",
    "WEBSITE_RUN_FROM_PACKAGE",
    "AzureWebJobsFeatureFlags"
)

foreach ($setting in $settings) {
    try {
        $value = az functionapp config appsettings list --name $FunctionAppName --resource-group $ResourceGroupName --query "[?name=='$setting'].value" -o tsv
        if ($value) {
            Write-Host "✅ $setting = $value" -ForegroundColor Green
        } else {
            Write-Host "❌ $setting = NOT SET" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Error checking $setting" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🎉 Configuration complete!" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Make a small change to trigger deployment (update package.json)" -ForegroundColor White
Write-Host "2. Push the change to GitHub" -ForegroundColor White
Write-Host "3. Monitor the Actions tab for successful deployment" -ForegroundColor White
Write-Host ""
Write-Host "The 400 Bad Request error should now be resolved!" -ForegroundColor Green
Write-Host ""
Write-Host "Note: Update the resource group name at the top of this script first!" -ForegroundColor Yellow
