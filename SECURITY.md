# Security Policy

## Supported Versions

The following versions of Parrot Messenger are currently being supported with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 2.0.0   | ✅                |
| 1.1.0   | ✅                |
| 1.0.13  | ✅                |
| 1.0.12  | ❌                |
| 1.0.11  | ❌                |
| < 1.0.11| ❌                |

## Reporting a Vulnerability

The Parrot Messenger team takes security bugs seriously. We appreciate your efforts to responsibly disclose your findings, and will make every effort to acknowledge your contributions.

To report a security vulnerability, please use one of the following methods:

### 1. GitHub Security Advisories (Preferred)

Report vulnerabilities through [GitHub Security Advisories](https://github.com/BlackstoneStudio/Parrot-Messenger/security/advisories/new). This allows us to discuss and fix the issue privately before public disclosure.

### 2. Email

Send an email to security@blackstone.studio with:

- Type of issue (e.g., buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

### Response Timeline

- **Initial Response**: Within 48 hours, we will acknowledge receipt of your vulnerability report
- **Assessment**: Within 7 days, we will confirm the vulnerability and determine its severity
- **Fix Timeline**: 
  - Critical vulnerabilities: Fixed within 7-14 days
  - High severity: Fixed within 30 days
  - Medium/Low severity: Fixed within 90 days
- **Public Disclosure**: Coordinated with the reporter, typically 90 days after the fix is released

### What to Expect

If you report a vulnerability, here's what will happen:

1. **Acknowledgment**: We'll confirm receipt of your report within 48 hours
2. **Assessment**: We'll investigate and validate the issue
3. **Fix Development**: We'll develop and test a fix
4. **Credit**: With your permission, we'll acknowledge your contribution in the release notes
5. **Disclosure**: We'll coordinate public disclosure timing with you

### Security Update Process

When we release security updates:

1. A new version will be published to npm
2. A security advisory will be published on GitHub
3. The CHANGELOG will be updated with security fix details
4. Affected users will be notified through GitHub's security advisory system

## Security Best Practices

When using Parrot Messenger:

1. **Keep Dependencies Updated**: Regularly update to the latest supported version
2. **Validate Inputs**: Always validate email addresses and phone numbers before sending
3. **Secure Credentials**: Never commit API keys or credentials to version control
4. **Use Environment Variables**: Store sensitive configuration in environment variables
5. **HTTPS Templates**: When using async templates, only fetch from HTTPS endpoints
6. **Sanitize HTML**: Be aware that HTML content is automatically sanitized to prevent XSS

## Known Security Fixes

### Version 2.0.0
- Breaking change: Restricted AWS SES configuration to prevent potential security misconfigurations
- All security fixes from v1.1.0 are included

### Version 1.1.0
- Fixed ReDoS vulnerability in email validation
- Fixed SSRF vulnerability in template fetching system
- Fixed XSS vulnerability through HTML sanitization
- Fixed AWS credentials global pollution issue
- Fixed TwiML injection vulnerability in Twilio Call transport

## Contact

For any security-related questions that don't involve reporting a vulnerability, please contact:
- Email: security@blackstone.studio
- GitHub Discussions: [Security Discussions](https://github.com/BlackstoneStudio/Parrot-Messenger/discussions/categories/security)

---

**Please do NOT report security vulnerabilities through public GitHub issues.**