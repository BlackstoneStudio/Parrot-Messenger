import Parrot from '../src';

/**
 * SendGrid Email Example
 * Demonstrates sending emails using SendGrid API
 */

async function sendWithSendGrid() {
  // Initialize Parrot with SendGrid
  Parrot.init({
    transports: [
      {
        name: 'sendgrid',
        settings: {
          auth: {
            apiKeyPublic: process.env.SENDGRID_API_KEY || '',
            apiKeyPrivate: process.env.SENDGRID_API_KEY || '', // SendGrid uses same key
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
      subject: 'Hello from SendGrid',
      text: 'This email was sent using SendGrid via Parrot Messenger.',
      html: '<h1>Hello from SendGrid</h1><p>This email was sent using SendGrid via Parrot Messenger.</p>',
    }, {
      class: 'email',
      name: 'sendgrid',
    });

    console.log('✓ Email sent via SendGrid:', result);

    // Example 2: Email with dynamic template
    const templateResult = await Parrot.send({
      to: 'recipient@example.com',
      subject: 'Dynamic Template Email',
      templateId: 'd-1234567890abcdef', // Your SendGrid template ID
      dynamicTemplateData: {
        firstName: 'John',
        orderNumber: '12345',
        orderTotal: '$99.99',
      },
    }, {
      class: 'email',
      name: 'sendgrid',
    });

    console.log('✓ Template email sent:', templateResult);

    // Example 3: Email with categories and custom args
    const categorizedResult = await Parrot.send({
      to: 'recipient@example.com',
      subject: 'Categorized Email',
      html: '<p>This email includes categories for analytics.</p>',
      categories: ['newsletter', 'weekly-update'],
      customArgs: {
        userId: '12345',
        campaign: 'summer-2024',
      },
    }, {
      class: 'email',
      name: 'sendgrid',
    });

    console.log('✓ Categorized email sent:', categorizedResult);

    // Example 4: Email with attachment and inline image
    const richResult = await Parrot.send({
      to: 'recipient@example.com',
      subject: 'Email with Rich Content',
      html: '<h1>Newsletter</h1><img src="cid:logo"><p>Check out our latest updates!</p>',
      attachment: [
        {
          filename: 'newsletter.pdf',
          content: Buffer.from('PDF content here'),
          type: 'application/pdf',
          disposition: 'attachment',
        },
        {
          filename: 'logo.png',
          content: Buffer.from('PNG image data'),
          type: 'image/png',
          disposition: 'inline',
          contentId: 'logo',
        },
      ],
    }, {
      class: 'email',
      name: 'sendgrid',
    });

    console.log('✓ Rich content email sent:', richResult);

    // Example 5: Personalized batch email
    const personalizations = [
      {
        to: 'alice@example.com',
        subject: 'Hi Alice!',
        substitutions: {
          '-name-': 'Alice',
          '-discount-': '20%',
        },
      },
      {
        to: 'bob@example.com',
        subject: 'Hi Bob!',
        substitutions: {
          '-name-': 'Bob',
          '-discount-': '15%',
        },
      },
    ];

    const batchResult = await Parrot.send({
      personalizations,
      from: 'sales@example.com',
      html: '<p>Hi -name-! Your exclusive discount is -discount- off!</p>',
    }, {
      class: 'email',
      name: 'sendgrid',
    });

    console.log('✓ Batch personalized email sent:', batchResult);

  } catch (error) {
    if (error.name === 'ValidationError') {
      console.error('❌ Validation error:', error.message);
    } else if (error.name === 'TransportError') {
      console.error('❌ SendGrid API error:', error.message);
      // Common issues: Invalid API key, rate limits, sender verification
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
SendGrid Configuration Tips:
----------------------------
1. Sign up at https://sendgrid.com
2. Create an API key with full access
3. Verify your sender identity (domain or single sender)
4. Set up domain authentication for better deliverability
5. Configure event webhooks for tracking

Environment variables needed:
- SENDGRID_API_KEY

Features:
- Dynamic templates
- Email validation
- Advanced analytics
- Inbound parse
- Event webhooks
- IP warming
- Dedicated IPs
- A/B testing

Best practices:
- Use dynamic templates for consistent branding
- Implement proper unsubscribe handling
- Monitor your sender reputation
- Use categories for analytics
- Implement event webhooks for real-time tracking
  `);
}

// Run example
if (require.main === module) {
  sendWithSendGrid()
    .then(() => {
      console.log('\n✓ SendGrid examples completed');
      showConfigurationTips();
    })
    .catch(console.error);
}