# GitHub Token Configuration Script for BugBots
# This script helps you configure your GitHub token securely

param(
    [string]$Token,
    [string]$Owner,
    [string]$Repo
)

Write-Host "🔑 GitHub Token Configuration for BugBots" -ForegroundColor Green
Write-Host ""

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "❌ .env file not found. Please run the setup script first." -ForegroundColor Red
    exit 1
}

# Get GitHub token
if (-not $Token) {
    Write-Host "📝 Please enter your GitHub Personal Access Token:" -ForegroundColor Yellow
    Write-Host "   (Get it from: https://github.com/settings/tokens)" -ForegroundColor Gray
    Write-Host ""
    $Token = Read-Host "GitHub Token"
}

# Get repository owner
if (-not $Owner) {
    Write-Host ""
    Write-Host "📝 Please enter your GitHub username:" -ForegroundColor Yellow
    $Owner = Read-Host "GitHub Username"
}

# Get repository name
if (-not $Repo) {
    Write-Host ""
    Write-Host "📝 Please enter your repository name:" -ForegroundColor Yellow
    $Repo = Read-Host "Repository Name"
}

# Validate inputs
if (-not $Token -or $Token -eq "your_github_personal_access_token_here") {
    Write-Host "❌ Invalid GitHub token provided." -ForegroundColor Red
    exit 1
}

if (-not $Owner -or $Owner -eq "your_username") {
    Write-Host "❌ Invalid GitHub username provided." -ForegroundColor Red
    exit 1
}

if (-not $Repo -or $Repo -eq "your_repo_name") {
    Write-Host "❌ Invalid repository name provided." -ForegroundColor Red
    exit 1
}

# Update .env file
Write-Host ""
Write-Host "🔧 Updating .env file..." -ForegroundColor Blue

$envContent = Get-Content .env
$updatedContent = @()

foreach ($line in $envContent) {
    if ($line.StartsWith("GITHUB_TOKEN=")) {
        $updatedContent += "GITHUB_TOKEN=$Token"
    } elseif ($line.StartsWith("GITHUB_REPOSITORY_OWNER=")) {
        $updatedContent += "GITHUB_REPOSITORY_OWNER=$Owner"
    } elseif ($line.StartsWith("GITHUB_REPOSITORY=")) {
        $updatedContent += "GITHUB_REPOSITORY=$Repo"
    } else {
        $updatedContent += $line
    }
}

Set-Content -Path ".env" -Value $updatedContent

Write-Host "✅ GitHub token configured successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Configuration Summary:" -ForegroundColor Cyan
Write-Host "   GitHub Token: $($Token.Substring(0, 8))..." -ForegroundColor Gray
Write-Host "   Repository Owner: $Owner" -ForegroundColor Gray
Write-Host "   Repository Name: $Repo" -ForegroundColor Gray
Write-Host ""

# Test the configuration
Write-Host "🧪 Testing GitHub API connection..." -ForegroundColor Blue

try {
    $headers = @{
        "Authorization" = "token $Token"
        "Accept" = "application/vnd.github.v3+json"
    }
    
    $response = Invoke-RestMethod -Uri "https://api.github.com/user" -Headers $headers -Method Get
    
    Write-Host "✅ GitHub API connection successful!" -ForegroundColor Green
    Write-Host "   Authenticated as: $($response.login)" -ForegroundColor Gray
    Write-Host "   User ID: $($response.id)" -ForegroundColor Gray
    
    # Test repository access
    Write-Host ""
    Write-Host "🔍 Testing repository access..." -ForegroundColor Blue
    
    $repoResponse = Invoke-RestMethod -Uri "https://api.github.com/repos/$Owner/$Repo" -Headers $headers -Method Get
    
    Write-Host "✅ Repository access confirmed!" -ForegroundColor Green
    Write-Host "   Repository: $($repoResponse.full_name)" -ForegroundColor Gray
    Write-Host "   Private: $($repoResponse.private)" -ForegroundColor Gray
    Write-Host "   Default Branch: $($repoResponse.default_branch)" -ForegroundColor Gray
    
} catch {
    Write-Host "❌ GitHub API connection failed!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🔧 Troubleshooting:" -ForegroundColor Yellow
    Write-Host "   1. Check if your token has the correct permissions" -ForegroundColor Gray
    Write-Host "   2. Verify the repository name and owner" -ForegroundColor Gray
    Write-Host "   3. Make sure the token is not expired" -ForegroundColor Gray
    exit 1
}

Write-Host ""
Write-Host "🎉 GitHub token configuration complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Run: npm run bug-fix:apply" -ForegroundColor Gray
Write-Host "   2. Run: npm run bug-monitor:issues" -ForegroundColor Gray
Write-Host "   3. Push changes to GitHub to enable Actions" -ForegroundColor Gray
Write-Host ""
Write-Host "⚠️  Security reminder: Never commit your .env file to version control!" -ForegroundColor Yellow
