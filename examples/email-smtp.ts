import Parrot from '../src';

/**
 * SMTP Email Example
 * Demonstrates sending emails using standard SMTP protocol
 */

async function sendWithSMTP() {
  // Initialize Parrot with SMTP
  const parrot = new Parrot({
    transports: [
      {
        name: 'smtp',
        settings: {
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: process.env.SMTP_PORT || '587',
          secure: false, // true for 465, false for other ports
          auth: {
            user: process.env.SMTP_USER || '',
            pass: process.env.SMTP_PASS || '',
          },
          defaults: {
            from: 'Parrot Mailer <noreply@example.com>',
          },
        },
      },
    ],
  });

  try {
    // Example 1: Simple email
    await parrot.send({
      to: 'recipient@example.com',
      subject: 'SMTP Test Email',
      text: 'This email was sent using SMTP via Parrot Messenger.',
      html: '<h1>SMTP Test</h1><p>This email was sent using SMTP via Parrot Messenger.</p>',
    }, {
      class: 'email',
      name: 'smtp',
    });

    console.log('✓ Email sent via SMTP:');

    // Example 2: Email with attachment
    await parrot.send({
      to: 'recipient@example.com',
      subject: 'SMTP Email with Attachment',
      html: '<p>Please find the report attached.</p>',
      attachment: {
        filename: 'report.txt',
        content: Buffer.from('Monthly report data...'),
        contentType: 'text/plain',
      },
    }, {
      class: 'email',
      name: 'smtp',
    });

    console.log('✓ Email with attachment sent:');

    // Example 3: Email with multiple recipients and CC/BCC
    await parrot.send({
      to: ['user1@example.com', 'user2@example.com'],
      cc: 'manager@example.com',
      bcc: 'archive@example.com',
      subject: 'Team Update',
      html: '<h2>Team Update</h2><p>This email is sent to multiple recipients.</p>',
    }, {
      class: 'email',
      name: 'smtp',
    });

    console.log('✓ Multi-recipient email sent:');

    // Example 4: Email with custom headers
    await parrot.send({
      to: 'recipient@example.com',
      subject: 'Email with Custom Headers',
      html: '<p>This email includes custom headers.</p>',
      headers: {
        'X-Priority': '1',
        'X-Campaign-ID': 'smtp-test-2024',
        'List-Unsubscribe': '<mailto:unsubscribe@example.com>',
      },
    }, {
      class: 'email',
      name: 'smtp',
    });

    console.log('✓ Email with custom headers sent:');

  } catch (error) {
    if (error.name === 'ValidationError') {
      console.error('❌ Validation error:', error.message);
    } else if (error.name === 'TransportError') {
      console.error('❌ SMTP error:', error.message);
      // Common issues: Authentication failed, connection timeout, invalid host/port
    } else if (error.name === 'ConfigurationError') {
      console.error('❌ Configuration error:', error.message);
    } else {
      console.error('❌ Unexpected error:', error);
    }
  }
}

// Different SMTP configurations
function showSMTPConfigurations() {
  console.log(`
Common SMTP Configurations:
---------------------------

Gmail:
  host: 'smtp.gmail.com'
  port: 587 (or 465 for SSL)
  secure: false (true for port 465)
  auth: { user: 'your-email@gmail.com', pass: 'app-specific-password' }
  Note: Requires app-specific password, not regular password

Outlook/Office365:
  host: 'smtp-mail.outlook.com'
  port: 587
  secure: false
  auth: { user: 'your-email@outlook.com', pass: 'your-password' }

Yahoo:
  host: 'smtp.mail.yahoo.com'
  port: 587 (or 465)
  secure: false (true for port 465)
  auth: { user: 'your-email@yahoo.com', pass: 'app-password' }

Amazon SES SMTP:
  host: 'email-smtp.region.amazonaws.com'
  port: 587
  secure: false
  auth: { user: 'SMTP-username', pass: 'SMTP-password' }

Custom/Corporate:
  host: 'mail.your-domain.com'
  port: 587 (or 25, 465, 2525)
  secure: depends on server
  auth: { user: 'username', pass: 'password' }

Environment variables needed:
- SMTP_HOST
- SMTP_PORT
- SMTP_USER
- SMTP_PASS

Security notes:
- Use app-specific passwords when available
- Enable 2FA on your email account
- Use secure connections (TLS/SSL) when possible
- Don't commit credentials to version control
- Consider using OAuth2 for supported providers
  `);
}

// Run example
if (require.main === module) {
  sendWithSMTP()
    .then(() => {
      console.log('\n✓ SMTP examples completed');
      showSMTPConfigurations();
    })
    .catch(console.error);
}