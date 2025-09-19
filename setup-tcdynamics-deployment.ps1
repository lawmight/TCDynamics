# TCDynamics - Complete Deployment Setup Script
# This script sets up the complete TCDynamics hybrid deployment

param(
    [switch]$SkipWorkflowCleanup,
    [switch]$SkipEnvSetup,
    [switch]$Help
)

if ($Help) {
    Write-Host "TCDynamics Deployment Setup Script" -ForegroundColor Cyan
    Write-Host "===================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage: .\setup-tcdynamics-deployment.ps1 [options]" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Yellow
    Write-Host "  -SkipWorkflowCleanup    Skip disabling redundant workflows" -ForegroundColor White
    Write-Host "  -SkipEnvSetup          Skip environment file setup" -ForegroundColor White
    Write-Host "  -Help                  Show this help message" -ForegroundColor White
    Write-Host ""
    Write-Host "This script will:" -ForegroundColor Yellow
    Write-Host "1. Disable redundant GitHub Actions workflows" -ForegroundColor White
    Write-Host "2. Set up environment variable templates" -ForegroundColor White
    Write-Host "3. Verify the TCDynamics Azure Functions structure" -ForegroundColor White
    Write-Host "4. Provide deployment instructions" -ForegroundColor White
    exit 0
}

Write-Host "🚀 TCDynamics - Complete Deployment Setup" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Disable Redundant Workflows
if (-not $SkipWorkflowCleanup) {
    Write-Host "📋 Step 1: Disabling Redundant Workflows" -ForegroundColor Yellow
    Write-Host "=========================================" -ForegroundColor Yellow
    
    if (Test-Path ".github/workflows") {
        & .\disable-redundant-workflows.ps1
    } else {
        Write-Host "⚠️  .github/workflows directory not found. Skipping workflow cleanup." -ForegroundColor Yellow
    }
    Write-Host ""
}

# Step 2: Environment Setup
if (-not $SkipEnvSetup) {
    Write-Host "🔧 Step 2: Environment Variables Setup" -ForegroundColor Yellow
    Write-Host "======================================" -ForegroundColor Yellow
    
    # Check if .env exists
    if (Test-Path ".env") {
        Write-Host "⚠️  .env file already exists. Backing up to .env.backup" -ForegroundColor Yellow
        Copy-Item ".env" ".env.backup"
    }
    
    # Create .env from template
    if (Test-Path "env.example") {
        Copy-Item "env.example" ".env"
        Write-Host "✅ Created .env file from template" -ForegroundColor Green
        Write-Host "📝 Please edit .env with your actual values" -ForegroundColor Cyan
    } else {
        Write-Host "❌ env.example not found!" -ForegroundColor Red
    }
    Write-Host ""
}

# Step 3: Verify TCDynamics Structure
Write-Host "📁 Step 3: Verifying TCDynamics Structure" -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Yellow

$requiredFiles = @(
    "TCDynamics/requirements.txt",
    "TCDynamics/host.json",
    "TCDynamics/function_app.py",
    "TCDynamics/ContactForm/__init__.py",
    "TCDynamics/DemoForm/__init__.py"
)

$allFilesExist = $true
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if ($allFilesExist) {
    Write-Host "✅ TCDynamics Azure Functions structure is complete!" -ForegroundColor Green
} else {
    Write-Host "❌ Some TCDynamics files are missing!" -ForegroundColor Red
}
Write-Host ""

# Step 4: Check Frontend Updates
Write-Host "⚛️  Step 4: Verifying Frontend Updates" -ForegroundColor Yellow
Write-Host "=====================================" -ForegroundColor Yellow

$frontendFiles = @(
    "src/hooks/useContactForm.ts",
    "src/hooks/useDemoForm.ts"
)

foreach ($file in $frontendFiles) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        if ($content -match "func-tcdynamics-contact") {
            Write-Host "✅ $file - Updated to use Azure Functions" -ForegroundColor Green
        } else {
            Write-Host "⚠️  $file - May still use localhost API" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ $file not found!" -ForegroundColor Red
    }
}
Write-Host ""

# Step 5: Deployment Instructions
Write-Host "📋 Step 5: Deployment Instructions" -ForegroundColor Yellow
Write-Host "=================================" -ForegroundColor Yellow

Write-Host "🎯 Your TCDynamics hybrid architecture is ready!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Architecture Summary:" -ForegroundColor Cyan
Write-Host "  • Frontend: React app → OVHcloud (https://tcdynamics.fr)" -ForegroundColor White
Write-Host "  • Backend: Azure Functions → func-tcdynamics-contact" -ForegroundColor White
Write-Host "  • Email: Zoho Mail integration" -ForegroundColor White
Write-Host "  • Workflow: Single hybrid deployment pipeline" -ForegroundColor White
Write-Host ""

Write-Host "🔧 Required Setup Steps:" -ForegroundColor Yellow
Write-Host "1. Configure GitHub Secrets:" -ForegroundColor White
Write-Host "   • AZURE_CREDENTIALS" -ForegroundColor Gray
Write-Host "   • AZURE_FUNCTIONAPP_PUBLISH_PROFILE" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Set up Azure Functions environment variables:" -ForegroundColor White
Write-Host "   • ZOHO_EMAIL=contact@tcdynamics.fr" -ForegroundColor Gray
Write-Host "   • ZOHO_PASSWORD=your-zoho-app-password" -ForegroundColor Gray
Write-Host "   • FUNCTIONS_WORKER_RUNTIME=python" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Update frontend .env file:" -ForegroundColor White
Write-Host "   • VITE_AZURE_FUNCTIONS_URL=https://func-tcdynamics-contact-bjgwe4aaaza9dpbk.francecentral-01.azurewebsites.net/api" -ForegroundColor Gray
Write-Host ""

Write-Host "🚀 Deployment Process:" -ForegroundColor Yellow
Write-Host "1. Push changes to main branch" -ForegroundColor White
Write-Host "2. GitHub Actions will automatically:" -ForegroundColor White
Write-Host "   • Test frontend and Azure Functions" -ForegroundColor Gray
Write-Host "   • Deploy Azure Functions to func-tcdynamics-contact" -ForegroundColor Gray
Write-Host "   • Create OVHcloud deployment package" -ForegroundColor Gray
Write-Host "   • Verify deployment health" -ForegroundColor Gray
Write-Host ""

Write-Host "📚 For detailed instructions, see DEPLOYMENT.md" -ForegroundColor Cyan
Write-Host ""

# Step 6: Health Check URLs
Write-Host "🏥 Health Check URLs (after deployment):" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "• Frontend: https://tcdynamics.fr" -ForegroundColor White
Write-Host "• Azure Functions Health: https://func-tcdynamics-contact-bjgwe4aaaza9dpbk.francecentral-01.azurewebsites.net/api/health" -ForegroundColor White
Write-Host "• Contact Form: https://func-tcdynamics-contact-bjgwe4aaaza9dpbk.francecentral-01.azurewebsites.net/api/ContactForm" -ForegroundColor White
Write-Host "• Demo Form: https://func-tcdynamics-contact-bjgwe4aaaza9dpbk.francecentral-01.azurewebsites.net/api/DemoForm" -ForegroundColor White
Write-Host ""

Write-Host "🎉 TCDynamics deployment setup complete!" -ForegroundColor Green
Write-Host "Ready for hybrid deployment! 🚀" -ForegroundColor Green

