# Check and fix Azure Function App configuration

Write-Host "🔍 Checking Azure Function App Configuration" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Configuration - Update these values
$ResourceGroupName = "your-resource-group-name"  # Replace with your RG
$FunctionAppName = "func-tcdynamics-contact"

Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  Resource Group: $ResourceGroupName" -ForegroundColor White
Write-Host "  Function App: $FunctionAppName" -ForegroundColor White
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
    Write-Host "🔐 Please login to Azure first with: az login" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📋 Checking critical Function App settings..." -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

# Check FUNCTIONS_WORKER_RUNTIME
Write-Host "1️⃣  FUNCTIONS_WORKER_RUNTIME:" -ForegroundColor Yellow
try {
    $workerRuntime = az functionapp config appsettings list --name $FunctionAppName --resource-group $ResourceGroupName --query "[?name=='FUNCTIONS_WORKER_RUNTIME'].value" -o tsv
    if ($workerRuntime -eq 'python') {
        Write-Host "   ✅ Set to: $workerRuntime" -ForegroundColor Green
    } elseif ($workerRuntime) {
        Write-Host "   ❌ Set to: $workerRuntime (should be 'python')" -ForegroundColor Red
        Write-Host "   🔧 Fixing..." -ForegroundColor Yellow
        az functionapp config appsettings set --name $FunctionAppName --resource-group $ResourceGroupName --setting FUNCTIONS_WORKER_RUNTIME=python | Out-Null
        Write-Host "   ✅ Fixed!" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Not set (should be 'python')" -ForegroundColor Red
        Write-Host "   🔧 Setting..." -ForegroundColor Yellow
        az functionapp config appsettings set --name $FunctionAppName --resource-group $ResourceGroupName --setting FUNCTIONS_WORKER_RUNTIME=python | Out-Null
        Write-Host "   ✅ Set!" -ForegroundColor Green
    }
} catch {
    Write-Host "   ❌ Error checking FUNCTIONS_WORKER_RUNTIME: $($_.Exception.Message)" -ForegroundColor Red
}

# Check WEBSITE_RUN_FROM_PACKAGE
Write-Host ""
Write-Host "2️⃣  WEBSITE_RUN_FROM_PACKAGE:" -ForegroundColor Yellow
try {
    $runFromPackage = az functionapp config appsettings list --name $FunctionAppName --resource-group $ResourceGroupName --query "[?name=='WEBSITE_RUN_FROM_PACKAGE'].value" -o tsv
    if ($runFromPackage -eq '1') {
        Write-Host "   ✅ Set to: $runFromPackage" -ForegroundColor Green
    } elseif ($runFromPackage) {
        Write-Host "   ❌ Set to: $runFromPackage (should be '1')" -ForegroundColor Red
        Write-Host "   🔧 Fixing..." -ForegroundColor Yellow
        az functionapp config appsettings set --name $FunctionAppName --resource-group $ResourceGroupName --setting WEBSITE_RUN_FROM_PACKAGE=1 | Out-Null
        Write-Host "   ✅ Fixed!" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Not set (should be '1')" -ForegroundColor Red
        Write-Host "   🔧 Setting..." -ForegroundColor Yellow
        az functionapp config appsettings set --name $FunctionAppName --resource-group $ResourceGroupName --setting WEBSITE_RUN_FROM_PACKAGE=1 | Out-Null
        Write-Host "   ✅ Set!" -ForegroundColor Green
    }
} catch {
    Write-Host "   ❌ Error checking WEBSITE_RUN_FROM_PACKAGE: $($_.Exception.Message)" -ForegroundColor Red
}

# Check AzureWebJobsStorage
Write-Host ""
Write-Host "3️⃣  AzureWebJobsStorage:" -ForegroundColor Yellow
try {
    $storageConnection = az functionapp config appsettings list --name $FunctionAppName --resource-group $ResourceGroupName --query "[?name=='AzureWebJobsStorage'].value" -o tsv
    if ($storageConnection) {
        Write-Host "   ✅ Set (connection string exists)" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Not set (critical for function execution)" -ForegroundColor Red
        Write-Host "   ⚠️  This needs to be configured manually in Azure Portal" -ForegroundColor Yellow
        Write-Host "   📍 Azure Portal → Function App → Configuration → Application settings" -ForegroundColor White
    }
} catch {
    Write-Host "   ❌ Error checking AzureWebJobsStorage: $($_.Exception.Message)" -ForegroundColor Red
}

# Check Python version
Write-Host ""
Write-Host "4️⃣  Python Runtime Version:" -ForegroundColor Yellow
try {
    $pythonVersion = az functionapp config show --name $FunctionAppName --resource-group $ResourceGroupName --query "pythonVersion" -o tsv
    if ($pythonVersion -and $pythonVersion -ne '3.11') {
        Write-Host "   ⚠️  Set to: $pythonVersion (workflow uses 3.11)" -ForegroundColor Yellow
    } elseif ($pythonVersion) {
        Write-Host "   ✅ Set to: $pythonVersion" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Not set" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Error checking Python version: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🔄 Restarting Function App to apply changes..." -ForegroundColor Cyan
try {
    az functionapp restart --name $FunctionAppName --resource-group $ResourceGroupName | Out-Null
    Write-Host "✅ Function App restarted!" -ForegroundColor Green
} catch {
    Write-Host "❌ Error restarting function app: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🧪 Testing health endpoint after fixes..." -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

Start-Sleep -Seconds 10  # Wait for restart

try {
    $healthResponse = curl -s -o /dev/null -w "%{http_code}" https://func-tcdynamics-contact-bjgwe4aaaza9dpbk.francecentral-01.azurewebsites.net/api/health
    if ($healthResponse -eq '200') {
        Write-Host "✅ Health endpoint working! (HTTP $healthResponse)" -ForegroundColor Green
        Write-Host "🎉 Function app is now properly configured!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Health endpoint still returns: HTTP $healthResponse" -ForegroundColor Yellow
        Write-Host "   May need more time for restart to complete" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Error testing health endpoint: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "📋 Summary of fixes applied:" -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor Cyan
Write-Host "• FUNCTIONS_WORKER_RUNTIME = python" -ForegroundColor White
Write-Host "• WEBSITE_RUN_FROM_PACKAGE = 1" -ForegroundColor White
Write-Host "• Function App restarted" -ForegroundColor White
Write-Host ""
Write-Host "🔄 If still not working, check AzureWebJobsStorage manually" -ForegroundColor Yellow
Write-Host "📖 Run again after updating resource group name at top of script" -ForegroundColor White
