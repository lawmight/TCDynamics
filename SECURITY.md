# Security Policy

## Supported Versions

We actively maintain security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security vulnerability, please follow these steps:

### 1. **DO NOT** create a public GitHub issue
Security vulnerabilities should be reported privately to prevent exploitation.

### 2. Contact Information
- **Email**: security@tcdynamics.fr
- **Subject**: `[SECURITY] Vulnerability Report - TCDynamics`
- **Response Time**: We aim to respond within 24 hours

### 3. Include the following information:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)
- Your contact information

### 4. What to expect:
- **Acknowledgment**: Within 24 hours
- **Initial Assessment**: Within 48 hours
- **Resolution Timeline**: Depends on severity
  - Critical: 24-48 hours
  - High: 1-2 weeks
  - Medium: 2-4 weeks
  - Low: Next release cycle

## Security Measures

### Dependency Management
- **Automated Updates**: Dependabot monitors and creates PRs for dependency updates
- **Security Audits**: Regular npm audit and safety checks
- **Version Pinning**: Exact version pinning to prevent unexpected updates
- **Pre-commit Hooks**: Security checks run before every commit

### Security Scanning
- **CodeQL**: Static analysis for security vulnerabilities
- **Snyk**: Dependency vulnerability scanning
- **Trivy**: Container image security scanning
- **TruffleHog**: Secrets detection
- **License Compliance**: Automated license checking

### Development Practices
- **Security-First**: Security considerations in all development decisions
- **Regular Audits**: Monthly security audits using `npm run security-audit`
- **Dependency Review**: All dependency changes require review
- **Least Privilege**: Minimal required permissions for all services

## Security Tools

### Available Commands
```bash
# Run comprehensive security audit
npm run security-audit

# Run security audit with auto-fix
npm run security-audit:fix

# Generate security report
npm run security-audit:report

# Check for critical vulnerabilities only
npm run security-audit:critical
```

### Pre-commit Security Checks
The following security checks run automatically before each commit:
- Frontend dependency audit (high/critical only)
- Backend dependency audit (high/critical only)
- Python dependency check (if safety is installed)
- TypeScript type checking
- ESLint security rules

## Vulnerability Disclosure

### Timeline
1. **Discovery**: Vulnerability reported privately
2. **Assessment**: 48 hours for initial assessment
3. **Fix Development**: Timeline based on severity
4. **Testing**: Comprehensive testing of fix
5. **Release**: Coordinated release with security patch
6. **Public Disclosure**: After fix is deployed and verified

### Credit
We believe in giving credit where it's due. Security researchers who responsibly disclose vulnerabilities will be:
- Listed in our security acknowledgments
- Given credit in security advisories
- Invited to our security researcher program

## Security Best Practices

### For Developers
- Never commit secrets or credentials
- Use environment variables for sensitive data
- Keep dependencies updated
- Run security audits regularly
- Follow secure coding practices
- Use HTTPS everywhere
- Implement proper input validation
- Use parameterized queries
- Enable security headers

### For Users
- Keep your software updated
- Use strong, unique passwords
- Enable two-factor authentication where available
- Be cautious with email attachments and links
- Report suspicious activity immediately

## Incident Response

### Security Incident Classification
- **Critical**: Active exploitation, data breach, system compromise
- **High**: Potential for exploitation, significant security risk
- **Medium**: Security weakness, limited exploitation potential
- **Low**: Minor security issue, minimal risk

### Response Process
1. **Detection**: Automated monitoring or manual reporting
2. **Assessment**: Severity classification and impact analysis
3. **Containment**: Immediate steps to prevent further damage
4. **Eradication**: Remove the threat completely
5. **Recovery**: Restore normal operations
6. **Lessons Learned**: Post-incident review and improvements

## Security Contacts

- **Security Team**: security@tcdynamics.fr
- **General Inquiries**: contact@tcdynamics.fr
- **Emergency**: +33-XXX-XXX-XXXX (24/7)

## Legal

This security policy is governed by French law. By reporting a vulnerability, you agree to:
- Not exploit the vulnerability
- Not disclose it publicly until we've had time to fix it
- Allow us reasonable time to address the issue
- Work with us in good faith

## Changelog

- **2025-10-29**: Initial security policy created
- **2025-10-29**: Added comprehensive security tooling and processes

---

*Last updated: October 29, 2025*
*Version: 1.0.0*