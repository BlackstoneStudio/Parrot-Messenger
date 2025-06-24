import Parrot from '../src';

/**
 * Mailgun Email Example
 * Demonstrates sending emails using Mailgun API
 */

async function sendWithMailgun() {
  // Initialize Parrot with Mailgun
  Parrot.init({
    transports: [
      {
        name: 'mailgun',
        settings: {
          auth: {
            domain: process.env.MAILGUN_DOMAIN || 'sandbox.mailgun.org',
            apiKey: process.env.MAILGUN_API_KEY || '',
          },
          defaults: {
            from: 'Mailgun Sandbox <postmaster@sandbox.mailgun.org>',
          },
        },
      },
    ],
  });

  try {
    // Example 1: Simple email
    const result = await Parrot.send({
      to: 'recipient@example.com',
      subject: 'Hello from Mailgun',
      text: 'Testing Mailgun integration with Parrot Messenger.',
      html: '<h1>Hello from Mailgun</h1><p>Testing Mailgun integration with Parrot Messenger.</p>',
    }, {
      class: 'email',
      name: 'mailgun',
    });

    console.log('✓ Email sent via Mailgun:', result);

    // Example 2: Email with tracking
    const trackingResult = await Parrot.send({
      to: 'recipient@example.com',
      subject: 'Tracked Email',
      html: '<p>This email has open and click tracking enabled.</p><a href="https://example.com">Click here</a>',
      // Mailgun-specific options
      'o:tracking': true,
      'o:tracking-clicks': true,
      'o:tracking-opens': true,
    }, {
      class: 'email',
      name: 'mailgun',
    });

    console.log('✓ Tracked email sent:', trackingResult);

    // Example 3: Scheduled email
    const futureDate = new Date();
    futureDate.setHours(futureDate.getHours() + 1);

    const scheduledResult = await Parrot.send({
      to: 'recipient@example.com',
      subject: 'Scheduled Email',
      html: '<p>This email was scheduled to be sent in the future.</p>',
      'o:deliverytime': futureDate.toUTCString(),
    }, {
      class: 'email',
      name: 'mailgun',
    });

    console.log('✓ Scheduled email queued:', scheduledResult);

    // Example 4: Email with tags and metadata
    const taggedResult = await Parrot.send({
      to: 'recipient@example.com',
      subject: 'Tagged Email',
      html: '<p>This email includes tags and custom variables for analytics.</p>',
      'o:tag': ['newsletter', 'promotion', 'summer-2024'],
      'v:user-id': '12345',
      'v:campaign': 'summer-sale',
    }, {
      class: 'email',
      name: 'mailgun',
    });

    console.log('✓ Tagged email sent:', taggedResult);

    // Example 5: Batch sending with recipient variables
    const batchResult = await Parrot.send({
      to: ['alice@example.com', 'bob@example.com'],
      subject: 'Hello %recipient.name%',
      html: '<p>Hi %recipient.name%! Your discount code is: %recipient.code%</p>',
      'recipient-variables': JSON.stringify({
        'alice@example.com': { name: 'Alice', code: 'ALICE20' },
        'bob@example.com': { name: 'Bob', code: 'BOB25' },
      }),
    }, {
      class: 'email',
      name: 'mailgun',
    });

    console.log('✓ Batch email sent:', batchResult);

  } catch (error) {
    if (error.name === 'ValidationError') {
      console.error('❌ Validation error:', error.message);
    } else if (error.name === 'TransportError') {
      console.error('❌ Mailgun API error:', error.message);
      // Common issues: Invalid API key, domain not verified, sandbox restrictions
    } else if (error.name === 'ConfigurationError') {
      console.error('❌ Configuration error:', error.message);
    } else {
      console.error('❌ Unexpected error:', error);
    }
  }
}

// Configuration tips
function showConfigurationTips() {
  console.log(`
Mailgun Configuration Tips:
---------------------------
1. Sign up at https://mailgun.com
2. Verify your domain (or use sandbox for testing)
3. Get your API key from the dashboard
4. Add authorized recipients for sandbox domain
5. Configure webhooks for tracking events

Environment variables needed:
- MAILGUN_API_KEY
- MAILGUN_DOMAIN

Features:
- Email validation
- Detailed analytics
- Inbound routing
- Email tracking
- Batch sending
- Scheduled delivery
- Custom variables and tags

Sandbox limitations:
- Can only send to authorized recipients
- Limited to 300 emails/day
- Requires recipient verification
  `);
}

// Run example
if (require.main === module) {
  sendWithMailgun()
    .then(() => {
      console.log('\n✓ Mailgun examples completed');
      showConfigurationTips();
    })
    .catch(console.error);
}