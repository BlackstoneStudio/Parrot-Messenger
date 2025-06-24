# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-06-22

### Added
- Telnyx SMS transport provider support
- Comprehensive input validation for emails and phone numbers
- Custom error types (ParrotError, ValidationError, TransportError, TemplateError, ConfigurationError)
- HTML sanitization to prevent XSS attacks
- Comprehensive test suite with high coverage
- GitHub Actions CI/CD pipeline
- TypeScript improvements and better type safety

### Changed
- Updated all dependencies to latest versions
- Improved error messages with more context
- Better resource management for transport clients
- Enhanced documentation with examples

### Fixed
- AWS credentials global pollution issue - now uses isolated SES client
- TwiML injection vulnerability in Twilio Call transport
- Typo: 'setttings' parameter in Twilio SMS constructor
- Typo: 'Tempalte' in error messages
- File naming: renamed 'utlis.ts' to 'utils.ts'

### Security
- Added input validation for all message fields
- Implemented HTML content sanitization
- Fixed potential SSRF vulnerability in template system
- Prevented XML injection in Twilio Call transport

## [1.0.12] - Previous Release

### Added
- Initial release with support for:
  - Email: AWS SES, Mailgun, Mailchimp, SendGrid, SMTP
  - SMS: Twilio, Mailjet
  - Call: Twilio
- Template system with Handlebars
- Async template support