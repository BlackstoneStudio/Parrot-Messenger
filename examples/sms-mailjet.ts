import Parrot from '../src';

/**
 * Mailjet SMS Example
 * Demonstrates sending SMS messages using Mailjet SMS API
 */

async function sendWithMailjetSMS() {
  // Initialize Parrot with Mailjet SMS
  Parrot.init({
    transports: [
      {
        name: 'mailjetSMS',
        settings: {
          auth: {
            apiKey: process.env.MAILJET_SMS_TOKEN || '',
          },
          defaults: {
            from: process.env.MAILJET_SMS_SENDER || 'MJPilot', // Your approved sender name
          },
        },
      },
    ],
  });

  try {
    // Example 1: Simple SMS
    const result = await Parrot.send({
      to: '+33612345678', // International format required
      text: 'Bonjour! This is a test SMS from Mailjet via Parrot Messenger.',
    }, {
      class: 'sms',
      name: 'mailjetSMS',
    });

    console.log('✓ SMS sent via Mailjet:', result);

    // Example 2: SMS with custom sender (if approved)
    const customSenderResult = await Parrot.send({
      to: '+33612345678',
      from: 'MyBrand', // Must be pre-approved by Mailjet
      text: 'Custom sender SMS from MyBrand',
    }, {
      class: 'sms',
      name: 'mailjetSMS',
    });

    console.log('✓ Custom sender SMS sent:', customSenderResult);

    // Example 3: Marketing SMS with unsubscribe
    const marketingResult = await Parrot.send({
      to: '+33612345678',
      text: 'Special offer! Get 20% off today. Reply STOP to unsubscribe.',
      // Mailjet automatically handles STOP replies
    }, {
      class: 'sms',
      name: 'mailjetSMS',
    });

    console.log('✓ Marketing SMS sent:', marketingResult);

    // Example 4: Transactional SMS (OTP)
    const otpCode = Math.floor(100000 + Math.random() * 900000);
    const otpResult = await Parrot.send({
      to: '+33612345678',
      text: `Your verification code is: ${otpCode}. Valid for 10 minutes.`,
    }, {
      class: 'sms',
      name: 'mailjetSMS',
    });

    console.log('✓ OTP SMS sent:', otpResult);

    // Example 5: Unicode SMS (with special characters)
    const unicodeResult = await Parrot.send({
      to: '+33612345678',
      text: 'Hello! 👋 Special chars: €£¥ émojis 😊🎉 work perfectly!',
    }, {
      class: 'sms',
      name: 'mailjetSMS',
    });

    console.log('✓ Unicode SMS sent:', unicodeResult);

  } catch (error) {
    if (error.name === 'ValidationError') {
      console.error('❌ Validation error:', error.message);
      // Phone numbers must be in international format
    } else if (error.name === 'TransportError') {
      console.error('❌ Mailjet SMS error:', error.message);
      // Common issues: Invalid token, sender not approved, insufficient credits
    } else if (error.name === 'ConfigurationError') {
      console.error('❌ Configuration error:', error.message);
    } else {
      console.error('❌ Unexpected error:', error);
    }
  }
}

// Bulk SMS campaign example
async function sendBulkCampaign() {
  console.log('\n--- Bulk SMS Campaign Example ---');
  
  // French phone numbers for example (Mailjet SMS is popular in France)
  const recipients = [
    '+33612345678',
    '+33687654321',
    '+33611223344',
  ];

  const campaignText = 'Flash Sale! 30% off everything today only. Visit example.com';

  const results = await Promise.allSettled(
    recipients.map(async (phone) => {
      try {
        const result = await Parrot.send({
          to: phone,
          text: campaignText,
        }, {
          class: 'sms',
          name: 'mailjetSMS',
        });
        return { success: true, phone, messageId: result.id };
      } catch (error) {
        return { success: false, phone, error: error.message };
      }
    })
  );

  const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
  console.log(`Campaign sent: ${successful}/${recipients.length} messages delivered`);
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value.success) {
      console.log(`✓ Sent to ${result.value.phone}`);
    } else {
      const error = result.status === 'rejected' ? result.reason : result.value.error;
      console.log(`✗ Failed: ${recipients[index]} - ${error}`);
    }
  });
}

// Configuration tips
function showConfigurationTips() {
  console.log(`
Mailjet SMS Configuration Tips:
-------------------------------
1. Sign up at https://www.mailjet.com
2. Access SMS features in your dashboard
3. Get your SMS API token
4. Request sender name approval
5. Add SMS credits to your account

Environment variables needed:
- MAILJET_SMS_TOKEN
- MAILJET_SMS_SENDER (approved sender name)

Features:
- Global SMS delivery
- Custom sender names
- Unicode support
- Delivery tracking
- STOP management
- Real-time analytics
- Competitive pricing

Sender name requirements:
- 3-11 alphanumeric characters
- Must be pre-approved
- Different names for different use cases
- Default: 'MJPilot' for testing

Best practices:
- Use international format (+33612345678)
- Keep messages concise
- Include opt-out for marketing
- Monitor delivery rates
- Handle character encoding properly

Coverage:
- Strong in Europe (especially France)
- Global reach to 200+ countries
- Check country-specific regulations
- Some countries require sender pre-registration
  `);
}

// Run example
if (require.main === module) {
  sendWithMailjetSMS()
    .then(() => sendBulkCampaign())
    .then(() => {
      console.log('\n✓ Mailjet SMS examples completed');
      showConfigurationTips();
    })
    .catch(console.error);
}