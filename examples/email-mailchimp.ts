import Parrot from '../src';

/**
 * Mailchimp (Mandrill) Email Example
 * Demonstrates sending transactional emails using Mailchimp's Mandrill API
 */

async function sendWithMailchimp() {
  // Initialize Parrot with Mailchimp/Mandrill
  Parrot.init({
    transports: [
      {
        name: 'mailchimp',
        settings: {
          auth: {
            apiKey: process.env.MANDRILL_API_KEY || '',
          },
          defaults: {
            from: 'noreply@example.com',
          },
        },
      },
    ],
  });

  try {
    // Example 1: Simple transactional email
    const result = await Parrot.send({
      to: 'recipient@example.com',
      subject: 'Transaction Receipt',
      text: 'Thank you for your purchase!',
      html: '<h1>Thank you for your purchase!</h1><p>Your order has been confirmed.</p>',
    }, {
      class: 'email',
      name: 'mailchimp',
    });

    console.log('✓ Email sent via Mailchimp/Mandrill:', result);

    // Example 2: Email with merge variables
    const mergeResult = await Parrot.send({
      to: 'customer@example.com',
      subject: 'Welcome *|FNAME|*!',
      html: `
        <h1>Welcome *|FNAME|* *|LNAME|*!</h1>
        <p>Thank you for joining on *|SIGNUP_DATE|*.</p>
        <p>Your account type: *|ACCOUNT_TYPE|*</p>
      `,
      merge_vars: [
        {
          rcpt: 'customer@example.com',
          vars: [
            { name: 'FNAME', content: 'John' },
            { name: 'LNAME', content: 'Doe' },
            { name: 'SIGNUP_DATE', content: new Date().toLocaleDateString() },
            { name: 'ACCOUNT_TYPE', content: 'Premium' },
          ],
        },
      ],
    }, {
      class: 'email',
      name: 'mailchimp',
    });

    console.log('✓ Merge variables email sent:', mergeResult);

    // Example 3: Email with metadata and tags
    const taggedResult = await Parrot.send({
      to: 'recipient@example.com',
      subject: 'Tagged Transaction Email',
      html: '<p>This email includes tags and metadata for tracking.</p>',
      tags: ['transaction', 'receipt', 'purchase'],
      metadata: {
        order_id: '12345',
        customer_id: '67890',
        purchase_amount: '99.99',
      },
    }, {
      class: 'email',
      name: 'mailchimp',
    });

    console.log('✓ Tagged email sent:', taggedResult);

    // Example 4: Using a Mandrill template
    const templateResult = await Parrot.send({
      to: 'recipient@example.com',
      subject: 'Order Confirmation',
      template_name: 'order-confirmation',
      template_content: [
        { name: 'header', content: '<h1>Order Confirmed!</h1>' },
        { name: 'main', content: '<p>Your order #12345 has been confirmed.</p>' },
      ],
      global_merge_vars: [
        { name: 'ORDER_NUMBER', content: '12345' },
        { name: 'TOTAL', content: '$99.99' },
      ],
    }, {
      class: 'email',
      name: 'mailchimp',
    });

    console.log('✓ Template email sent:', templateResult);

    // Example 5: Important email with high priority
    const importantResult = await Parrot.send({
      to: 'recipient@example.com',
      subject: 'Important: Action Required',
      html: '<p>This is an important email that requires immediate attention.</p>',
      important: true,
      track_opens: true,
      track_clicks: true,
      auto_text: true,
      inline_css: true,
    }, {
      class: 'email',
      name: 'mailchimp',
    });

    console.log('✓ Important email sent:', importantResult);

  } catch (error) {
    if (error.name === 'ValidationError') {
      console.error('❌ Validation error:', error.message);
    } else if (error.name === 'TransportError') {
      console.error('❌ Mailchimp/Mandrill API error:', error.message);
      // Common issues: Invalid API key, sending domain not verified
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
Mailchimp/Mandrill Configuration Tips:
--------------------------------------
1. Get a Mandrill account (add-on to Mailchimp)
2. Generate an API key in Mandrill settings
3. Verify your sending domain
4. Set up SPF and DKIM records
5. Configure webhooks for event tracking

Environment variables needed:
- MANDRILL_API_KEY

Features:
- Transactional email
- Template management
- Merge variables
- Metadata tracking
- Tagging system
- Detailed analytics
- A/B testing
- Scheduled sending

Note: Mandrill is a paid add-on to Mailchimp focused on
transactional emails. For marketing emails, use Mailchimp's
marketing API directly.

Template syntax:
- Use *|MERGE_VAR|* for merge variables
- Supports Handlebars templates
- Can use stored templates or inline content
  `);
}

// Run example
if (require.main === module) {
  sendWithMailchimp()
    .then(() => {
      console.log('\n✓ Mailchimp/Mandrill examples completed');
      showConfigurationTips();
    })
    .catch(console.error);
}