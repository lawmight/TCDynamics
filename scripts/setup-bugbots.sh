#!/bin/bash

# BugBots Setup Script
# This script sets up the complete BugBots infrastructure for automated bug fixing

set -e

echo "🚀 Setting up BugBots for automated bug fixing..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    error "Not in a git repository. Please run this script from your project root."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    error "npm is not installed. Please install npm first."
    exit 1
fi

log "Setting up BugBots infrastructure..."

# Create necessary directories
log "Creating directory structure..."
mkdir -p .github/workflows
mkdir -p .github/dependabot
mkdir -p scripts
mkdir -p docs

# Make scripts executable
chmod +x scripts/auto-bug-fixer.js
chmod +x scripts/bug-monitor.js

# Install additional dependencies for bug fixing
log "Installing additional dependencies..."
npm install --save-dev @typescript-eslint/eslint-plugin @typescript-eslint/parser
npm install --save-dev eslint-plugin-security eslint-plugin-import
npm install --save-dev prettier eslint-config-prettier eslint-plugin-prettier
npm install --save-dev husky lint-staged

# Create package.json scripts if they don't exist
log "Adding BugBots scripts to package.json..."

# Check if scripts section exists in package.json
if ! grep -q '"scripts"' package.json; then
    # Add scripts section
    sed -i.bak 's/"main":/,\n  "scripts": {\n    "bug-fix": "node scripts\/auto-bug-fixer.js",\n    "bug-fix:dry": "node scripts\/auto-bug-fixer.js --dry-run",\n    "bug-fix:apply": "node scripts\/auto-bug-fixer.js --fix",\n    "bug-monitor": "node scripts\/bug-monitor.js",\n    "bug-monitor:issues": "node scripts\/bug-monitor.js --create-issues",\n    "lint:fix": "eslint . --fix",\n    "format": "prettier --write ."\n  },\n  "main":/' package.json
else
    # Add individual scripts if they don't exist
    if ! grep -q '"bug-fix"' package.json; then
        sed -i.bak 's/"scripts": {/"scripts": {\n    "bug-fix": "node scripts\/auto-bug-fixer.js",\n    "bug-fix:dry": "node scripts\/auto-bug-fixer.js --dry-run",\n    "bug-fix:apply": "node scripts\/auto-bug-fixer.js --fix",\n    "bug-monitor": "node scripts\/bug-monitor.js",\n    "bug-monitor:issues": "node scripts\/bug-monitor.js --create-issues",/' package.json
    fi
fi

# Create .eslintrc.js if it doesn't exist
if [ ! -f ".eslintrc.js" ] && [ ! -f ".eslintrc.json" ]; then
    log "Creating ESLint configuration..."
    cat > .eslintrc.js << 'EOF'
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
EOF
fi

# Create .prettierrc if it doesn't exist
if [ ! -f ".prettierrc" ]; then
    log "Creating Prettier configuration..."
    cat > .prettierrc << 'EOF'
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
EOF
fi

# Create .prettierignore if it doesn't exist
if [ ! -f ".prettierignore" ]; then
    log "Creating Prettier ignore file..."
    cat > .prettierignore << 'EOF'
node_modules/
dist/
build/
.next/
coverage/
*.min.js
*.min.css
package-lock.json
yarn.lock
EOF
fi

# Set up Husky for pre-commit hooks
log "Setting up Git hooks..."
npx husky install
npx husky add .husky/pre-commit "npm run lint:fix && npm run format"

# Create environment template for BugBots
log "Creating environment template..."
cat > .env.bugbots << 'EOF'
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
EOF

# Create a comprehensive README for BugBots
log "Creating BugBots documentation..."
cat > docs/BUGBOTS_README.md << 'EOF'
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
```bash
# Scan for bugs (dry run)
npm run bug-fix:dry

# Apply automatic fixes
npm run bug-fix:apply
```

### 2. Monitor Bugs
```bash
# Run bug monitoring
npm run bug-monitor

# Create GitHub issues for found bugs
npm run bug-monitor:issues
```

### 3. Manual Fixes
```bash
# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

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
EOF

# Create a simple test to verify setup
log "Creating verification script..."
cat > scripts/verify-bugbots.js << 'EOF'
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
    console.log(`✅ ${check.name}: Found`);
  } else {
    if (check.required) {
      console.log(`❌ ${check.name}: Missing (required)`);
      allGood = false;
    } else {
      console.log(`⚠️  ${check.name}: Missing (optional)`);
    }
  }
});

// Check package.json scripts
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredScripts = ['bug-fix', 'bug-monitor'];

requiredScripts.forEach(script => {
  if (packageJson.scripts && packageJson.scripts[script]) {
    console.log(`✅ Package script '${script}': Found`);
  } else {
    console.log(`❌ Package script '${script}': Missing`);
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
EOF

chmod +x scripts/verify-bugbots.js

# Run verification
log "Running setup verification..."
node scripts/verify-bugbots.js

# Final setup instructions
log "BugBots setup completed successfully!"
echo ""
info "Next steps:"
echo "1. Copy .env.bugbots to .env and configure your GitHub token:"
echo "   cp .env.bugbots .env"
echo "   # Edit .env with your actual values"
echo ""
echo "2. Test the setup:"
echo "   npm run bug-fix:dry"
echo "   npm run bug-monitor"
echo ""
echo "3. Enable GitHub Actions:"
echo "   - Push your changes to GitHub"
echo "   - Go to Actions tab in your repository"
echo "   - Enable the workflows"
echo ""
echo "4. Set up Slack notifications (optional):"
echo "   - Create a Slack webhook"
echo "   - Add SLACK_WEBHOOK_URL to your .env file"
echo ""
warn "Important: Make sure to add .env to your .gitignore file!"
echo ""
log "BugBots is now ready to help you fix bugs automatically! 🐛🤖"
