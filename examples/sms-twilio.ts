import Parrot from '../src';

/**
 * Twilio SMS Example
 * Demonstrates sending SMS messages using Twilio API
 */

async function sendWithTwilioSMS() {
  // Initialize Parrot with Twilio SMS
  const parrot = new Parrot({
    transports: [
      {
        name: 'twilioSMS',
        settings: {
          auth: {
            sid: process.env.TWILIO_ACCOUNT_SID || '',
            token: process.env.TWILIO_AUTH_TOKEN || '',
          },
          defaults: {
            from: process.env.TWILIO_PHONE_NUMBER || '+15555555555',
          },
        },
      },
    ],
  });

  try {
    // Example 1: Simple SMS
    await parrot.send({
      to: '+1234567890', // E.164 format required
      text: 'Hello from Twilio! This is a test message from Parrot Messenger.',
    }, {
      class: 'sms',
      name: 'twilioSMS',
    });

    console.log('✓ SMS sent via Twilio');

    // Example 2: SMS with media (MMS)
    await parrot.send({
      to: '+1234567890',
      text: 'Check out this image!',
      mediaUrl: ['https://example.com/image.jpg'],
    }, {
      class: 'sms',
      name: 'twilioSMS',
    });

    console.log('✓ MMS sent');

    // Example 3: SMS with status callback
    await parrot.send({
      to: '+1234567890',
      text: 'This message has delivery tracking enabled.',
      statusCallback: 'https://your-webhook.com/sms-status',
    }, {
      class: 'sms',
      name: 'twilioSMS',
    });

    console.log('✓ SMS with callback sent:');

    // Example 4: Long message (auto-segmentation)
    const longMessage = await parrot.send({
      to: '+1234567890',
      text: 'This is a longer message that exceeds the 160 character limit for a single SMS. ' +
            'Twilio will automatically segment this message into multiple parts and reassemble ' +
            'them on the recipient\'s device. Each segment is charged as a separate message. ' +
            'Unicode characters and emojis may reduce the character limit per segment.',
    }, {
      class: 'sms',
      name: 'twilioSMS',
    });

    console.log('✓ Long message sent (segments:', longMessage.numSegments || 'unknown', ')');

    // Example 5: Alphanumeric sender ID (where supported)
    await parrot.send({
      to: '+447700900000', // UK number (supports alphanumeric sender)
      from: 'COMPANY', // Alphanumeric sender ID (max 11 chars)
      text: 'Message from COMPANY with custom sender ID',
    }, {
      class: 'sms',
      name: 'twilioSMS',
    });

    console.log('✓ SMS with alphanumeric sender sent:');

    // Example 6: Scheduled SMS (using Twilio Message Scheduling)
    await parrot.send({
      to: '+1234567890',
      text: 'This is a scheduled message',
      sendAt: new Date(Date.now() + 3600000), // 1 hour from now
      scheduleType: 'fixed',
    }, {
      class: 'sms',
      name: 'twilioSMS',
    });

    console.log('✓ Scheduled SMS queued:');

  } catch (error) {
    if (error.name === 'ValidationError') {
      console.error('❌ Validation error:', error.message);
      // Phone numbers must be in E.164 format
    } else if (error.name === 'TransportError') {
      console.error('❌ Twilio error:', error.message);
      // Common issues: Invalid credentials, unverified number, insufficient balance
    } else if (error.name === 'ConfigurationError') {
      console.error('❌ Configuration error:', error.message);
    } else {
      console.error('❌ Unexpected error:', error);
    }
  }
}

// Batch SMS with error handling
async function sendBatchSMS() {
  console.log('\n--- Batch SMS Example ---');
  
  const recipients = [
    { phone: '+1234567890', name: 'Alice' },
    { phone: '+0987654321', name: 'Bob' },
    { phone: '+1112223333', name: 'Charlie' },
  ];

  const results = await Promise.allSettled(
    recipients.map(async (recipient) => {
      try {
        await parrot.send({
          to: recipient.phone,
          text: `Hi ${recipient.name}! This is a personalized message just for you.`,
        }, {
          class: 'sms',
          name: 'twilioSMS',
        });
        return { success: true, recipient: recipient.name, messageId: result.sid };
      } catch (error) {
        return { success: false, recipient: recipient.name, error: error.message };
      }
    })
  );

  results.forEach((result) => {
    if (result.status === 'fulfilled' && result.value.success) {
      console.log(`✓ SMS to ${result.value.recipient}: ${result.value.messageId}`);
    } else {
      const error = result.status === 'rejected' ? result.reason : result.value.error;
      console.log(`✗ Failed to send to ${result.value?.recipient}: ${error}`);
    }
  });
}

// Configuration tips
function showConfigurationTips() {
  console.log(`
Twilio SMS Configuration Tips:
------------------------------
1. Sign up at https://www.twilio.com
2. Get a phone number from Twilio Console
3. Find your Account SID and Auth Token
4. Verify recipient numbers in trial mode
5. Add balance for production use

Environment variables needed:
- TWILIO_ACCOUNT_SID
- TWILIO_AUTH_TOKEN
- TWILIO_PHONE_NUMBER

Features:
- SMS and MMS support
- Alphanumeric sender IDs
- Delivery receipts
- Message scheduling
- Two-way messaging
- WhatsApp integration
- Programmable messaging

Best practices:
- Always use E.164 format (+1234567890)
- Handle rate limits (1 msg/sec per number)
- Implement opt-out compliance
- Monitor delivery status via webhooks
- Use messaging services for high volume

Pricing notes:
- Charged per segment (160 chars for GSM-7)
- Unicode reduces to 70 chars per segment
- MMS is more expensive than SMS
- International rates vary significantly
  `);
}

// Run example
if (require.main === module) {
  sendWithTwilioSMS()
    .then(() => sendBatchSMS())
    .then(() => {
      console.log('\n✓ Twilio SMS examples completed');
      showConfigurationTips();
    })
    .catch(console.error);
}