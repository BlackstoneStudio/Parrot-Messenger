## [2.3.1](https://github.com/BlackstoneStudio/Parrot-Messenger/compare/v2.3.0...v2.3.1) (2026-04-02)

## [Unreleased]

### ⚙️ Continuous Integration

- Upgrade `actions/checkout` to v6.0.2 across CI and release workflows
- Upgrade `github/codeql-action` to v4.35.1 in static-analysis workflows
- Run semantic-release workflows on Node 24.x for semantic-release v25 compatibility

### 📦 Dependencies

- Upgrade `semantic-release` to v25.0.3
- Upgrade `@semantic-release/npm` to v13.1.5 and add `@semantic-release/github` explicitly
- Upgrade `dotenv` to v17.3.1
- Refresh the lockfile and keep release commits in sync with `package-lock.json`

# [2.3.0](https://github.com/BlackstoneStudio/Parrot-Messenger/compare/v2.2.1...v2.3.0) (2026-03-19)

### 🐛 Bug Fixes

- Resolve CodeQL security findings in Telegram and Slack transports
- Replace sequential `escapeMarkdown` with single atomic regex pass
- Replace sequential `escapeHtml` with single-pass character map
- Refactor Slack `htmlToSlackMarkdown` to use single-pass tag replacement
- Restrict Telegram `ALLOWED_URI_REGEXP` to only `https`/`mailto` schemes
- Remove identity replacements in `htmlToTelegram`

## [2.2.1](https://github.com/BlackstoneStudio/Parrot-Messenger/compare/v2.2.0...v2.2.1) (2026-03-19)

### ⚙️ Continuous Integration

- Pin all GitHub Actions to commit SHAs for supply chain security
- Set top-level workflow permissions to `read-all`, scope write permissions per job
- Fix script injection in release workflow summary step
- Add CodeQL static analysis workflow

# [2.2.0](https://github.com/BlackstoneStudio/Parrot-Messenger/compare/v2.1.0...v2.2.0) (2026-03-18)

### ✨ Features

- Add built-in MockTransport for testing (`parrot-messenger/testing`)
- Capture sent messages in memory for assertion in tests
- Support simulated failures and latency for error path testing
- Add `exports` field to package.json for subpath imports

# [2.1.0](https://github.com/BlackstoneStudio/Parrot-Messenger/compare/v2.0.1...v2.1.0) (2026-03-18)

### ✨ Features

- Add Postmark email provider adapter (#73)
- Add Resend email provider adapter (#74)
- Upgrade Telnyx SDK v2 to v6 with MMS support
- Add `mediaUrls` field to Envelope type for MMS
- Set Node.js engine minimum to >=20.0.0

### 📦 Dependencies

- Resolve all 39 npm audit vulnerabilities to 0
- Update all semver-compatible dependencies
- Override `fast-xml-parser` to 5.5.6 for CVE-2026-26278

### ♻️ Code Refactoring

- Replace `xmlbuilder2` with Twilio built-in TwiML `VoiceResponse` builder (removes dependency)

### 📚 Documentation

- Add Postmark and Resend to README provider list and API reference
- Update README header image with Parrot Messenger banner
- Update Telnyx SMS example for v6 SDK with MMS support
- Update copyright year to 2026

## [2.0.1](https://github.com/BlackstoneStudio/Parrot-Messenger/compare/v2.0.0...v2.0.1) (2025-06-27)

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-06-25

### Breaking Changes

- **AWS SES Configuration**: The AWS SES transport configuration has been restricted for security reasons. The `auth` field now only accepts:
  - `region` (string)
  - `accessKeyId` (string)
  - `secretAccessKey` (string)

  Additional AWS SDK configuration options (like `endpoint`, `maxRetries`, `httpOptions`, etc.) are no longer supported. This change prevents potential security misconfigurations and standardizes the authentication approach across all transports.

  **Migration Guide:**

  ```typescript
  // Before (v1.x)
  {
    name: 'ses',
    settings: {
      auth: {
        region: 'us-east-1',
        credentials: { accessKeyId: '...', secretAccessKey: '...' },
        endpoint: 'https://custom-endpoint',
        maxRetries: 3
      }
    }
  }

  // After (v2.0.0)
  {
    name: 'ses',
    settings: {
      auth: {
        region: 'us-east-1',
        accessKeyId: '...',
        secretAccessKey: '...'
      }
    }
  }
  ```

### Added

- All features from v1.1.0 (see below)

### Security

- Restricted AWS SES configuration to prevent potential security misconfigurations
- All security fixes from v1.1.0 are included

## [1.1.0] - 2025-06-24

### Added

- AWS SNS SMS transport provider support
- Telnyx SMS transport provider support
- Comprehensive input validation for emails and phone numbers
- Custom error types (ParrotError, ValidationError, TransportError, TemplateError, ConfigurationError)
- HTML sanitization to prevent XSS attacks
- Comprehensive test suite with 99% statement, function, and line coverage (up from 77%)
- Test coverage for all transport providers (Mailchimp, Mailgun, SendGrid, AWS SNS, Telnyx SMS, Twilio Call)
- Test coverage for voices constants
- GitHub Actions CI/CD pipeline
- TypeScript improvements and better type safety
- Comprehensive examples directory with individual examples for each transport
- Examples for error handling, templates, and multi-transport strategies
- .env.example file with all supported service configurations

### Changed

- Updated all dependencies to latest versions
- Improved error messages with more context
- Better resource management for transport clients
- Enhanced documentation with examples
- Refactored examples directory structure - removed monolithic examples.ts in favor of focused examples

### Fixed

- AWS credentials global pollution issue - now uses isolated SES client
- TwiML injection vulnerability in Twilio Call transport
- Typo: 'setttings' parameter in Twilio SMS constructor
- Typo: 'Tempalte' in error messages
- File naming: renamed 'utlis.ts' to 'utils.ts'
- Fixed ReDoS vulnerability in email validation regex

### Security

- Added input validation for all message fields
- Implemented HTML content sanitization
- Fixed potential SSRF vulnerability in template system
- Prevented XML injection in Twilio Call transport
- Enhanced email validation to prevent ReDoS attacks
- Removed deprecated dependencies (mailchimp, request) - now 0 vulnerabilities

## [1.0.12] - Previous Release

### Added

- Initial release with support for:
  - Email: AWS SES, Mailgun, Mailchimp, SendGrid, SMTP
  - SMS: Twilio, Mailjet
  - Call: Twilio
- Template system with Handlebars
- Async template support
