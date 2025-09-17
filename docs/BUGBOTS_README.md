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
Copy .env.bugbots to .env and configure:

- GITHUB_TOKEN: Your GitHub personal access token
- GITHUB_REPOSITORY_OWNER: Your GitHub username
- GITHUB_REPOSITORY: Your repository name
- SLACK_WEBHOOK_URL: Slack webhook for notifications (optional)

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
- ug: General bug reports
- utomated: Auto-generated issues
- security: Security-related issues
- priority-high: High priority issues
- priority-critical: Critical issues

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

**Scripts not found**: Make sure to run 
pm install after setup
**Permission denied**: Run chmod +x scripts/*.js
**GitHub API errors**: Check your GitHub token permissions
**Slack notifications not working**: Verify webhook URL

### Getting Help

1. Check the generated bug reports in ug-*-report.json
2. Review GitHub Actions logs
3. Check environment variables
4. Verify file permissions

## Advanced Usage

### Custom Bug Patterns
Edit scripts/auto-bug-fixer.js to add custom bug detection patterns.

### Custom Notifications
Modify scripts/bug-monitor.js to add custom notification channels.

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
