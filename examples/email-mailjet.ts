import Parrot from '../src';

/**
 * Mailjet Email Example
 * Demonstrates sending emails using Mailjet API
 */

async function sendWithMailjet() {
  // Initialize Parrot with Mailjet
  Parrot.init({
    transports: [
      {
        name: 'mailjetEmail',
        settings: {
          auth: {
            apiKeyPublic: process.env.MAILJET_API_KEY || '',
            apiKeyPrivate: process.env.MAILJET_SECRET_KEY || '',
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
    const result = await Parrot.send({
      to: 'recipient@example.com',
      subject: 'Hello from Mailjet',
      text: 'This email was sent using Mailjet via Parrot Messenger.',
      html: '<h1>Hello from Mailjet</h1><p>This email was sent using Mailjet via Parrot Messenger.</p>',
    }, {
      class: 'email',
      name: 'mailjetEmail',
    });

    console.log('✓ Email sent via Mailjet:', result);

    // Example 2: Email with custom ID and monitoring
    const monitoredResult = await Parrot.send({
      to: 'recipient@example.com',
      subject: 'Monitored Email',
      html: '<p>This email includes custom tracking.</p>',
      CustomID: 'AppEvent_12345',
      EventPayload: JSON.stringify({
        event: 'purchase_confirmation',
        userId: '67890',
      }),
      MonitoringCategory: 'transactional',
    }, {
      class: 'email',
      name: 'mailjetEmail',
    });

    console.log('✓ Monitored email sent:', monitoredResult);

    // Example 3: Email with template language
    const templateResult = await Parrot.send({
      to: 'recipient@example.com',
      subject: 'Personalized Email',
      html: `
        <h1>Hello {{var:firstName:"Friend"}}!</h1>
        <p>Your account balance is {{var:balance:"$0.00"}}.</p>
        {{#if var:isPremium}}
          <p>Thank you for being a premium member!</p>
        {{/if}}
      `,
      Variables: {
        firstName: 'John',
        balance: '$150.00',
        isPremium: true,
      },
    }, {
      class: 'email',
      name: 'mailjetEmail',
    });

    console.log('✓ Template email sent:', templateResult);

    // Example 4: Bulk personalized emails
    const bulkMessages = [
      {
        to: 'alice@example.com',
        subject: 'Hi Alice!',
        Variables: {
          name: 'Alice',
          discount: '20%',
        },
      },
      {
        to: 'bob@example.com',
        subject: 'Hi Bob!',
        Variables: {
          name: 'Bob',
          discount: '15%',
        },
      },
    ];

    const bulkHtml = '<p>Hi {{var:name}}! Your exclusive discount is {{var:discount}} off!</p>';

    for (const msg of bulkMessages) {
      await Parrot.send({
        ...msg,
        html: bulkHtml,
      }, {
        class: 'email',
        name: 'mailjetEmail',
      });
    }

    console.log('✓ Bulk personalized emails sent');

    // Example 5: Email with priority and campaign tracking
    const campaignResult = await Parrot.send({
      to: 'recipient@example.com',
      subject: 'Summer Sale - Limited Time!',
      html: '<h1>Summer Sale!</h1><p>Get 30% off everything!</p>',
      Priority: 2, // 0-3, where 3 is highest
      Campaign: 'summer_sale_2024',
      DeduplicateCampaign: true,
      TrackOpens: 'enabled',
      TrackClicks: 'enabled',
    }, {
      class: 'email',
      name: 'mailjetEmail',
    });

    console.log('✓ Campaign email sent:', campaignResult);

  } catch (error) {
    if (error.name === 'ValidationError') {
      console.error('❌ Validation error:', error.message);
    } else if (error.name === 'TransportError') {
      console.error('❌ Mailjet API error:', error.message);
      // Common issues: Invalid API credentials, sender not validated
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
Mailjet Email Configuration Tips:
---------------------------------
1. Sign up at https://mailjet.com
2. Get your API credentials from account settings
3. Validate your sender address/domain
4. Configure SPF/DKIM for better deliverability
5. Set up webhooks for real-time events

Environment variables needed:
- MAILJET_API_KEY (public key)
- MAILJET_SECRET_KEY (private key)

Features:
- Template language (similar to Handlebars)
- Real-time analytics
- Contact list management
- A/B testing
- Event API & webhooks
- SMTP relay option
- Segmentation
- Marketing & transactional

Template variables:
- {{var:name:"default"}} - Variable with default
- {{#if condition}} - Conditional blocks
- {{#each items}} - Loops

Best practices:
- Use Variables for personalization
- Set CustomID for tracking
- Use MonitoringCategory for analytics
- Enable open/click tracking for insights
  `);
}

// Run example
if (require.main === module) {
  sendWithMailjet()
    .then(() => {
      console.log('\n✓ Mailjet examples completed');
      showConfigurationTips();
    })
    .catch(console.error);
}