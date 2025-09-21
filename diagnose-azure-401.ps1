# Azure Functions 401 Unauthorized - Diagnostic Script
# This script diagnoses and fixes the stale publish profile issue

Write-Host "🔍 Azure Functions 401 Unauthorized - Diagnostic Script" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

# Configuration - Update these values
$ResourceGroupName = "your-resource-group-name"  # Replace with your RG
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
Write-Host "🔧 Diagnosing Azure Functions deployment issues..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Check SCM Basic Auth status
Write-Host "1️⃣  Checking SCM Basic Auth status..." -ForegroundColor Yellow
try {
    $basicAuth = az functionapp config show --name $FunctionAppName --resource-group $ResourceGroupName --query "basicAuthEnabled" -o tsv
    if ($basicAuth -eq 'true') {
        Write-Host "✅ SCM Basic Auth: ENABLED" -ForegroundColor Green
    } else {
        Write-Host "❌ SCM Basic Auth: DISABLED" -ForegroundColor Red
        Write-Host "   Fix: Enable SCM Basic Auth in Azure Portal" -ForegroundColor Yellow
        Write-Host "   Settings → Configuration → General settings → SCM Basic Auth Publishing Credentials → On" -ForegroundColor White
        exit 1
    }
} catch {
    Write-Host "❌ Error checking Basic Auth: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 2: Check FTP Basic Auth (also needed for deployments)
Write-Host ""
Write-Host "2️⃣  Checking FTP Basic Auth status..." -ForegroundColor Yellow
try {
    $ftpAuth = az functionapp config show --name $FunctionAppName --resource-group $ResourceGroupName --query "ftp.state" -o tsv
    Write-Host "FTP Basic Auth State: $ftpAuth" -ForegroundColor White

    if ($ftpAuth -ne 'AllAllowed') {
        Write-Host "⚠️  FTP Basic Auth may need to be enabled" -ForegroundColor Yellow
        Write-Host "   This can cause 401 errors in some deployment scenarios" -ForegroundColor White
    }
} catch {
    Write-Host "⚠️  Could not check FTP Auth status" -ForegroundColor Yellow
}

# Step 3: Test SCM endpoint access
Write-Host ""
Write-Host "3️⃣  Testing SCM endpoint access..." -ForegroundColor Yellow
try {
    # Get publish profile credentials
    $publishProfile = az functionapp deployment list-publishing-profiles --name $FunctionAppName --resource-group $ResourceGroupName --xml 2>$null

    if ($publishProfile) {
        # Extract credentials from XML
        $xml = [xml]$publishProfile
        $publishProfileData = $xml.publishData.publishProfile | Where-Object { $_.publishMethod -eq 'MSDeploy' } | Select-Object -First 1

        if ($publishProfileData) {
            $scmUrl = $publishProfileData.publishUrl -replace ':443', ''  # Remove port if present
            $username = $publishProfileData.userName
            $password = $publishProfileData.userPWD

            Write-Host "Testing SCM endpoint: https://$scmUrl/api/settings" -ForegroundColor White

            # Test the endpoint
            $pair = "$($username):$password"
            $encodedCreds = [System.Convert]::ToBase64String([System.Text.Encoding]::ASCII.GetBytes($pair))
            $basicAuthValue = "Basic $encodedCreds"

            $headers = @{
                Authorization = $basicAuthValue
            }

            try {
                Invoke-WebRequest -Uri "https://$scmUrl/api/settings" -Headers $headers -Method GET -TimeoutSec 30 | Out-Null
                Write-Host "✅ SCM endpoint accessible!" -ForegroundColor Green
            } catch {
                Write-Host "❌ SCM endpoint test failed: $($_.Exception.Message)" -ForegroundColor Red
                Write-Host "   This confirms the publish profile credentials are invalid" -ForegroundColor Yellow
            }
        } else {
            Write-Host "❌ No MSDeploy profile found in publish profile" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Could not retrieve publish profile" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error testing SCM endpoint: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 4: Generate fresh publish profile
Write-Host ""
Write-Host "4️⃣  Generating fresh publish profile..." -ForegroundColor Yellow

$publishFile = "$FunctionAppName-publish-profile.PublishSettings"
try {
    az functionapp deployment list-publishing-profiles --name $FunctionAppName --resource-group $ResourceGroupName --xml > $publishFile
    Write-Host "✅ Fresh publish profile saved to: $publishFile" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next Steps:" -ForegroundColor Cyan
    Write-Host "1. Open $publishFile in a text editor" -ForegroundColor White
    Write-Host "2. Copy the entire XML content" -ForegroundColor White
    Write-Host "3. Go to GitHub → $GitHubRepo → Settings → Secrets → Actions" -ForegroundColor White
    Write-Host "4. Update AZURE_FUNCTIONAPP_PUBLISH_PROFILE with the new XML" -ForegroundColor White
    Write-Host "5. Commit and push to trigger deployment" -ForegroundColor White

} catch {
    Write-Host "❌ Error generating publish profile: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Manual steps:" -ForegroundColor Yellow
    Write-Host "1. Go to Azure Portal → Function App → Overview" -ForegroundColor White
    Write-Host "2. Click 'Get publish profile'" -ForegroundColor White
    Write-Host "3. Download the .PublishSettings file" -ForegroundColor White
    Write-Host "4. Update GitHub secret manually" -ForegroundColor White
}

# Step 5: Check for networking issues
Write-Host ""
Write-Host "5️⃣  Checking for networking restrictions..." -ForegroundColor Yellow
try {
    $networking = az functionapp config show --name $FunctionAppName --resource-group $ResourceGroupName --query "publicNetworkAccess" -o tsv
    Write-Host "Public Network Access: $networking" -ForegroundColor White

    if ($networking -eq 'Disabled') {
        Write-Host "❌ Public Network Access is DISABLED" -ForegroundColor Red
        Write-Host "   This will block deployments from GitHub Actions" -ForegroundColor Yellow
        Write-Host "   Fix: Enable public network access or configure VNet integration properly" -ForegroundColor White
    } else {
        Write-Host "✅ Public Network Access: OK" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Could not check networking configuration" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎯 Summary:" -ForegroundColor Cyan
Write-Host "==========" -ForegroundColor Cyan
Write-Host "• SCM Basic Auth: ENABLED ✅" -ForegroundColor Green
Write-Host "• Generated fresh publish profile: $publishFile" -ForegroundColor Green
Write-Host "• Update GitHub secret with new profile XML" -ForegroundColor Yellow
Write-Host "• Test deployment after updating secret" -ForegroundColor Yellow
Write-Host ""
Write-Host "📖 For more help: AZURE_DEPLOYMENT_FIX.md" -ForegroundColor Cyan
