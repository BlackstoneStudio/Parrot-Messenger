import Parrot from '../src';

/**
 * AWS SES Email Example
 * Demonstrates sending emails using Amazon Simple Email Service
 */

async function sendWithSES() {
  // Initialize Parrot with AWS SES
  const parrot = new Parrot({
    transports: [
      {
        name: 'ses',
        settings: {
          auth: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
            region: process.env.AWS_REGION || 'us-east-1',
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
    await parrot.send({
      to: 'recipient@example.com',
      subject: 'Test Email from AWS SES',
      text: 'This is a test email sent via AWS SES.',
      html: '<h1>Test Email</h1><p>This is a test email sent via AWS SES.</p>',
    }, {
      class: 'email',
      name: 'ses',
    });

    console.log('✓ Email sent via SES');

    // Example 2: Email with attachment
    await parrot.send({
      to: 'recipient@example.com',
      subject: 'Email with Attachment',
      html: '<p>Please find the attached document.</p>',
      attachment: {
        filename: 'report.pdf',
        content: Buffer.from('PDF content here'),
        contentType: 'application/pdf',
      },
    }, {
      class: 'email',
      name: 'ses',
    });

    console.log('✓ Email with attachment sent');

    // Example 3: Bulk email to multiple recipients
    await parrot.send({
      to: ['user1@example.com', 'user2@example.com', 'user3@example.com'],
      subject: 'Bulk Email via SES',
      html: '<p>This email was sent to multiple recipients.</p>',
    }, {
      class: 'email',
      name: 'ses',
    });

    console.log('✓ Bulk email sent');

    // Example 4: Email with custom headers
    await parrot.send({
      to: 'recipient@example.com',
      subject: 'Email with Custom Headers',
      html: '<p>This email includes custom headers.</p>',
      headers: {
        'X-Custom-Header': 'CustomValue',
        'X-Campaign-ID': 'summer-2024',
      },
    }, {
      class: 'email',
      name: 'ses',
    });

    console.log('✓ Email with headers sent');

  } catch (error) {
    if (error.name === 'ValidationError') {
      console.error('❌ Validation error:', error.message);
      // Check email format or configuration
    } else if (error.name === 'TransportError') {
      console.error('❌ AWS SES error:', error.message);
      // Check AWS credentials, region, or SES sandbox restrictions
    } else {
      console.error('❌ Unexpected error:', error);
    }
  }
}

// Configuration tips
function showConfigurationTips() {
  console.log(`
AWS SES Configuration Tips:
---------------------------
1. Verify your domain or email address in AWS SES console
2. Request production access to send to any email address
3. Configure proper IAM permissions for SES:SendEmail
4. Set up SNS notifications for bounces and complaints
5. Monitor your sending reputation in AWS console

Environment variables needed:
- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- AWS_REGION (e.g., us-east-1)

IAM Policy example:
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ses:SendEmail",
        "ses:SendRawEmail"
      ],
      "Resource": "*"
    }
  ]
}
  `);
}

// Run example
if (require.main === module) {
  sendWithSES()
    .then(() => {
      console.log('\n✓ AWS SES examples completed');
      showConfigurationTips();
    })
    .catch(console.error);
}