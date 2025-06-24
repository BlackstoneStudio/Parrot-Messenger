import Parrot from '../src';

/**
 * Basic Usage Example
 * This example demonstrates the fundamental usage of Parrot Messenger
 */

async function basicUsage() {
  // Step 1: Initialize Parrot with transport configurations
  Parrot.init({
    transports: [
      {
        name: 'ses',
        settings: {
          auth: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'your-access-key',
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'your-secret-key',
            region: process.env.AWS_REGION || 'us-east-1',
          },
          defaults: {
            from: 'noreply@example.com',
          },
        },
      },
    ],
  });

  // Step 2: Send a simple email
  try {
    const result = await Parrot.send({
      to: 'recipient@example.com',
      subject: 'Hello from Parrot!',
      text: 'This is a plain text email.',
      html: '<h1>Hello from Parrot!</h1><p>This is an HTML email.</p>',
    }, {
      class: 'email',
      name: 'ses',
    });

    console.log('Email sent successfully:', result);
  } catch (error) {
    console.error('Failed to send email:', error);
  }

  // Step 3: Using templates
  Parrot.templates.register({
    name: 'welcome',
    html: '<h1>Welcome {{name}}!</h1><p>We are glad to have you.</p>',
    text: 'Welcome {{name}}! We are glad to have you.',
  });

  try {
    await Parrot.templates.send(
      'welcome',
      {
        to: 'newuser@example.com',
        subject: 'Welcome to our service!',
      },
      { name: 'John Doe' },
      { class: 'email', name: 'ses' }
    );
    console.log('Welcome email sent!');
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }
}

// Multiple transports example
async function multipleTransports() {
  // Initialize with multiple transports for fallback
  Parrot.init({
    transports: [
      {
        name: 'ses',
        settings: {
          auth: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
            region: 'us-east-1',
          },
          defaults: {
            from: 'noreply@example.com',
          },
        },
      },
      {
        name: 'twilioSMS',
        settings: {
          auth: {
            sid: process.env.TWILIO_SID || '',
            token: process.env.TWILIO_TOKEN || '',
          },
          defaults: {
            from: process.env.TWILIO_PHONE || '+15555555555',
          },
        },
      },
    ],
  });

  // Send an email
  await Parrot.send({
    to: 'user@example.com',
    subject: 'Multi-transport example',
    text: 'This email was sent using Parrot Messenger',
  }, {
    class: 'email',
  }); // Will use first available email transport (ses)

  // Send an SMS
  await Parrot.send({
    to: '+1234567890',
    text: 'Your verification code is: 123456',
  }, {
    class: 'sms',
  }); // Will use first available SMS transport (twilioSMS)
}

// Run examples
if (require.main === module) {
  basicUsage()
    .then(() => console.log('Basic usage example completed'))
    .catch(console.error);
}