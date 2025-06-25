<a href="https://www.blackstone.studio/" target="_blank"><img src="./assets/header.png" alt="Blackstone Studio - In Development We Trust"></a>

# Parrot Messenger

<p>
  <a href="https://www.npmjs.com/package/parrot-messenger" target="_blank">
    <img alt="npm version" src="https://img.shields.io/npm/v/parrot-messenger.svg" />
  </a>
  <img alt="Build Status" src="https://github.com/BlackstoneStudio/Parrot-Messenger/workflows/CI/badge.svg" />
  <img alt="Code Coverage" src="https://img.shields.io/badge/coverage-99%25-brightgreen" />
  <a href="https://github.com/BlackstoneStudio/Parrot-Messenger/releases" target="_blank">
    <img alt="GitHub release" src="https://img.shields.io/github/v/release/BlackstoneStudio/Parrot-Messenger" />
  </a>
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-100%25-blue" />
  <img alt="Node.js Version" src="https://img.shields.io/badge/node-%3E%3D18-brightgreen" />
  <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" />
</p>

## Table of Contents

- [What's New](#whats-new)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installing](#installing)
- [Local Development](#local-development)
- [Initialization](#initialization)
- [Settings](#settings)
- [API](#api)
- [Templates](#templates)
- [API Reference](#api-reference)

## What's New

### Version 1.1.0

#### New Features

- **Telnyx SMS Support**: Added Telnyx as a new SMS transport provider
- **AWS SNS SMS Support**: Added AWS SNS for SMS messaging capabilities
- **Enhanced Security**:
  - Fixed AWS credentials global pollution issue
  - Added input validation for email addresses and phone numbers
  - Implemented HTML sanitization to prevent XSS attacks
  - Fixed TwiML injection vulnerability
- **Better Error Handling**:
  - Added custom error types for better debugging
  - Improved error messages with more context
  - Added validation errors with clear messages
- **Improved Type Safety**:
  - Reduced usage of `any` types
  - Better TypeScript support throughout the codebase
- **Performance Enhancements**:
  - Transport clients are now properly managed
  - Better resource utilization
- **Testing**: Added comprehensive test suite with high coverage
- **CI/CD**: Migrated from CircleCI to GitHub Actions

#### Breaking Changes

None - This release maintains full backward compatibility

## Features

Parrot Messenger is a messaging library that can normalize the APIs for different messaging transports.
In its current iteration it supports 3 types of transport classes:

- Email
- SMS
- Call

### Email Services

- AWS SES
- Mailchimp (Mandrill)
- Mailgun
- Sendgrid
- SMTP

### SMS Services

- Twilio
- Mailjet
- Telnyx
- AWS SNS

### Call Services

- Twilio

## Prerequisites

- Node.js 18+ or higher
- npm (comes with Node.js)

## Installing

Using npm:

```bash
$ npm install parrot-messenger
```

## Local Development

### Setting up the development environment

1. **Clone the repository**

   ```bash
   git clone https://github.com/BlackstoneStudio/Parrot-Messenger.git
   cd Parrot-Messenger
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your service credentials for testing.

### Development Commands

- **Build the project**

  ```bash
  npm run build              # Build TypeScript to JavaScript
  npm run clean              # Clean build artifacts
  npm run dev                # Build in watch mode for development
  ```

- **Run tests**

  ```bash
  npm test                   # Run all tests
  npm run test:watch         # Run tests in watch mode
  npm run test:coverage      # Run tests with coverage report
  npm run test:debug         # Debug tests with Node inspector
  ```

- **Code quality**

  ```bash
  npm run lint               # Check code with ESLint
  npm run lint:fix           # Auto-fix ESLint issues
  npm run typecheck          # Run TypeScript type checking
  npm run format             # Format code with Prettier
  npm run format:check       # Check code formatting
  ```

- **Documentation**

  ```bash
  npm run docs               # Generate API documentation
  npm run docs:watch         # Generate docs in watch mode
  ```

- **Release**
  ```bash
  npm run release            # Create a release (CI only)
  npm run release:dry-run    # Preview release changes
  ```

### Development Tools

This project uses modern development tools:

- **Prettier** - Code formatting
- **ESLint** - Code linting with TypeScript support
- **Husky** - Git hooks for pre-commit checks
- **lint-staged** - Run linters on staged files
- **TypeDoc** - API documentation generation
- **semantic-release** - Automated versioning and releases

### VS Code Integration

The project includes VS Code configuration for optimal development experience:

- **Debugging** - Launch configurations for debugging tests and TypeScript code
- **Auto-formatting** - Format on save with Prettier
- **ESLint integration** - Real-time linting feedback
- **Recommended extensions** - Suggested extensions for the best experience

To use: Open the project in VS Code and install recommended extensions when prompted.

### Project Structure

```
parrot-messenger/
├── src/                   # TypeScript source files
│   ├── transports/        # Transport implementations
│   │   ├── aws/          # AWS SES and SNS
│   │   ├── telnyx/       # Telnyx SMS
│   │   └── twilio/       # Twilio SMS and Call
│   ├── templates/         # Template engine
│   ├── constants/         # Constants (voices, etc.)
│   ├── errors.ts         # Custom error types
│   ├── validation.ts     # Input validation
│   └── send.ts           # Core send logic
├── test/                  # Test files
├── examples/              # Usage examples
├── dist/                  # Compiled JavaScript (generated)
└── package.json          # Project configuration
```

### Testing

The project maintains 100% code coverage. When adding new features:

1. Write tests first (TDD approach recommended)
2. Ensure all tests pass: `npm test`
3. Check coverage: `npm test -- --coverage`
4. Fix any linting issues: `npm run lint`

### Contributing

We welcome contributions! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) file for detailed guidelines, including:

- Commit message format (following Blackstone Code Standards)
- Development workflow
- Testing requirements
- Code style guidelines
- Pull request process

**Quick Start:**

1. Fork the repository
2. Create a feature branch following our naming convention
3. Make your changes and add tests
4. Follow our commit message format: `TYPE (Issue) Brief summary`
5. Ensure all tests pass and maintain code coverage
6. Create a Pull Request

### Debugging Tips

- Use `console.log` or debugger statements during development
- Run tests for specific files: `npm test path/to/test.spec.ts`
- Use VS Code's built-in debugger with the following configuration:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

## Initialization

Parrot needs to be initialized with the transports that it will be using before being used.

```js
// ES6
import Parrot from 'parrot-messenger';

// CommonJS
const { Parrot } = require('parrot-messenger');

const parrot = new Parrot({
  transports: [
    // List of transports settings enabled
    mailgun,
    mailchimp,
    ses,
    sendgrid,
    mailjetEmail,
    mailjetSMS,
    twilioSMS,
    twilioCall,
    smtp,
  ],
});
```

The `parrot` instance receives an array of transports with the settings for each transport. Each transport will have slightly different settings, particularly around the authentication for each. Example configurations are available in the `examples.js` file.

## Settings

Each transport has a `defaults` object where you can define default parameters for all messages generated by that transport. So for example you can define a default `from` value for every message.

This is a sample object for AWS SES transport along with its default values:

```js
const ses = {
  name: 'ses',
  settings: {
    auth: {
      region: '',
      credentials: {
        secretAccessKey: '',
        accessKeyId: '',
      },
    },
    defaults: {
      from: 'me@parrotmessenger.com',
    },
  },
};
```

For Telnyx SMS transport:

```js
const telnyxSMS = {
  name: 'telnyxSMS',
  settings: {
    auth: {
      apiKey: 'YOUR_TELNYX_API_KEY',
    },
    defaults: {
      from: '+15551234567', // Your Telnyx phone number
    },
  },
};
```

For AWS SNS SMS transport:

```js
const sns = {
  name: 'sns',
  settings: {
    auth: {
      secretAccessKey: 'YOUR_SECRET_ACCESS_KEY',
      accessKeyId: 'YOUR_ACCESS_KEY_ID',
      region: 'us-east-1',
    },
    smsType: 'Transactional', // or 'Promotional'
    defaults: {
      from: 'YourApp', // SMS Sender ID (not supported in all regions)
    },
  },
};
```

## API

Parrot Messenger works with a simple `send` service and a templating, here we'll describe the usage for the send method.
The send method receives 2 parameters, both being objects.
The first parameter is the parameters for the object that we want to send and the second one is the settings for the transport we want to use.

Example API call:

```js
const email = {
  to: 'john@doe.com',
  subject: 'Sample Message',
  html: 'Hey Joe, nice talking to you!',
};

const transport = {
  class: 'email',
  name: 'ses',
};

parrot.send(email, transport);
```

## Templates

We can also use and register templates when using Parrot Messenger, so we can pre-define a set of messages we will be using. We use a templating language (Handlebars) to replace values inside the template before being sent.

Example Template Registration & Usage

```js
// Register a template, notice the ussage of {{name}}
// this value will be replaced
parrot.templates.register({
  name: 'Sample Template',
  html: '<p>Hey there {{name}}!!</p>',
});

const messageData = {
  to: 'john@doe.com',
  subject: 'Hey there!',
};

const transport = {
  class: 'email',
  name: 'ses',
};

// Send an email using this template
parrot.templates.send(
  'Sample Template',
  messageData,
  // Sample Data for Template
  { name: 'User' },
  // Transport Settings
  // Available classes email, sms & call
  // Available transports per Class:
  // Email: 'ses', 'mailgun', 'mailjetEmail', 'mailchimp', 'sendgrid', 'smtp'
  // SMS: 'twilioSMS', 'mailjetSMS', 'telnyxSMS', 'sns'
  // Call: 'twilioCall'
  transport,
);
```

### Async Templates

If you need to get the HTML template from an API service prior to senting a template you can do this as well. Parrot Messenger will use Axios to make an API request and fetch the necessary data, and it can be mapped from the response.

Example Async Template

```js
// Register template
parrot.templates.register({
  name: 'Async Template',
  // Request is a standard Axios type object
  // with an additional resolve parameter
  // that resolves the response of the object
  // API reference for Axios:
  // https://github.com/axios/axios#axios-api
  request: {
    method: 'GET',
    url: 'https://reqres.in/api/unknown/2',
    data: {},
    headers: {},
    // Path to string we want to use in the request's response
    resolve: 'support.text',
  },
});

const messageData = {
  to: 'john@doe.com',
  subject: 'Hey there!',
};

const transport = {
  class: 'email',
  name: 'ses',
};

// Send an email using this template
parrot.templates.send(
  'Async Template',
  messageData,
  // Sample Data for Template
  { name: 'User' },
  // Transport Settings
  transport,
);
```

## API Reference

### TypeScript Support

Parrot Messenger is written in TypeScript and provides full type definitions out of the box.

```typescript
import Parrot, { Envelope, Transport } from 'parrot-messenger';
```

### Core Types

#### Envelope

The message object that all transports accept:

```typescript
interface Envelope {
  from?: string; // Sender address/number
  to?: string; // Recipient address/number
  subject?: string; // Email subject (required for email)
  html?: string; // HTML content
  text?: string; // Plain text content
  voice?: string; // Voice selection for calls (see Voices section)
  attachments?: Attachment[]; // File attachments
}
```

#### Transport Configuration

```typescript
interface Transport {
  name: TransportName;
  class: 'email' | 'sms' | 'call';
  settings: TransportSettings;
}
```

### Email Transports

#### AWS SES

```typescript
interface AWSSESConfig {
  auth: {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
  };
  defaults?: Envelope;
}
```

#### SendGrid

```typescript
interface SendgridConfig {
  auth: {
    apiKey: string; // Must start with 'SG.'
  };
  defaults?: Envelope;
}
```

#### Mailgun

```typescript
interface MailgunConfig {
  auth: {
    apiKey: string;
    domain: string; // e.g., 'mg.yourdomain.com'
  };
  defaults?: Envelope;
}
```

#### Mailchimp (Mandrill)

```typescript
interface MailchimpConfig {
  auth: {
    apiKey: string;
  };
  defaults?: Envelope;
}
```

#### SMTP

```typescript
interface SMTPConfig {
  auth: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
  defaults?: Envelope;
}
```

### SMS Transports

#### Twilio SMS

```typescript
interface TwilioSMSConfig {
  auth: {
    sid: string; // Account SID
    token: string; // Auth token
  };
  defaults?: Envelope;
}
```

#### AWS SNS

```typescript
interface AWSSNSConfig {
  auth: {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
  };
  smsType?: 'Transactional' | 'Promotional';
  defaults?: Envelope;
}
```

#### Telnyx

```typescript
interface TelnyxConfig {
  auth: {
    apiKey: string;
  };
  defaults?: Envelope;
}
```

#### Mailjet SMS

```typescript
interface MailjetSMSConfig {
  auth: {
    apiToken: string;
  };
  defaults?: Envelope;
}
```

### Call Transport

#### Twilio Call

```typescript
interface TwilioCallConfig {
  auth: {
    sid: string; // Account SID
    token: string; // Auth token
  };
  defaults?: Envelope;
}
```

### Error Types

Parrot Messenger provides custom error types for better error handling:

```typescript
// Base error class
class ParrotError extends Error {
  constructor(message: string, details?: any);
}

// Thrown when input validation fails
class ValidationError extends ParrotError {
  constructor(message: string, field?: string);
}

// Thrown when a transport operation fails
class TransportError extends ParrotError {
  constructor(message: string, transport?: string, originalError?: Error);
}

// Thrown when template processing fails
class TemplateError extends ParrotError {
  constructor(message: string, templateName?: string);
}

// Thrown when configuration is invalid
class ConfigurationError extends ParrotError {
  constructor(message: string, config?: any);
}
```

### Error Handling Example

```typescript
import { send, ValidationError, TransportError } from 'parrot-messenger';

try {
  await send(message, transports);
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Invalid input:', error.message);
  } else if (error instanceof TransportError) {
    console.error('Transport failed:', error.message);
    // Access original error: error.originalError
  } else {
    console.error('Unexpected error:', error);
  }
}
```

### Voices for Calls

Available voices for text-to-speech in calls:

```typescript
import { voices } from 'parrot-messenger';

// Example voices:
voices.Salli; // English (US)
voices.Amy; // English (British)
voices.Conchita; // Spanish (Castilian)
voices.Mizuki; // Japanese
// ... and many more

// Usage in envelope:
const message: Envelope = {
  from: '+1234567890',
  to: '+0987654321',
  html: '<p>Hello!</p>',
  voice: 'Amy', // British English voice
};
```

### Transport Filter Options

When sending messages, you can filter which transports to use:

```typescript
// Use specific transport by name
await send(message, transports, { name: 'smtp' });

// Use all transports of a specific class
await send(message, transports, { class: 'email' });

// Use specific transport with both name and class
await send(message, transports, { name: 'smtp', class: 'email' });

// Use multiple transports
await send(message, transports, [{ name: 'smtp' }, { name: 'ses' }]);
```

### Validation Rules

- **Email addresses**: Must be valid RFC-compliant email addresses
- **Phone numbers**: Must be valid E.164 format (e.g., +1234567890)
- **Required fields**:
  - `to`: Always required
  - `from`: Always required
  - `subject`: Required for email only
  - `html` or `text`: At least one is required
- **HTML content**: Automatically sanitized to prevent XSS attacks

## Who are we

Blackstone Studio is a custom software development company that specializes in AI-powered digital transformation solutions. We help you harness the power of artificial intelligence to build innovative solutions, accelerating your business's digital transformation journey.

### Our services

- Custom Software Development
- Staff Augmentation
- Dedicated Teams
- Generative AI Development
- Mobile Development
- Web Development
- Software Testing
- Software Integrations
- No-Code Development
- Maintenance and Support

### Why us?

We pride ourselves on understanding each client's unique business model and creating solutions that complement their strategic vision. With our AI-centric approach to solving business challenges and flexible, adaptable development methodology, we build lasting partnerships that go beyond just software development. We serve diverse industries including retail, financial services, healthcare, real estate, and technology.

## Built With

- [Node.js](https://nodejs.org/en/) - Runtime environment
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Jest](https://jestjs.io/) - Testing framework with 100% code coverage
- [Handlebars](https://handlebarsjs.com/) - Template engine
- [Nodemailer](https://nodemailer.com/) - Email sending
- [AWS SDK](https://aws.amazon.com/sdk-for-javascript/) - AWS SES and SNS integration
- [Twilio](https://www.twilio.com/) - SMS and voice calls
- [GitHub Actions](https://github.com/features/actions) - CI/CD pipeline

## Contributing

Contributions, issues and feature requests are welcome!

You can also suggest a new feature by creating an Issue. Please wait for confirmation before working on it.

## License

Copyright © 2025 [Blackstone Studio](https://blackstone.studio/).

This project is [MIT](https://github.com/BlackstoneStudio/Parrot-Messenger/master/LICENSE) licensed.

<a href="https://www.blackstone.studio" target="_blank"><img src="./assets/footer.png" alt="We are blackstone - Contact us"></a>
