# TCDynamics Environment Setup Script
# This script helps set up environment variables securely

Write-Host "🔧 TCDynamics Environment Setup" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "📋 Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item "env.example" ".env"
    Write-Host "✅ .env file created" -ForegroundColor Green
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
}

# Generate secure ADMIN_KEY
$adminKey = -join ((0x30..0x39) + (0x41..0x5A) + (0x61..0x7A) | Get-Random -Count 64 | % {[char]$_})
Write-Host "🔑 Generated secure ADMIN_KEY: $adminKey" -ForegroundColor Green

# Update .env file
Write-Host "`n📝 Updating .env file..." -ForegroundColor Yellow
$envContent = Get-Content ".env" -Raw
$envContent = $envContent -replace 'ADMIN_KEY=.*', "ADMIN_KEY=$adminKey"
Set-Content ".env" $envContent
Write-Host "✅ ADMIN_KEY updated in .env" -ForegroundColor Green

# Update Azure Functions local.settings.json
Write-Host "`n📝 Updating Azure Functions local.settings.json..." -ForegroundColor Yellow
$localSettingsPath = "TCDynamics/local.settings.json"
if (Test-Path $localSettingsPath) {
    $localSettings = Get-Content $localSettingsPath -Raw | ConvertFrom-Json
    $localSettings.Values.ADMIN_KEY = $adminKey
    $localSettings | ConvertTo-Json -Depth 10 | Set-Content $localSettingsPath
    Write-Host "✅ ADMIN_KEY updated in local.settings.json" -ForegroundColor Green
} else {
    Write-Host "⚠️  local.settings.json not found" -ForegroundColor Yellow
}

# Check for placeholder values that need manual configuration
Write-Host "`n🔍 Checking for values that need manual configuration..." -ForegroundColor Yellow

$manualConfigs = @(
    @{File = ".env"; Pattern = "your-cosmos-connection-string"; Description = "Cosmos DB Connection String"},
    @{File = ".env"; Pattern = "your-storage-connection-string"; Description = "Azure Storage Connection String"},
    @{File = ".env"; Pattern = "your-app-insights-connection"; Description = "Application Insights Connection String"},
    @{File = ".env"; Pattern = "your-redis-connection-string"; Description = "Redis Connection String"},
    @{File = "TCDynamics/local.settings.json"; Pattern = "your-zoho-app-password"; Description = "ZOHO Email Password (App Password)"},
    @{File = "TCDynamics/local.settings.json"; Pattern = "your-cosmos-connection-string"; Description = "Cosmos DB Connection String"},
    @{File = "TCDynamics/local.settings.json"; Pattern = "sk_test_..."; Description = "Stripe Secret Key"},
    @{File = "TCDynamics/local.settings.json"; Pattern = "pk_test_..."; Description = "Stripe Publishable Key"}
)

$placeholdersFound = @()
foreach ($config in $manualConfigs) {
    $file = $config.File
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        if ($content -match $config.Pattern) {
            $placeholdersFound += "$($config.Description) in $file"
        }
    }
}

if ($placeholdersFound.Count -gt 0) {
    Write-Host "`n⚠️  Found $($placeholdersFound.Count) placeholder values that need manual configuration:" -ForegroundColor Yellow
    foreach ($placeholder in $placeholdersFound) {
        Write-Host "  • $placeholder" -ForegroundColor Yellow
    }
} else {
    Write-Host "`n✅ No placeholder values found!" -ForegroundColor Green
}

# Display next steps
Write-Host "`n🚀 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Configure your ZOHO email app password:" -ForegroundColor White
Write-Host "   • Go to https://mail.zoho.eu" -ForegroundColor Gray
Write-Host "   • Login to your Zoho account" -ForegroundColor Gray
Write-Host "   • Settings → Security → App Passwords" -ForegroundColor Gray
Write-Host "   • Generate an app password for 'contact@tcdynamics.fr'" -ForegroundColor Gray
Write-Host "   • Update ZOHO_PASSWORD in TCDynamics/local.settings.json" -ForegroundColor Gray

Write-Host "`n2. Configure Stripe keys (if using payments):" -ForegroundColor White
Write-Host "   • Get keys from https://dashboard.stripe.com/test/apikeys" -ForegroundColor Gray
Write-Host "   • Update STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY" -ForegroundColor Gray

Write-Host "`n3. Configure optional services as needed:" -ForegroundColor White
Write-Host "   • Cosmos DB, Application Insights, Redis" -ForegroundColor Gray

Write-Host "`n4. Run validation script:" -ForegroundColor White
Write-Host "   .\validate-environment.ps1" -ForegroundColor Gray

Write-Host "`n5. Test your application:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Gray

Write-Host "`n🔒 Security Note: Never commit the .env file to version control!" -ForegroundColor Red
Write-Host "📚 See ENVIRONMENT-SETUP.md for detailed configuration instructions" -ForegroundColor Cyan
