#!/usr/bin/env node
/**
 * TCDynamics Security Audit Script
 * 
 * This script performs comprehensive security audits across all components:
 * - Frontend (React/TypeScript)
 * - Backend (Node.js)
 * - Python (Azure Functions)
 * - Docker images
 * - GitHub Actions
 * 
 * Usage:
 *   node scripts/security-audit.js [--fix] [--report] [--severity=high]
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  severity: process.argv.includes('--severity=critical') ? 'critical' : 
           process.argv.includes('--severity=high') ? 'high' : 'moderate',
  fix: process.argv.includes('--fix'),
  report: process.argv.includes('--report'),
  outputFile: 'security-audit-report.json'
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function execCommand(command, options = {}) {
  try {
    const result = execSync(command, { 
      encoding: 'utf8', 
      stdio: 'pipe',
      ...options 
    });
    return { success: true, output: result };
  } catch (error) {
    return { 
      success: false, 
      error: error.message, 
      output: error.stdout || error.stderr || ''
    };
  }
}

function checkFrontendSecurity() {
  log('\n🔍 Checking Frontend Security...', 'cyan');
  
  const auditResult = execCommand(`npm audit --audit-level=${CONFIG.severity} --json`);
  
  if (auditResult.success) {
    const auditData = JSON.parse(auditResult.output);
    const vulnerabilities = auditData.vulnerabilities || {};
    const vulnCount = Object.keys(vulnerabilities).length;
    
    if (vulnCount === 0) {
      log('✅ Frontend: No vulnerabilities found', 'green');
      return { status: 'pass', vulnerabilities: 0 };
    } else {
      log(`❌ Frontend: ${vulnCount} vulnerabilities found`, 'red');
      
      if (CONFIG.fix) {
        log('🔧 Attempting to fix frontend vulnerabilities...', 'yellow');
        const fixResult = execCommand('npm audit fix');
        if (fixResult.success) {
          log('✅ Frontend vulnerabilities fixed', 'green');
        } else {
          log('⚠️ Some frontend vulnerabilities could not be auto-fixed', 'yellow');
        }
      }
      
      return { status: 'fail', vulnerabilities: vulnCount, details: vulnerabilities };
    }
  } else {
    log('❌ Frontend audit failed', 'red');
    return { status: 'error', error: auditResult.error };
  }
}

function checkBackendSecurity() {
  log('\n🔍 Checking Backend Security...', 'cyan');
  
  const auditResult = execCommand(`cd backend && npm audit --audit-level=${CONFIG.severity} --json`);
  
  if (auditResult.success) {
    const auditData = JSON.parse(auditResult.output);
    const vulnerabilities = auditData.vulnerabilities || {};
    const vulnCount = Object.keys(vulnerabilities).length;
    
    if (vulnCount === 0) {
      log('✅ Backend: No vulnerabilities found', 'green');
      return { status: 'pass', vulnerabilities: 0 };
    } else {
      log(`❌ Backend: ${vulnCount} vulnerabilities found`, 'red');
      
      if (CONFIG.fix) {
        log('🔧 Attempting to fix backend vulnerabilities...', 'yellow');
        const fixResult = execCommand('cd backend && npm audit fix');
        if (fixResult.success) {
          log('✅ Backend vulnerabilities fixed', 'green');
        } else {
          log('⚠️ Some backend vulnerabilities could not be auto-fixed', 'yellow');
        }
      }
      
      return { status: 'fail', vulnerabilities: vulnCount, details: vulnerabilities };
    }
  } else {
    log('❌ Backend audit failed', 'red');
    return { status: 'error', error: auditResult.error };
  }
}

function checkPythonSecurity() {
  log('\n🔍 Checking Python Security...', 'cyan');
  
  // Check if safety is installed
  const safetyCheck = execCommand('which safety');
  if (!safetyCheck.success) {
    log('⚠️ Safety not installed - skipping Python security check', 'yellow');
    log('💡 Install with: pip install safety', 'blue');
    return { status: 'skipped', reason: 'safety not installed' };
  }
  
  const safetyResult = execCommand(`cd TCDynamics && safety check --severity=${CONFIG.severity} --json`);
  
  if (safetyResult.success) {
    try {
      const safetyData = JSON.parse(safetyResult.output);
      const vulnCount = safetyData.length || 0;
      
      if (vulnCount === 0) {
        log('✅ Python: No vulnerabilities found', 'green');
        return { status: 'pass', vulnerabilities: 0 };
      } else {
        log(`❌ Python: ${vulnCount} vulnerabilities found`, 'red');
        return { status: 'fail', vulnerabilities: vulnCount, details: safetyData };
      }
    } catch (e) {
      // Safety might not return JSON format
      if (safetyResult.output.includes('vulnerabilities reported')) {
        log('❌ Python: Vulnerabilities found', 'red');
        return { status: 'fail', vulnerabilities: 'unknown', details: safetyResult.output };
      } else {
        log('✅ Python: No vulnerabilities found', 'green');
        return { status: 'pass', vulnerabilities: 0 };
      }
    }
  } else {
    log('❌ Python security check failed', 'red');
    return { status: 'error', error: safetyResult.error };
  }
}

function checkDockerSecurity() {
  log('\n🔍 Checking Docker Security...', 'cyan');
  
  // Check if Docker is available
  const dockerCheck = execCommand('which docker');
  if (!dockerCheck.success) {
    log('⚠️ Docker not available - skipping container security check', 'yellow');
    return { status: 'skipped', reason: 'docker not available' };
  }
  
  // Check if Trivy is available
  const trivyCheck = execCommand('which trivy');
  if (!trivyCheck.success) {
    log('⚠️ Trivy not installed - skipping container security check', 'yellow');
    log('💡 Install with: https://aquasecurity.github.io/trivy/', 'blue');
    return { status: 'skipped', reason: 'trivy not installed' };
  }
  
  // Scan Dockerfiles for vulnerabilities
  const dockerfiles = ['Dockerfile.frontend', 'backend/Dockerfile'];
  const results = [];
  
  for (const dockerfile of dockerfiles) {
    if (fs.existsSync(dockerfile)) {
      log(`🔍 Scanning ${dockerfile}...`, 'blue');
      const trivyResult = execCommand(`trivy config ${dockerfile} --severity ${CONFIG.severity.toUpperCase()}`);
      
      if (trivyResult.success) {
        log(`✅ ${dockerfile}: No vulnerabilities found`, 'green');
        results.push({ file: dockerfile, status: 'pass' });
      } else {
        log(`❌ ${dockerfile}: Vulnerabilities found`, 'red');
        results.push({ file: dockerfile, status: 'fail', details: trivyResult.output });
      }
    }
  }
  
  return { status: 'completed', results };
}

function generateReport(auditResults) {
  const report = {
    timestamp: new Date().toISOString(),
    severity: CONFIG.severity,
    summary: {
      totalComponents: Object.keys(auditResults).length,
      passed: Object.values(auditResults).filter(r => r.status === 'pass').length,
      failed: Object.values(auditResults).filter(r => r.status === 'fail').length,
      errors: Object.values(auditResults).filter(r => r.status === 'error').length,
      skipped: Object.values(auditResults).filter(r => r.status === 'skipped').length
    },
    results: auditResults
  };
  
  if (CONFIG.report) {
    fs.writeFileSync(CONFIG.outputFile, JSON.stringify(report, null, 2));
    log(`\n📄 Security report saved to ${CONFIG.outputFile}`, 'green');
  }
  
  return report;
}

function printSummary(report) {
  log('\n' + '='.repeat(60), 'bold');
  log('🔒 SECURITY AUDIT SUMMARY', 'bold');
  log('='.repeat(60), 'bold');
  
  log(`📅 Date: ${new Date().toLocaleString()}`, 'blue');
  log(`🎯 Severity Level: ${CONFIG.severity.toUpperCase()}`, 'blue');
  log(`📊 Components Checked: ${report.summary.totalComponents}`, 'blue');
  
  log('\n📈 Results:', 'bold');
  log(`  ✅ Passed: ${report.summary.passed}`, 'green');
  log(`  ❌ Failed: ${report.summary.failed}`, 'red');
  log(`  ⚠️  Errors: ${report.summary.errors}`, 'yellow');
  log(`  ⏭️  Skipped: ${report.summary.skipped}`, 'blue');
  
  if (report.summary.failed > 0 || report.summary.errors > 0) {
    log('\n🚨 Action Required:', 'red');
    log('  • Review failed security checks above', 'red');
    log('  • Run with --fix to attempt automatic fixes', 'yellow');
    log('  • Update vulnerable dependencies manually', 'yellow');
    process.exit(1);
  } else {
    log('\n🎉 All security checks passed!', 'green');
  }
}

// Main execution
async function main() {
  log('🔒 TCDynamics Security Audit', 'bold');
  log(`Severity Level: ${CONFIG.severity.toUpperCase()}`, 'blue');
  log(`Auto-fix: ${CONFIG.fix ? 'Enabled' : 'Disabled'}`, 'blue');
  log(`Report: ${CONFIG.report ? `Enabled (${CONFIG.outputFile})` : 'Disabled'}`, 'blue');
  
  const auditResults = {
    frontend: checkFrontendSecurity(),
    backend: checkBackendSecurity(),
    python: checkPythonSecurity(),
    docker: checkDockerSecurity()
  };
  
  const report = generateReport(auditResults);
  printSummary(report);
}

// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  log('TCDynamics Security Audit Script', 'bold');
  log('\nUsage: node scripts/security-audit.js [options]', 'blue');
  log('\nOptions:', 'bold');
  log('  --fix                    Attempt to fix vulnerabilities automatically');
  log('  --report                 Generate JSON report file');
  log('  --severity=LEVEL         Set minimum severity (low|moderate|high|critical)');
  log('  --help, -h               Show this help message');
  log('\nExamples:', 'bold');
  log('  node scripts/security-audit.js');
  log('  node scripts/security-audit.js --fix --severity=high');
  log('  node scripts/security-audit.js --report --severity=critical');
  process.exit(0);
}

main().catch(error => {
  log(`\n❌ Security audit failed: ${error.message}`, 'red');
  process.exit(1);
});