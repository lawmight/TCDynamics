# Verify Azure Function App settings are correctly configured

Write-Host "🔍 Verifying Azure Function App Settings" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Configuration - Update these values
$ResourceGroupName = "your-resource-group-name"  # Replace with your RG
$FunctionAppName = "func-tcdynamics-contact"

Write-Host "Checking function app: $FunctionAppName" -ForegroundColor Yellow
Write-Host "Resource group: $ResourceGroupName" -ForegroundColor Yellow
Write-Host ""

# Check Azure CLI
try {
    $azVersion = az version --query '"azure-cli"' -o tsv 2>$null
    Write-Host "✅ Azure CLI found" -ForegroundColor Green
} catch {
    Write-Host "❌ Azure CLI not found!" -ForegroundColor Red
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
Write-Host "📋 Checking required settings for Azure Functions v2 Python model..." -ForegroundColor Cyan
Write-Host ""

$requiredSettings = @(
    @{Name="FUNCTIONS_WORKER_RUNTIME"; RequiredValue="python"; Critical=$true},
    @{Name="FUNCTIONS_EXTENSION_VERSION"; RequiredValue="~4"; Critical=$true},
    @{Name="WEBSITE_RUN_FROM_PACKAGE"; RequiredValue="1"; Critical=$true},
    @{Name="AzureWebJobsFeatureFlags"; RequiredValue="EnableWorkerIndexing"; Critical=$true}
)

$allGood = $true

foreach ($setting in $requiredSettings) {
    Write-Host "$($setting.Name):" -ForegroundColor Yellow
    try {
        $value = az functionapp config appsettings list --name $FunctionAppName --resource-group $ResourceGroupName --query "[?name=='$($setting.Name)'].value" -o tsv
        if ($value -eq $setting.RequiredValue) {
            Write-Host "   ✅ Correctly set to: $value" -ForegroundColor Green
        } elseif ($value) {
            Write-Host "   ❌ Incorrect value: $value (should be: $($setting.RequiredValue))" -ForegroundColor Red
            $allGood = $false
        } else {
            Write-Host "   ❌ Not set (should be: $($setting.RequiredValue))" -ForegroundColor Red
            $allGood = $false
        }
    } catch {
        Write-Host "   ❌ Error checking setting: $($_.Exception.Message)" -ForegroundColor Red
        $allGood = $false
    }
    Write-Host ""
}

# Check function app runtime version
Write-Host "Python Runtime Version:" -ForegroundColor Yellow
try {
    $pythonVersion = az functionapp config show --name $FunctionAppName --resource-group $ResourceGroupName --query "pythonVersion" -o tsv
    if ($pythonVersion -and $pythonVersion -ne '3.11') {
        Write-Host "   ⚠️ Set to: $pythonVersion (workflow uses 3.11)" -ForegroundColor Yellow
    } elseif ($pythonVersion) {
        Write-Host "   ✅ Set to: $pythonVersion" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Not set" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Error checking Python version: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "📊 Summary:" -ForegroundColor Cyan
Write-Host "==========" -ForegroundColor Cyan

if ($allGood) {
    Write-Host "✅ All critical settings are correctly configured!" -ForegroundColor Green
    Write-Host ""
    Write-Host "If deployment still fails, the issue might be:" -ForegroundColor Yellow
    Write-Host "• Function app needs restart" -ForegroundColor White
    Write-Host "• Package structure issues" -ForegroundColor White
    Write-Host "• Deployment timing issues" -ForegroundColor White
} else {
    Write-Host "❌ Some settings are missing or incorrect!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Fix the settings above, then restart the function app." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To fix automatically, run: .\set-azure-functions-config.ps1" -ForegroundColor Green
}

Write-Host ""
Write-Host "🔄 Next steps:" -ForegroundColor Cyan
Write-Host "=============" -ForegroundColor Cyan
Write-Host "1. Fix any incorrect settings above" -ForegroundColor White
Write-Host "2. Restart the function app in Azure Portal" -ForegroundColor White
Write-Host "3. Trigger a new deployment" -ForegroundColor White
Write-Host "4. Monitor the Actions tab" -ForegroundColor White

Write-Host ""
Write-Host "Note: Update the resource group name at the top of this script!" -ForegroundColor Yellow
