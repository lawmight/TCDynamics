# Utility Scripts Documentation

**Last Updated**: 2026-01-09
**Status**: Active

This document provides comprehensive documentation for all utility scripts in the `scripts/` directory.

## Overview

The scripts directory contains utility scripts for deployment, monitoring, development, and CI/CD operations. These scripts automate common tasks and ensure consistent workflows across the development team.

## Script Categories

### 1. Deployment Scripts

#### `deploy-vercel.ps1`
**Purpose**: Deploy to Vercel production with proper environment setup
**Usage**: `./scripts/deploy-vercel.ps1`
**Key Features**:
- Ensures `apps/frontend/api` is removed before deployment (prevents duplicate functions)
- Deploys from project root using root `vercel.json`
- Mirrors GitHub Actions workflow process
- Provides clear success/failure feedback

#### `deploy-vercel-frontend-only.ps1`
**Purpose**: Deploy only frontend build without serverless API functions
**Usage**: `./scripts/deploy-vercel-frontend-only.ps1`
**Key Features**:
- Avoids Vercel Hobby plan's 12 function limit
- Builds frontend locally and deploys as static site
- Removes API directory to prevent function creation
- Useful when APIs are hosted elsewhere

#### `deploy-vercel-preview.ps1`
**Purpose**: Create preview deployments for testing
**Usage**: `./scripts/deploy-vercel-preview.ps1`
**Features**:
- Creates preview deployment with unique URL
- Useful for testing changes before production deployment

### 2. Monitoring Scripts

#### `monitor-deployments.ps1`
**Purpose**: Monitor GitHub Actions and Vercel deployments
**Usage**: `./scripts/monitor-deployments.ps1`
**Key Features**:
- Polls GitHub Actions for workflow status on `main` branch
- Monitors Vercel deployment progress
- Provides real-time status updates
- Saves GitHub Actions logs to file
- Offers helpful links to dashboards

#### `github-actions.ps1`
**Purpose**: GitHub Actions workflow management
**Usage**: `./scripts/github-actions.ps1`
**Features**:
- List recent workflow runs
- Trigger manual workflow dispatch
- Check workflow status and logs

### 3. Development Scripts

#### `mongosh.sh`
**Purpose**: MongoDB shell access with project configuration
**Usage**: `./scripts/mongosh.sh`
**Features**:
- Connects to MongoDB Atlas with project credentials
- Provides shell access for database operations
- Useful for data inspection and manual operations

#### `verify-cli-connections.sh`
**Purpose**: Verify CLI tool installations and connections
**Usage**: `./scripts/verify-cli-connections.sh`
**Key Features**:
- Checks for required CLI tools (git, node, npm, vercel, gh, etc.)
- Validates authentication for external services
- Provides installation guidance for missing tools
- Reports connection status for all services

### 4. Git and Workflow Scripts

#### `commit-push-and-check-actions.ps1`
**Purpose**: Complete git workflow with post-commit validation
**Usage**: `./scripts/commit-push-and-check-actions.ps1`
**Workflow**:
1. Adds all changes to staging area
2. Commits with user-provided message
3. Pushes to remote repository
4. Monitors GitHub Actions and Vercel deployments
5. Provides deployment status summary

#### `commit-push-and-run-bump-workflow.ps1`
**Purpose**: Git workflow with automatic dependency bumping
**Usage**: `./scripts/commit-push-and-run-bump-workflow.ps1`
**Features**:
- Complete git workflow (add, commit, push)
- Triggers dependency bump workflow
- Monitors workflow execution
- Provides success/failure feedback

#### `push-tsconfig-and-test-bump.ps1`
**Purpose**: Push TypeScript configuration changes and test bump workflow
**Usage**: `./scripts/push-tsconfig-and-test-bump.ps1`
**Workflow**:
- Commits TypeScript configuration changes
- Triggers dependency bump workflow
- Monitors workflow execution
- Useful for testing configuration changes

#### `ship.ps1`
**Purpose**: Production release workflow
**Usage**: `./scripts/ship.ps1`
**Features**:
- Complete release process
- Version bumping
- Tag creation
- Release notes generation

### 5. API and Database Scripts

#### `api/scripts/migrate-email-unique.js`
**Purpose**: MongoDB migration to add unique email constraint
**Usage**: `node api/scripts/migrate-email-unique.js`
**Features**:
- Checks for duplicate emails before migration
- Creates unique index on email field
- Handles migration safely with rollback capability

#### `api/scripts/rollback-email-unique.js`
**Purpose**: Rollback email unique constraint migration
**Usage**: `node api/scripts/rollback-email-unique.js`
**Features**:
- Removes unique email constraint
- Useful if migration causes issues
- Provides rollback confirmation

#### `api/scripts/find-duplicate-emails.js`
**Purpose**: Find duplicate email addresses in database
**Usage**: `node api/scripts/find-duplicate-emails.js`
**Features**:
- Identifies duplicate email entries
- Provides count and list of duplicates
- Useful before applying unique constraints

## Script Dependencies

### Required CLI Tools
All scripts assume these tools are installed and configured:

- **git** - Version control
- **node** - JavaScript runtime
- **npm** - Package manager
- **vercel** - Vercel CLI (authenticated)
- **gh** - GitHub CLI (authenticated)

### Optional CLI Tools (Recommended)
Some scripts provide enhanced functionality with these tools:

- **jq** - JSON processing
- **http** (HTTPie) - API testing
- **bat** - Syntax-highlighted cat
- **fd** - Fast file search
- **rg** (ripgrep) - Fast grep

### Installation Commands
```bash
# Install required tools
npm install -g vercel @github/cli

# Install optional tools (Windows)
choco install jq httpie bat fd ripgrep

# Install optional tools (macOS)
brew install jq httpie bat fd ripgrep
```

## Environment Variables

### Required for Deployment Scripts
```bash
# Vercel deployment
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id
```

### Required for Git Scripts
```bash
# GitHub CLI authentication
GITHUB_TOKEN=your_github_token
```

### Required for Database Scripts
```bash
# MongoDB connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
```

## Usage Examples

### Basic Deployment
```bash
# Deploy to production
./scripts/deploy-vercel.ps1

# Deploy frontend only (avoid function limits)
./scripts/deploy-vercel-frontend-only.ps1
```

### Monitoring Deployments
```bash
# Monitor current deployments
./scripts/monitor-deployments.ps1

# Check GitHub Actions status
./scripts/github-actions.ps1 status
```

### Development Workflow
```bash
# Complete git workflow with monitoring
./scripts/commit-push-and-check-actions.ps1 "Your commit message"

# Push TypeScript changes and test bump
./scripts/push-tsconfig-and-test-bump.ps1
```

### Database Operations
```bash
# Check for duplicate emails
node api/scripts/find-duplicate-emails.js

# Apply email unique constraint
node api/scripts/migrate-email-unique.js

# Rollback if needed
node api/scripts/rollback-email-unique.js
```

### MongoDB Access
```bash
# Open MongoDB shell
./scripts/mongosh.sh
```

## Error Handling

All scripts include comprehensive error handling:

1. **Pre-flight Checks**: Verify required tools and environment
2. **Graceful Failures**: Clear error messages with troubleshooting steps
3. **Rollback Support**: Safe operations with rollback capabilities
4. **Logging**: Detailed output for debugging

## Security Considerations

1. **Environment Variables**: Never commit secrets to repository
2. **Token Management**: Use secure storage for API tokens
3. **Access Control**: Limit script execution permissions
4. **Audit Trail**: All operations are logged for review

## Troubleshooting

### Common Issues

#### Vercel Authentication
```bash
# Authenticate with Vercel
vercel login
vercel whoami
```

#### GitHub CLI Authentication
```bash
# Authenticate with GitHub
gh auth login
gh auth status
```

#### Missing CLI Tools
```bash
# Run verification script
./scripts/verify-cli-connections.sh
```

#### Permission Denied (Windows)
```bash
# Set execution policy (PowerShell)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Or run with bypass
powershell -ExecutionPolicy Bypass -File .\scripts\deploy-vercel.ps1
```

### Getting Help

1. **Script Help**: Most scripts accept `-h` or `--help` flags
2. **Verbose Output**: Use `-v` or `--verbose` for detailed logging
3. **Documentation**: Check individual script comments for usage details
4. **Issues**: Report problems through project issue tracker

## Best Practices

1. **Test Scripts**: Always test scripts in development before production
2. **Backup Data**: Create database backups before running migration scripts
3. **Monitor Deployments**: Use monitoring scripts to track deployment status
4. **Version Control**: Commit script changes with descriptive messages
5. **Documentation**: Update this documentation when adding new scripts

## Related Documentation

- [Environment Setup](./development/environment-setup.md) - Environment configuration
- [CI/CD Guide](./deployment/ci-cd.md) - Automated deployment workflows
- [Git Workflow](./development/git-workflow.md) - Git best practices

---

**Last Updated**: 2026-01-09
**Next Review**: Q1 2026