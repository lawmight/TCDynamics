# BugBots Setup Script for Windows
# This script sets up the complete BugBots infrastructure for automated bug fixing

param(
    [switch]$SkipInstall,
    [switch]$Verbose
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"

function Write-Log {
    param([string]$Message, [string]$Color = "Green")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] $Message" -ForegroundColor $Color
}

function Write-Warning {
    param([string]$Message)
    Write-Log "WARNING: $Message" -Color $Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Log "ERROR: $Message" -Color $Red
}

function Write-Info {
    param([string]$Message)
    Write-Log "INFO: $Message" -Color $Blue
}

Write-Log "🚀 Setting up BugBots for automated bug fixing..."

# Check if we're in a git repository
if (-not (Test-Path ".git")) {
    Write-Error "Not in a git repository. Please run this script from your project root."
    exit 1
}

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Info "Node.js version: $nodeVersion"
} catch {
    Write-Error "Node.js is not installed. Please install Node.js first."
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Info "npm version: $npmVersion"
} catch {
    Write-Error "npm is not installed. Please install npm first."
    exit 1
}

Write-Log "Setting up BugBots infrastructure..."

# Create necessary directories
Write-Log "Creating directory structure..."
$directories = @(".github\workflows", ".github\dependabot", "scripts", "docs")
foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Info "Created directory: $dir"
    }
}

# Install additional dependencies for bug fixing
if (-not $SkipInstall) {
    Write-Log "Installing additional dependencies..."
    npm install --save-dev @typescript-eslint/eslint-plugin @typescript-eslint/parser
    npm install --save-dev eslint-plugin-security eslint-plugin-import
    npm install --save-dev prettier eslint-config-prettier eslint-plugin-prettier
    npm install --save-dev husky lint-staged
}

# Read and update package.json
Write-Log "Adding BugBots scripts to package.json..."
$packageJsonPath = "package.json"
$packageJson = Get-Content $packageJsonPath | ConvertFrom-Json

# Add scripts if they don't exist
if (-not $packageJson.scripts) {
    $packageJson | Add-Member -MemberType NoteProperty -Name "scripts" -Value @{}
}

$bugBotScripts = @{
    "bug-fix" = "node scripts/auto-bug-fixer.js"
    "bug-fix:dry" = "node scripts/auto-bug-fixer.js --dry-run"
    "bug-fix:apply" = "node scripts/auto-bug-fixer.js --fix"
    "bug-monitor" = "node scripts/bug-monitor.js"
    "bug-monitor:issues" = "node scripts/bug-monitor.js --create-issues"
    "lint:fix" = "eslint . --fix"
    "format" = "prettier --write ."
}

foreach ($script in $bugBotScripts.GetEnumerator()) {
    if (-not $packageJson.scripts.PSObject.Properties.Name -contains $script.Key) {
        $packageJson.scripts | Add-Member -MemberType NoteProperty -Name $script.Key -Value $script.Value
        Write-Info "Added script: $($script.Key)"
    }
}

# Save updated package.json
$packageJson | ConvertTo-Json -Depth 10 | Set-Content $packageJsonPath

# Create .eslintrc.js if it doesn't exist
if (-not (Test-Path ".eslintrc.js") -and -not (Test-Path ".eslintrc.json")) {
    Write-Log "Creating ESLint configuration..."
    $eslintConfig = @"
module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'security', 'import'],
  rules: {
    'no-console': 'warn',
    'no-unused-vars': 'error',
    'prefer-const': 'error',
    'security/detect-object-injection': 'warn',
    'import/order': 'error',
  },
};
"@
    Set-Content -Path ".eslintrc.js" -Value $eslintConfig
}

# Create .prettierrc if it doesn't exist
if (-not (Test-Path ".prettierrc")) {
    Write-Log "Creating Prettier configuration..."
    $prettierConfig = @"
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
"@
    Set-Content -Path ".prettierrc" -Value $prettierConfig
}

# Create .prettierignore if it doesn't exist
if (-not (Test-Path ".prettierignore")) {
    Write-Log "Creating Prettier ignore file..."
    $prettierIgnore = @"
node_modules/
dist/
build/
.next/
coverage/
*.min.js
*.min.css
package-lock.json
yarn.lock
"@
    Set-Content -Path ".prettierignore" -Value $prettierIgnore
}

# Create environment template for BugBots
Write-Log "Creating environment template..."
$envTemplate = @"
# BugBots Configuration
# Copy this to .env and fill in your values

# GitHub Integration
GITHUB_TOKEN=your_github_personal_access_token_here
GITHUB_REPOSITORY_OWNER=your_username
GITHUB_REPOSITORY=your_repo_name

# Slack Integration (optional)
SLACK_WEBHOOK_URL=your_slack_webhook_url_here

# Email Notifications (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# BugBots Settings
BUGBOTS_AUTO_FIX=true
BUGBOTS_CREATE_ISSUES=true
BUGBOTS_NOTIFY_SLACK=true
BUGBOTS_NOTIFY_EMAIL=false
"@
Set-Content -Path ".env.bugbots" -Value $envTemplate

# Create a comprehensive README for BugBots
Write-Log "Creating BugBots documentation..."
$readmeContent = @"
# BugBots - Automated Bug Detection and Fixing

BugBots is a comprehensive system for automatically detecting, monitoring, and fixing bugs in your codebase.

## Features

- 🔍 **Automated Bug Detection**: Scans your code for common issues
- 🔧 **Auto-Fixing**: Automatically fixes simple bugs and code style issues
- 📊 **Monitoring**: Continuous monitoring with detailed reports
- 🚨 **Alerting**: GitHub issues and Slack notifications
- 🔒 **Security Scanning**: CodeQL integration for security vulnerabilities
- 📦 **Dependency Management**: Automated dependency updates with Dependabot

## Quick Start

### 1. Run Bug Detection
``````bash
# Scan for bugs (dry run)
npm run bug-fix:dry

# Apply automatic fixes
npm run bug-fix:apply
``````

### 2. Monitor Bugs
``````bash
# Run bug monitoring
npm run bug-monitor

# Create GitHub issues for found bugs
npm run bug-monitor:issues
``````

### 3. Manual Fixes
``````bash
# Fix linting issues
npm run lint:fix

# Format code
npm run format
``````

## Configuration

### Environment Variables
Copy `.env.bugbots` to `.env` and configure:

- `GITHUB_TOKEN`: Your GitHub personal access token
- `GITHUB_REPOSITORY_OWNER`: Your GitHub username
- `GITHUB_REPOSITORY`: Your repository name
- `SLACK_WEBHOOK_URL`: Slack webhook for notifications (optional)

### GitHub Actions
The following workflows are automatically set up:

- **Auto Bug Fix**: Runs daily and on push/PR
- **CodeQL Security**: Security vulnerability scanning
- **Dependabot**: Automated dependency updates

## Bug Types Detected

### Code Quality Issues
- Unused imports and variables
- Missing semicolons
- Console.log statements
- TODO comments without tracking
- Hardcoded URLs and values

### TypeScript Issues
- Type errors
- Missing type annotations
- Unused interfaces

### Security Issues
- Vulnerable dependencies
- Hardcoded secrets
- Insecure patterns

### Test Issues
- Failing tests
- Missing test coverage
- Test configuration problems

## Automated Fixes

BugBots can automatically fix:

- ✅ ESLint violations (formatting, style)
- ✅ Missing semicolons
- ✅ Unused imports (with caution)
- ✅ Code formatting with Prettier
- ✅ Simple TypeScript errors

## Manual Review Required

Some issues require manual attention:

- ❌ Complex logic errors
- ❌ Security vulnerabilities
- ❌ Test failures
- ❌ Build errors
- ❌ Performance issues

## GitHub Integration

### Automatic Issue Creation
BugBots automatically creates GitHub issues for:
- Critical bugs
- Security vulnerabilities
- Build failures
- Test failures

### Labels Applied
- `bug`: General bug reports
- `automated`: Auto-generated issues
- `security`: Security-related issues
- `priority-high`: High priority issues
- `priority-critical`: Critical issues

## Slack Integration

Configure Slack webhook to receive:
- Daily bug reports
- Critical issue alerts
- Security vulnerability notifications
- Build failure alerts

## Best Practices

1. **Regular Monitoring**: Run bug monitoring daily
2. **Review Auto-Fixes**: Always review automatically applied fixes
3. **Security First**: Address security issues immediately
4. **Test Coverage**: Maintain high test coverage
5. **Documentation**: Document complex bugs and their fixes

## Troubleshooting

### Common Issues

**Scripts not found**: Make sure to run `npm install` after setup
**Permission denied**: Run `chmod +x scripts/*.js`
**GitHub API errors**: Check your GitHub token permissions
**Slack notifications not working**: Verify webhook URL

### Getting Help

1. Check the generated bug reports in `bug-*-report.json`
2. Review GitHub Actions logs
3. Check environment variables
4. Verify file permissions

## Advanced Usage

### Custom Bug Patterns
Edit `scripts/auto-bug-fixer.js` to add custom bug detection patterns.

### Custom Notifications
Modify `scripts/bug-monitor.js` to add custom notification channels.

### Integration with CI/CD
The GitHub Actions workflows integrate with your existing CI/CD pipeline.

## Contributing

To improve BugBots:
1. Add new bug detection patterns
2. Improve auto-fix capabilities
3. Add new notification channels
4. Enhance reporting features

---

*BugBots - Making bug fixing effortless* 🐛🤖
"@
Set-Content -Path "docs\BUGBOTS_README.md" -Value $readmeContent

# Create a simple test to verify setup
Write-Log "Creating verification script..."
$verifyScript = @"
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying BugBots setup...');

const checks = [
  {
    name: 'GitHub Actions workflow',
    path: '.github/workflows/auto-bug-fix.yml',
    required: true
  },
  {
    name: 'CodeQL workflow',
    path: '.github/workflows/codeql.yml',
    required: true
  },
  {
    name: 'Dependabot configuration',
    path: '.github/dependabot.yml',
    required: true
  },
  {
    name: 'Auto bug fixer script',
    path: 'scripts/auto-bug-fixer.js',
    required: true
  },
  {
    name: 'Bug monitor script',
    path: 'scripts/bug-monitor.js',
    required: true
  },
  {
    name: 'ESLint configuration',
    path: '.eslintrc.js',
    required: false
  },
  {
    name: 'Prettier configuration',
    path: '.prettierrc',
    required: false
  }
];

let allGood = true;

checks.forEach(check => {
  if (fs.existsSync(check.path)) {
    console.log(`✅ ` + check.name + `: Found`);
  } else {
    if (check.required) {
      console.log(`❌ ` + check.name + `: Missing (required)`);
      allGood = false;
    } else {
      console.log(`⚠️  ` + check.name + `: Missing (optional)`);
    }
  }
});

// Check package.json scripts
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredScripts = ['bug-fix', 'bug-monitor'];

requiredScripts.forEach(script => {
  if (packageJson.scripts && packageJson.scripts[script]) {
    console.log(`✅ Package script '` + script + `': Found`);
  } else {
    console.log(`❌ Package script '` + script + `': Missing`);
    allGood = false;
  }
});

if (allGood) {
  console.log('\n🎉 BugBots setup verification passed!');
  console.log('\nNext steps:');
  console.log('1. Copy .env.bugbots to .env and configure your tokens');
  console.log('2. Run: npm run bug-fix:dry');
  console.log('3. Run: npm run bug-monitor');
} else {
  console.log('\n❌ BugBots setup verification failed!');
  console.log('Please check the missing components above.');
  process.exit(1);
}
"@
Set-Content -Path "scripts\verify-bugbots.js" -Value $verifyScript

# Run verification
Write-Log "Running setup verification..."
node scripts/verify-bugbots.js

# Final setup instructions
Write-Log "BugBots setup completed successfully!"
Write-Host ""
Write-Info "Next steps:"
Write-Host "1. Copy .env.bugbots to .env and configure your GitHub token:"
Write-Host "   Copy-Item .env.bugbots .env"
Write-Host "   # Edit .env with your actual values"
Write-Host ""
Write-Host "2. Test the setup:"
Write-Host "   npm run bug-fix:dry"
Write-Host "   npm run bug-monitor"
Write-Host ""
Write-Host "3. Enable GitHub Actions:"
Write-Host "   - Push your changes to GitHub"
Write-Host "   - Go to Actions tab in your repository"
Write-Host "   - Enable the workflows"
Write-Host ""
Write-Host "4. Set up Slack notifications (optional):"
Write-Host "   - Create a Slack webhook"
Write-Host "   - Add SLACK_WEBHOOK_URL to your .env file"
Write-Host ""
Write-Warning "Important: Make sure to add .env to your .gitignore file!"
Write-Host ""
Write-Log "BugBots is now ready to help you fix bugs automatically! 🐛🤖"
