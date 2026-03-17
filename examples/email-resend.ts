import { Parrot } from '../src';

/**
 * Resend Email Example
 * Demonstrates sending emails using the Resend API
 */

async function sendWithResend() {
  // Initialize Parrot with Resend
  const parrot = new Parrot({
    transports: [
      {
        name: 'resend',
        settings: {
          auth: {
            apiKey: process.env.RESEND_API_KEY || '',
          },
          defaults: {
            from: 'onboarding@resend.dev',
          },
        },
      },
    ],
  });

  try {
    // Example 1: Simple email
    await parrot.send(
      {
        to: 'recipient@example.com',
        subject: 'Hello from Resend',
        text: 'This email was sent using Resend via Parrot Messenger.',
        html: '<h1>Hello from Resend</h1><p>This email was sent using Resend via Parrot Messenger.</p>',
      },
      {
        class: 'email',
        name: 'resend',
      },
    );

    console.log('Email sent via Resend');

    // Example 2: Email with attachment
    await parrot.send(
      {
        from: 'sender@example.com',
        to: 'recipient@example.com',
        subject: 'Email with Attachment',
        html: '<p>Please find the attached document.</p>',
        attachments: [
          {
            filename: 'report.pdf',
            content: Buffer.from('PDF content here').toString('base64'),
            type: 'application/pdf',
            disposition: 'attachment',
          },
        ],
      },
      {
        class: 'email',
        name: 'resend',
      },
    );

    console.log('Email with attachment sent via Resend');
  } catch (error) {
    if (error.name === 'ValidationError') {
      console.error('Validation error:', error.message);
    } else if (error.name === 'TransportError') {
      console.error('Resend API error:', error.message);
    } else if (error.name === 'ConfigurationError') {
      console.error('Configuration error:', error.message);
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

// Configuration tips
function showConfigurationTips() {
  console.log(`
Resend Configuration Tips:
--------------------------
1. Sign up at https://resend.com
2. Create an API key in the dashboard
3. Verify your domain for custom From addresses
4. Use 'onboarding@resend.dev' for testing without domain verification

Environment variables needed:
- RESEND_API_KEY

Features:
- Simple REST API
- React Email template support
- Email open/click tracking
- Webhooks for delivery events
- Domain reputation management
  `);
}

// Run example
if (require.main === module) {
  sendWithResend()
    .then(() => {
      console.log('\nResend examples completed');
      showConfigurationTips();
    })
    .catch(console.error);
}
