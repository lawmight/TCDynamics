# TCDynamics Environment Validation Script
# This script validates that all required environment variables are properly configured

Write-Host "🔍 TCDynamics Environment Validation" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

$errors = @()
$warnings = @()

# Check if .env file exists
if (-not (Test-Path ".env")) {
    $errors += "❌ .env file not found - create it from env.example"
} else {
    Write-Host "✅ .env file exists" -ForegroundColor Green

    # Check frontend environment variables
    $envContent = Get-Content ".env" -Raw

    # Required frontend variables
    $requiredFrontendVars = @(
        "VITE_AZURE_FUNCTIONS_URL"
    )

    foreach ($var in $requiredFrontendVars) {
        if ($envContent -notmatch "$var=") {
            $errors += "❌ Missing required frontend variable: $var"
        } else {
            Write-Host "✅ Frontend variable found: $var" -ForegroundColor Green
        }
    }

    # Check if VITE_AZURE_FUNCTIONS_URL has correct value
    if ($envContent -match "VITE_AZURE_FUNCTIONS_URL=(.+)") {
        $functionsUrl = $matches[1].Trim()
        $expectedUrl = "https://func-tcdynamics-contact-bjgwe4aaaza9dpbk.francecentral-01.azurewebsites.net/api"
        if ($functionsUrl -ne $expectedUrl) {
            $warnings += "⚠️  VITE_AZURE_FUNCTIONS_URL may be incorrect. Expected: $expectedUrl"
        } else {
            Write-Host "✅ VITE_AZURE_FUNCTIONS_URL is correct" -ForegroundColor Green
        }
    }
}

# Check Azure Functions local.settings.json
$localSettingsPath = "TCDynamics/local.settings.json"
if (-not (Test-Path $localSettingsPath)) {
    $errors += "❌ Azure Functions local.settings.json not found"
} else {
    Write-Host "✅ Azure Functions local.settings.json exists" -ForegroundColor Green

    try {
        $localSettings = Get-Content $localSettingsPath -Raw | ConvertFrom-Json

        # Check required Azure Functions variables
        $requiredAzVars = @(
            "ZOHO_EMAIL",
            "ZOHO_PASSWORD",
            "ADMIN_KEY",
            "FUNCTIONS_WORKER_RUNTIME",
            "AzureWebJobsStorage"
        )

        foreach ($var in $requiredAzVars) {
            if (-not $localSettings.Values.$var -or $localSettings.Values.$var -eq "") {
                $errors += "❌ Missing or empty Azure Functions variable: $var"
            } elseif ($localSettings.Values.$var -match "your-|change-this|test-") {
                $errors += "❌ Azure Functions variable has placeholder value: $var"
            } else {
                Write-Host "✅ Azure Functions variable configured: $var" -ForegroundColor Green
            }
        }

        # Check ZOHO_EMAIL format
        if ($localSettings.Values.ZOHO_EMAIL -and $localSettings.Values.ZOHO_EMAIL -notmatch "@") {
            $warnings += "⚠️  ZOHO_EMAIL doesn't look like a valid email address"
        }

        # Check ADMIN_KEY length
        if ($localSettings.Values.ADMIN_KEY -and $localSettings.Values.ADMIN_KEY.Length -lt 32) {
            $warnings += "⚠️  ADMIN_KEY should be at least 32 characters long"
        }

    } catch {
        $errors += "❌ Error parsing local.settings.json: $_"
    }
}

# Test Azure Functions connectivity
Write-Host "`n🔗 Testing Azure Functions connectivity..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://func-tcdynamics-contact-bjgwe4aaaza9dpbk.francecentral-01.azurewebsites.net/api/health" -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Azure Functions health check passed" -ForegroundColor Green
    } else {
        $warnings += "⚠️  Azure Functions health check returned status: $($response.StatusCode)"
    }
} catch {
    $warnings += "⚠️  Azure Functions health check failed: $_"
}

# Display results
Write-Host "`n📊 Validation Results:" -ForegroundColor Cyan
Write-Host "====================" -ForegroundColor Cyan

if ($errors.Count -eq 0) {
    Write-Host "✅ All required environment variables are configured!" -ForegroundColor Green
} else {
    Write-Host "❌ Found $($errors.Count) error(s) that need to be fixed:" -ForegroundColor Red
    foreach ($error in $errors) {
        Write-Host "  $error" -ForegroundColor Red
    }
}

if ($warnings.Count -gt 0) {
    Write-Host "`n⚠️  Found $($warnings.Count) warning(s):" -ForegroundColor Yellow
    foreach ($warning in $warnings) {
        Write-Host "  $warning" -ForegroundColor Yellow
    }
}

# Provide next steps
Write-Host "`n🚀 Next Steps:" -ForegroundColor Cyan
if ($errors.Count -gt 0) {
    Write-Host "1. Fix the errors listed above" -ForegroundColor White
    Write-Host "2. Run this script again to validate" -ForegroundColor White
    Write-Host "3. Test your application locally" -ForegroundColor White
} else {
    Write-Host "1. Your environment is properly configured!" -ForegroundColor Green
    Write-Host "2. Start your development server: npm run dev" -ForegroundColor White
    Write-Host "3. Test contact forms and AI features" -ForegroundColor White
}

# Environment template for missing .env file
if (-not (Test-Path ".env")) {
    Write-Host "`n📝 To create .env file, run:" -ForegroundColor Yellow
    Write-Host "  cp env.example .env" -ForegroundColor White
    Write-Host "  # Then edit .env with your actual values" -ForegroundColor White
}

Write-Host "`n📚 For detailed setup instructions, see ENVIRONMENT-SETUP.md" -ForegroundColor Cyan
