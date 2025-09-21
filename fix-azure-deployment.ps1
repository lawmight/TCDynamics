# Azure Functions Deployment Fix Script
# This script helps fix the 401 Unauthorized error during Azure Functions deployment

param(
    [Parameter(Mandatory=$true)]
    [string]$ResourceGroupName,

    [Parameter(Mandatory=$true)]
    [string]$FunctionAppName,

    [Parameter(Mandatory=$false)]
    [switch]$EnableBasicAuth,

    [Parameter(Mandatory=$false)]
    [switch]$ShowCurrentConfig,

    [Parameter(Mandatory=$false)]
    [switch]$TestDeployment
)

Write-Host "🔧 Azure Functions Deployment Fix Script" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Azure CLI is installed
try {
    $azVersion = az version --query '"azure-cli"' -o tsv
    Write-Host "✅ Azure CLI version: $azVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Azure CLI not found. Please install Azure CLI first." -ForegroundColor Red
    Write-Host "Download from: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli" -ForegroundColor Yellow
    exit 1
}

# Login to Azure if not already logged in
try {
    $account = az account show --query "name" -o tsv 2>$null
    Write-Host "✅ Logged in to Azure account: $account" -ForegroundColor Green
} catch {
    Write-Host "🔐 Please login to Azure..." -ForegroundColor Yellow
    az login
}

if ($ShowCurrentConfig) {
    Write-Host ""
    Write-Host "📋 Current Function App Configuration:" -ForegroundColor Cyan
    Write-Host "==========================================" -ForegroundColor Cyan

    try {
        # Get basic auth status
        $basicAuth = az functionapp config show --name $FunctionAppName --resource-group $ResourceGroupName --query "basicAuthEnabled" -o tsv
        Write-Host "SCM Basic Auth: $(if ($basicAuth -eq 'true') { '✅ Enabled' } else { '❌ Disabled' })" -ForegroundColor $(if ($basicAuth -eq 'true') { 'Green' } else { 'Red' })

        # Get function app settings
        Write-Host ""
        Write-Host "Function App Settings:" -ForegroundColor Cyan
        az functionapp config appsettings list --name $FunctionAppName --resource-group $ResourceGroupName --query "[].{Name:name, Value:value}" -o table

        # Get runtime settings
        Write-Host ""
        Write-Host "Runtime Settings:" -ForegroundColor Cyan
        az functionapp config show --name $FunctionAppName --resource-group $ResourceGroupName --query "{runtime:'~' + pythonVersion, os:kind, sku:sku}" -o json | ConvertFrom-Json

    } catch {
        Write-Host "❌ Error retrieving configuration: $($_.Exception.Message)" -ForegroundColor Red
    }

    Write-Host ""
    return
}

if ($EnableBasicAuth) {
    Write-Host ""
    Write-Host "🔧 Enabling SCM Basic Auth Publishing Credentials..." -ForegroundColor Cyan
    Write-Host "======================================================" -ForegroundColor Cyan

    try {
        az functionapp config set --name $FunctionAppName --resource-group $ResourceGroupName --generic-configurations '{"basicAuthEnabled": true}'
        Write-Host "✅ SCM Basic Auth enabled successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "⚠️  WARNING: Basic Auth is now enabled for security reasons." -ForegroundColor Yellow
        Write-Host "   Consider migrating to OIDC authentication for better security." -ForegroundColor Yellow
        Write-Host "   See AZURE_DEPLOYMENT_FIX.md for OIDC migration instructions." -ForegroundColor Yellow

    } catch {
        Write-Host "❌ Failed to enable basic auth: $($_.Exception.Message)" -ForegroundColor Red
    }

    Write-Host ""
}

if ($TestDeployment) {
    Write-Host ""
    Write-Host "🧪 Testing Function App Deployment..." -ForegroundColor Cyan
    Write-Host "======================================" -ForegroundColor Cyan

    try {
        # Test health endpoint
        $healthUrl = "https://$FunctionAppName.azurewebsites.net/api/health"
        Write-Host "Testing health endpoint: $healthUrl" -ForegroundColor Cyan

        $response = Invoke-WebRequest -Uri $healthUrl -Method GET -TimeoutSec 30
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Health check passed!" -ForegroundColor Green
            $body = $response.Content | ConvertFrom-Json
            Write-Host "   Status: $($body.status)" -ForegroundColor Green
            Write-Host "   Uptime: $($body.uptime) seconds" -ForegroundColor Green
        } else {
            Write-Host "❌ Health check failed with status: $($response.StatusCode)" -ForegroundColor Red
        }

    } catch {
        Write-Host "❌ Health check error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "   This may indicate deployment issues." -ForegroundColor Yellow
    }

    Write-Host ""
}

Write-Host "📝 Next Steps:" -ForegroundColor Cyan
Write-Host "==============" -ForegroundColor Cyan
Write-Host "1. If you enabled basic auth, redeploy your application" -ForegroundColor White
Write-Host "2. If still failing, check AZURE_DEPLOYMENT_FIX.md for alternative solutions" -ForegroundColor White
Write-Host "3. Consider migrating to OIDC authentication for better security" -ForegroundColor White
Write-Host ""
Write-Host "📖 Documentation: AZURE_DEPLOYMENT_FIX.md" -ForegroundColor Cyan

# Example usage
Write-Host ""
Write-Host "💡 Example Usage:" -ForegroundColor Gray
Write-Host "=================" -ForegroundColor Gray
Write-Host "# Enable basic auth (quick fix):" -ForegroundColor Gray
Write-Host ".\fix-azure-deployment.ps1 -ResourceGroupName 'your-rg' -FunctionAppName 'func-tcdynamics-contact' -EnableBasicAuth" -ForegroundColor Gray
Write-Host ""
Write-Host "# Check current configuration:" -ForegroundColor Gray
Write-Host ".\fix-azure-deployment.ps1 -ResourceGroupName 'your-rg' -FunctionAppName 'func-tcdynamics-contact' -ShowCurrentConfig" -ForegroundColor Gray
Write-Host ""
Write-Host "# Test deployment:" -ForegroundColor Gray
Write-Host ".\fix-azure-deployment.ps1 -ResourceGroupName 'your-rg' -FunctionAppName 'func-tcdynamics-contact' -TestDeployment" -ForegroundColor Gray
