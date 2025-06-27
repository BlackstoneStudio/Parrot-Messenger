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
