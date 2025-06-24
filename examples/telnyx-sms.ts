import Parrot from '../src';

/**
 * Telnyx SMS Example
 * This example demonstrates how to send SMS messages using Telnyx
 * New transport added in v1.1.0
 */

async function sendTelnyxSMS() {
  try {
    // Initialize Parrot with Telnyx transport
    Parrot.init({
      transports: [
        {
          name: 'telnyxSMS',
          settings: {
            auth: {
              apiKey: process.env.TELNYX_API_KEY || 'YOUR_TELNYX_API_KEY',
            },
            defaults: {
              from: process.env.TELNYX_PHONE_NUMBER || '+15555555555', // Your Telnyx phone number
            },
          },
        },
      ],
    });

    // Send a simple SMS
    const result = await Parrot.send({
      to: '+1234567890', // Replace with actual recipient
      text: 'Hello from Parrot Messenger with Telnyx!',
    }, {
      class: 'sms',
      name: 'telnyxSMS',
    });

    console.log('Telnyx SMS sent successfully:', result);

    // Send SMS with longer message (automatic segmentation)
    const longMessage = await Parrot.send({
      to: '+1234567890',
      text: 'This is a longer message that might be split into multiple SMS segments. ' +
            'Telnyx handles message segmentation automatically, ensuring your entire ' +
            'message is delivered properly even if it exceeds the 160 character limit.',
    }, {
      class: 'sms',
      name: 'telnyxSMS',
    });

    console.log('Long message sent:', longMessage);

  } catch (error) {
    // Enhanced error handling
    if (error.name === 'ValidationError') {
      console.error('Validation failed:', error.message);
      // Phone number validation is performed automatically
    } else if (error.name === 'TransportError') {
      console.error('Telnyx API error:', error.message);
      // Check API key, phone number ownership, or account balance
    } else if (error.name === 'ConfigurationError') {
      console.error('Configuration issue:', error.message);
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

// Batch SMS example
async function sendBatchSMS() {
  try {
    const recipients = [
      '+1234567890',
      '+0987654321',
      '+1112223333',
    ];

    // Send to multiple recipients
    const promises = recipients.map(to => 
      Parrot.send({
        to,
        text: 'Batch notification: System maintenance tonight at 10 PM EST',
      }, {
        class: 'sms',
        name: 'telnyxSMS',
      })
    );

    const results = await Promise.allSettled(promises);
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        console.log(`SMS sent to ${recipients[index]}: ${result.value.id}`);
      } else {
        console.error(`Failed to send to ${recipients[index]}: ${result.reason.message}`);
      }
    });

  } catch (error) {
    console.error('Batch SMS error:', error);
  }
}

// Run examples
(async () => {
  await sendTelnyxSMS();
  // Uncomment to run batch example
  // await sendBatchSMS();
})();