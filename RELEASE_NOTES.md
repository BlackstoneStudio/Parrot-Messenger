# Release v2.0.0

## ⚠️ Breaking Changes

- **AWS SES Configuration**: The AWS SES transport configuration has been restricted for security reasons. The `auth` field now only accepts `region`, `accessKeyId`, and `secretAccessKey`. Additional AWS SDK configuration options are no longer supported.

## ✨ Features

- **Chat Platform Support**: Added Slack integration (bot tokens and webhooks)
- **Chat Platform Support**: Added Telegram bot support with inline keyboards
- **SMS Providers**: Added AWS SNS SMS support
- **SMS Providers**: Added Telnyx SMS support

## 🐛 Bug Fixes

- Fixed AWS credentials global pollution issue
- Fixed TwiML injection vulnerability in Twilio Call transport
- Fixed ReDoS vulnerability in email validation
- Fixed typos: 'utlis.ts' → 'utils.ts', 'setttings' → 'settings', 'Tempalte' → 'Template'
- Fixed missing error handling in multiple transports
- Fixed SMTP transport missing text field
- Fixed Mailgun redundant attachment handling

## 🔧 Functionality Changes

- Enhanced developer experience with modern tooling
- Improved error handling with custom error types
- Added comprehensive input validation
- Added HTML sanitization to prevent XSS attacks

## 📚 Documentation

- Added OpenSSF Best Practices badge (ID: 10814)
- Comprehensive README with examples for all transports
- Added security policy (SECURITY.md)
- Added code of conduct (CODE_OF_CONDUCT.md)
- Removed references to non-existent Mailjet transport

## ⚙️ Continuous Integration

- Migrated from CircleCI to GitHub Actions
- Added Dependabot for automated dependency updates
- Added OpenSSF Scorecard workflow
- Added automatic release workflow
- Added Prettier formatting checks

## ✅ Tests

- Achieved 99% test coverage (up from 77%)
- Added comprehensive test suites for all 13 transport providers
- Added 264 unit tests covering all edge cases

## 📦 Dependencies

- Updated all dependencies to latest versions
- Updated AWS SDK to v3
- Removed deprecated dependencies

## 🔍 Code Style

- Added ESLint with TypeScript support
- Added Prettier for code formatting
- Added Husky for pre-commit hooks
- Fixed all linting errors

## Full Changelog

See [CHANGELOG.md](./CHANGELOG.md) for complete details.