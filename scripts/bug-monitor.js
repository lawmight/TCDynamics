#!/usr/bin/env node

/**
 * Bug Monitor Script
 * 
 * Monitors the codebase for bugs and creates GitHub issues automatically
 * Usage: node scripts/bug-monitor.js [--create-issues] [--slack-webhook URL]
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Load environment variables from .env file
function loadEnvFile() {
  try {
    const envContent = fs.readFileSync('.env', 'utf8');
    const lines = envContent.split('\n');
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=');
          process.env[key] = value;
        }
      }
    });
  } catch (error) {
    console.log('⚠️ Could not load .env file:', error.message);
  }
}

// Load environment variables
loadEnvFile();

class BugMonitor {
  constructor(options = {}) {
    this.createIssues = options.createIssues || false;
    this.slackWebhook = options.slackWebhook;
    this.githubToken = process.env.GITHUB_TOKEN;
    this.repoOwner = process.env.GITHUB_REPOSITORY_OWNER || 'Tomco';
    this.repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'your-repo';
    this.bugs = [];
    this.criticalBugs = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      critical: '🚨'
    }[type] || 'ℹ️';
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async runTests() {
    this.log('Running test suite...', 'info');
    
    try {
      const testOutput = execSync('npm test 2>&1', { encoding: 'utf8' });
      this.log('Tests completed successfully', 'success');
      return { success: true, output: testOutput };
    } catch (error) {
      this.log('Tests failed', 'error');
      return { success: false, output: error.stdout || error.message };
    }
  }

  async runLinting() {
    this.log('Running linter...', 'info');
    
    try {
      const lintOutput = execSync('npm run lint 2>&1', { encoding: 'utf8' });
      this.log('Linting completed successfully', 'success');
      return { success: true, output: lintOutput };
    } catch (error) {
      this.log('Linting failed', 'warning');
      return { success: false, output: error.stdout || error.message };
    }
  }

  async checkTypeScript() {
    this.log('Checking TypeScript types...', 'info');
    
    try {
      const tsOutput = execSync('npx tsc --noEmit 2>&1', { encoding: 'utf8' });
      this.log('TypeScript check passed', 'success');
      return { success: true, output: tsOutput };
    } catch (error) {
      this.log('TypeScript errors found', 'error');
      return { success: false, output: error.stdout || error.message };
    }
  }

  async checkSecurity() {
    this.log('Running security audit...', 'info');
    
    try {
      const auditOutput = execSync('npm audit --audit-level=moderate 2>&1', { encoding: 'utf8' });
      this.log('Security audit completed', 'success');
      return { success: true, output: auditOutput };
    } catch (error) {
      this.log('Security vulnerabilities found', 'critical');
      return { success: false, output: error.stdout || error.message };
    }
  }

  async checkBuild() {
    this.log('Testing build process...', 'info');
    
    try {
      const buildOutput = execSync('npm run build 2>&1', { encoding: 'utf8' });
      this.log('Build successful', 'success');
      return { success: true, output: buildOutput };
    } catch (error) {
      this.log('Build failed', 'critical');
      return { success: false, output: error.stdout || error.message };
    }
  }

  parseTestFailures(testOutput) {
    const failures = [];
    const lines = testOutput.split('\n');
    
    lines.forEach((line, index) => {
      if (line.includes('FAIL') || line.includes('Error:')) {
        failures.push({
          type: 'test-failure',
          message: line.trim(),
          line: index + 1,
          severity: 'high'
        });
      }
    });
    
    return failures;
  }

  parseLintErrors(lintOutput) {
    const errors = [];
    const lines = lintOutput.split('\n');
    
    lines.forEach(line => {
      if (line.includes('error') || line.includes('warning')) {
        const match = line.match(/(.+):(\d+):(\d+):\s*(.+)/);
        if (match) {
          errors.push({
            type: 'lint-error',
            file: match[1],
            line: parseInt(match[2]),
            column: parseInt(match[3]),
            message: match[4],
            severity: line.includes('error') ? 'high' : 'medium'
          });
        }
      }
    });
    
    return errors;
  }

  parseTypeScriptErrors(tsOutput) {
    const errors = [];
    const lines = tsOutput.split('\n');
    
    lines.forEach(line => {
      if (line.includes('error TS')) {
        const match = line.match(/(.+):(\d+):(\d+):\s*error\s+TS(\d+):\s*(.+)/);
        if (match) {
          errors.push({
            type: 'typescript-error',
            file: match[1],
            line: parseInt(match[2]),
            column: parseInt(match[3]),
            code: `TS${match[4]}`,
            message: match[5],
            severity: 'high'
          });
        }
      }
    });
    
    return errors;
  }

  parseSecurityIssues(auditOutput) {
    const issues = [];
    const lines = auditOutput.split('\n');
    
    lines.forEach(line => {
      if (line.includes('vulnerabilities found') || line.includes('high') || line.includes('critical')) {
        issues.push({
          type: 'security-vulnerability',
          message: line.trim(),
          severity: line.includes('critical') ? 'critical' : 'high'
        });
      }
    });
    
    return issues;
  }

  async createGitHubIssue(bug) {
    if (!this.githubToken) {
      this.log('GitHub token not found. Set GITHUB_TOKEN environment variable.', 'warning');
      return null;
    }

    const title = `🐛 ${bug.type}: ${bug.message.substring(0, 100)}`;
    const body = `
## Bug Report

**Type**: ${bug.type}
**Severity**: ${bug.severity}
**File**: ${bug.file || 'N/A'}
**Line**: ${bug.line || 'N/A'}

### Description
${bug.message}

### Details
- **Detected**: ${new Date().toISOString()}
- **Source**: Automated Bug Monitor
- **Environment**: ${process.env.NODE_ENV || 'development'}

### Steps to Reproduce
1. Run the automated checks
2. Review the error output
3. Fix the identified issue

### Expected Behavior
The code should pass all automated checks without errors.

### Additional Context
This issue was automatically detected by the Bug Monitor system.

---
*Auto-generated by Bug Monitor*
    `;

    try {
      const response = await fetch(`https://api.github.com/repos/${this.repoOwner}/${this.repoName}/issues`, {
        method: 'POST',
        headers: {
          'Authorization': `token ${this.githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          body,
          labels: ['bug', 'automated', `severity-${bug.severity}`]
        })
      });

      if (response.ok) {
        const issue = await response.json();
        this.log(`Created GitHub issue #${issue.number}`, 'success');
        return issue;
      } else {
        this.log(`Failed to create GitHub issue: ${response.statusText}`, 'error');
        return null;
      }
    } catch (error) {
      this.log(`Error creating GitHub issue: ${error.message}`, 'error');
      return null;
    }
  }

  async sendSlackNotification(bugs) {
    if (!this.slackWebhook) {
      return;
    }

    const criticalCount = bugs.filter(bug => bug.severity === 'critical').length;
    const highCount = bugs.filter(bug => bug.severity === 'high').length;
    const mediumCount = bugs.filter(bug => bug.severity === 'medium').length;

    const message = {
      text: `🚨 Bug Monitor Alert`,
      attachments: [{
        color: criticalCount > 0 ? 'danger' : highCount > 0 ? 'warning' : 'good',
        fields: [
          {
            title: 'Critical Issues',
            value: criticalCount.toString(),
            short: true
          },
          {
            title: 'High Priority',
            value: highCount.toString(),
            short: true
          },
          {
            title: 'Medium Priority',
            value: mediumCount.toString(),
            short: true
          }
        ],
        footer: 'Bug Monitor',
        ts: Math.floor(Date.now() / 1000)
      }]
    };

    try {
      await fetch(this.slackWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
      });
      this.log('Slack notification sent', 'success');
    } catch (error) {
      this.log(`Failed to send Slack notification: ${error.message}`, 'error');
    }
  }

  async run() {
    this.log('Starting bug monitoring...', 'info');
    
    const results = await Promise.all([
      this.runTests(),
      this.runLinting(),
      this.checkTypeScript(),
      this.checkSecurity(),
      this.checkBuild()
    ]);

    // Parse results and collect bugs
    const [tests, linting, typescript, security, build] = results;

    if (!tests.success) {
      this.bugs.push(...this.parseTestFailures(tests.output));
    }

    if (!linting.success) {
      this.bugs.push(...this.parseLintErrors(linting.output));
    }

    if (!typescript.success) {
      this.bugs.push(...this.parseTypeScriptErrors(typescript.output));
    }

    if (!security.success) {
      this.bugs.push(...this.parseSecurityIssues(security.output));
    }

    if (!build.success) {
      this.bugs.push({
        type: 'build-failure',
        message: 'Build process failed',
        severity: 'critical'
      });
    }

    // Separate critical bugs
    this.criticalBugs = this.bugs.filter(bug => bug.severity === 'critical');

    // Generate report
    const report = {
      timestamp: new Date().toISOString(),
      totalBugs: this.bugs.length,
      criticalBugs: this.criticalBugs.length,
      bugsByType: {},
      bugsBySeverity: {},
      bugs: this.bugs
    };

    this.bugs.forEach(bug => {
      report.bugsByType[bug.type] = (report.bugsByType[bug.type] || 0) + 1;
      report.bugsBySeverity[bug.severity] = (report.bugsBySeverity[bug.severity] || 0) + 1;
    });

    // Save report
    const reportPath = 'bug-monitor-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    this.log(`Bug report saved to ${reportPath}`, 'info');

    // Create GitHub issues if requested
    if (this.createIssues && this.bugs.length > 0) {
      this.log(`Creating GitHub issues for ${this.bugs.length} bugs...`, 'info');
      
      for (const bug of this.bugs) {
        await this.createGitHubIssue(bug);
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Send notifications
    if (this.bugs.length > 0) {
      await this.sendSlackNotification(this.bugs);
    }

    // Summary
    this.log(`Bug monitoring completed:`, 'info');
    this.log(`  - Total bugs found: ${this.bugs.length}`, 'info');
    this.log(`  - Critical bugs: ${this.criticalBugs.length}`, this.criticalBugs.length > 0 ? 'critical' : 'info');
    
    if (this.bugs.length === 0) {
      this.log('No bugs found! 🎉', 'success');
    }

    return report;
  }
}

// CLI interface
function main() {
  const args = process.argv.slice(2);
  const options = {
    createIssues: args.includes('--create-issues'),
    slackWebhook: args.find(arg => arg.startsWith('--slack-webhook='))?.split('=')[1]
  };

  const monitor = new BugMonitor(options);
  monitor.run().catch(error => {
    console.error('❌ Error running bug monitor:', error);
    process.exit(1);
  });
}

// ES module - run main function directly
main();
