import { Parrot } from '../src';

/**
 * Postmark Email Example
 * Demonstrates sending emails using the Postmark API
 */

async function sendWithPostmark() {
  // Initialize Parrot with Postmark
  const parrot = new Parrot({
    transports: [
      {
        name: 'postmark',
        settings: {
          auth: {
            serverToken: process.env.POSTMARK_SERVER_TOKEN || '',
          },
          defaults: {
            from: 'noreply@example.com',
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
        subject: 'Hello from Postmark',
        text: 'This email was sent using Postmark via Parrot Messenger.',
        html: '<h1>Hello from Postmark</h1><p>This email was sent using Postmark via Parrot Messenger.</p>',
      },
      {
        class: 'email',
        name: 'postmark',
      },
    );

    console.log('Email sent via Postmark');

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
        name: 'postmark',
      },
    );

    console.log('Email with attachment sent via Postmark');
  } catch (error) {
    if (error.name === 'ValidationError') {
      console.error('Validation error:', error.message);
    } else if (error.name === 'TransportError') {
      console.error('Postmark API error:', error.message);
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
Postmark Configuration Tips:
-----------------------------
1. Sign up at https://postmarkapp.com
2. Create a Server and get your Server Token
3. Verify your sender signature (email or domain)
4. Use message streams for transactional vs broadcast emails

Environment variables needed:
- POSTMARK_SERVER_TOKEN

Features:
- Transactional and broadcast message streams
- Email open/click tracking
- Bounce handling
- Inbound email processing
- Detailed delivery statistics
  `);
}

// Run example
if (require.main === module) {
  sendWithPostmark()
    .then(() => {
      console.log('\nPostmark examples completed');
      showConfigurationTips();
    })
    .catch(console.error);
}
