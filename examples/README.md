# Parrot Messenger Examples

This directory contains comprehensive examples demonstrating all capabilities of Parrot Messenger v2.0.0.

## Quick Start

```bash
# Install dependencies and build
npm install
npm run build

# Run any example
npx ts-node examples/basic-usage.ts
```

## Examples by Category

### 📧 Email Examples

| File | Provider | Description |
|------|----------|-------------|
| `email-aws-ses.ts` | AWS SES | Simple & bulk emails, attachments, custom headers |
| `email-mailgun.ts` | Mailgun | Tracking, scheduling, batch sending, tags |
| `email-sendgrid.ts` | SendGrid | Dynamic templates, personalizations, categories |
| `email-mailchimp.ts` | Mailchimp/Mandrill | Transactional emails, merge variables, templates |
| `email-smtp.ts` | Any SMTP | Gmail, Outlook, Yahoo, custom servers |

### 💬 SMS Examples

| File | Provider | Description |
|------|----------|-------------|
| `sms-twilio.ts` | Twilio | SMS/MMS, scheduling, alphanumeric senders |
| `aws-sns-sms.ts` | AWS SNS | Transactional/Promotional SMS, custom attributes |
| `telnyx-sms.ts` | Telnyx | Long messages, batch sending, auto-segmentation |

### 📞 Voice Call Examples

| File | Provider | Description |
|------|----------|-------------|
| `call-twilio.ts` | Twilio | Text-to-speech, multi-language, custom voices |

### 💬 Chat Examples

| File | Provider | Description |
|------|----------|-------------|
| `chat-slack.ts` | Slack | Bot & webhook messaging, attachments, formatting |
| `chat-telegram.ts` | Telegram | Bot messaging, inline keyboards, HTML/Markdown |

### 🛠️ Feature Examples

| File | Feature | Description |
|------|---------|-------------|
| `basic-usage.ts` | Getting Started | Simple setup and sending |
| `error-handling.ts` | Error Management | All error types, retry logic, validation |
| `templates-advanced.ts` | Templates | Handlebars, async data, multi-language |
| `multi-transport.ts` | Fallbacks | Load balancing, priority routing, failover |

## Environment Variables

Create a `.env` file with your credentials:

```bash
# AWS (SES & SNS)
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1

# Twilio
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+15555555555

# Mailgun
MAILGUN_API_KEY=your_key
MAILGUN_DOMAIN=your_domain.com

# SendGrid
SENDGRID_API_KEY=your_key

# Mailchimp/Mandrill
MANDRILL_API_KEY=your_key

# Telnyx
TELNYX_API_KEY=your_key
TELNYX_PHONE_NUMBER=+15555555555

# Slack
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Telegram
TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

## Running Examples

```bash
# Basic usage
npx ts-node examples/basic-usage.ts

# Email providers
npx ts-node examples/email-aws-ses.ts
npx ts-node examples/email-mailgun.ts
npx ts-node examples/email-sendgrid.ts

# SMS providers
npx ts-node examples/sms-twilio.ts
npx ts-node examples/aws-sns-sms.ts

# Chat providers
npx ts-node examples/chat-slack.ts
npx ts-node examples/chat-telegram.ts

# Advanced features
npx ts-node examples/error-handling.ts
npx ts-node examples/templates-advanced.ts
npx ts-node examples/multi-transport.ts
```

## Key Features Demonstrated

### New Features (v2.0.0)
- Slack integration with bot & webhook support
- Telegram bot support with inline keyboards
- Enhanced chat transport capabilities
- Improved plugin architecture

### Security Enhancements
- Input validation for email and phone numbers
- HTML sanitization to prevent XSS
- Protection against ReDoS attacks
- SSRF prevention in template system
- Isolated AWS credentials

### Error Handling
- Custom error hierarchy for better debugging
- Specific error types for different failure scenarios
- Retry strategies with exponential backoff
- Graceful degradation

### Template System
- Handlebars-based templating
- Async data fetching from APIs
- Template registration and reuse
- Multi-language support
- Complex logic in templates

### Transport Management
- Multiple transport configuration
- Fallback strategies
- Load balancing
- Cost/reliability optimization

## Best Practices

1. **Always use environment variables** for sensitive credentials
2. **Implement proper error handling** using the custom error types
3. **Use templates** for consistent messaging across channels
4. **Configure fallback transports** for high availability
5. **Validate inputs** before sending (done automatically by the library)
6. **Set appropriate defaults** in transport configuration

## Troubleshooting

If you encounter errors:

1. Check that all required environment variables are set
2. Verify your API credentials are valid
3. Ensure phone numbers are in E.164 format (+1234567890)
4. Check that email addresses are valid
5. Review the specific error type for guidance

For more information, see the main [README.md](../README.md) and [CLAUDE.md](../CLAUDE.md).