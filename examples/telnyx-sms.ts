import { Parrot } from '../src';

/**
 * Telnyx SMS & MMS Example
 * Demonstrates sending SMS and MMS messages using Telnyx via Parrot Messenger
 */

async function sendWithTelnyx() {
  // Initialize Parrot with Telnyx transport
  const parrot = new Parrot({
    transports: [
      {
        name: 'telnyxSMS',
        settings: {
          auth: {
            apiKey: process.env.TELNYX_API_KEY || '',
          },
          defaults: {
            from: process.env.TELNYX_FROM_NUMBER || '+15555555555',
          },
        },
      },
    ],
  });

  try {
    // Example 1: Simple SMS
    await parrot.send(
      {
        to: '+1234567890',
        text: 'Hello from Parrot Messenger with Telnyx!',
      },
      {
        class: 'sms',
        name: 'telnyxSMS',
      },
    );

    console.log('SMS sent via Telnyx');

    // Example 2: SMS from HTML content (auto-converted to plain text)
    await parrot.send(
      {
        to: '+1234567890',
        html: '<p>Your order <strong>#12345</strong> has shipped!</p>',
      },
      {
        class: 'sms',
        name: 'telnyxSMS',
      },
    );

    console.log('HTML-to-text SMS sent via Telnyx');

    // Example 3: MMS with media attachment
    await parrot.send(
      {
        to: '+1234567890',
        text: 'Check out this image!',
        subject: 'Photo from Parrot',
        mediaUrls: ['https://example.com/image.jpg'],
      },
      {
        class: 'sms',
        name: 'telnyxSMS',
      },
    );

    console.log('MMS sent via Telnyx');

    // Example 4: MMS with multiple media
    await parrot.send(
      {
        to: '+1234567890',
        text: 'Here are your photos',
        mediaUrls: ['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg'],
      },
      {
        class: 'sms',
        name: 'telnyxSMS',
      },
    );

    console.log('Multi-media MMS sent via Telnyx');
  } catch (error) {
    if (error.name === 'ValidationError') {
      console.error('Validation error:', error.message);
    } else if (error.name === 'TransportError') {
      console.error('Telnyx API error:', error.message);
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
Telnyx Configuration Tips:
--------------------------
1. Sign up at https://telnyx.com
2. Create an API key in Mission Control
3. Purchase a phone number with SMS/MMS capability
4. Associate the number with a messaging profile

Environment variables needed:
- TELNYX_API_KEY
- TELNYX_FROM_NUMBER

Features:
- SMS and MMS support
- Automatic message segmentation
- Delivery webhooks
- Number pooling
- Alphanumeric sender IDs
  `);
}

// Run example
if (require.main === module) {
  sendWithTelnyx()
    .then(() => {
      console.log('\nTelnyx examples completed');
      showConfigurationTips();
    })
    .catch(console.error);
}
