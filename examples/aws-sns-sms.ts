import Parrot from '../src';

/**
 * AWS SNS SMS Example
 * This example demonstrates how to send SMS messages using AWS SNS
 * with proper error handling and the new v1.1.0 features
 */

async function sendSMSExample() {
  try {
    // Initialize Parrot with AWS SNS transport
    Parrot.init({
      transports: [
        {
          name: 'sns',
          settings: {
            auth: {
              accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
              secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
              region: process.env.AWS_REGION || 'us-east-1',
            },
            // New in v1.1.0: SMS type configuration
            smsType: 'Transactional', // or 'Promotional'
            defaults: {
              from: 'ParrotSMS', // SMS Sender ID (not supported in all regions)
            },
          },
        },
      ],
    });

    // Send a simple SMS
    const result = await Parrot.send({
      to: '+1234567890', // Replace with actual phone number
      text: 'Hello from Parrot Messenger v1.1.0!',
    }, {
      class: 'sms',
      name: 'sns',
    });

    console.log('SMS sent successfully:', result);

    // Send SMS with custom attributes
    const resultWithAttributes = await Parrot.send({
      to: '+1234567890',
      text: 'Your verification code is: 123456',
      // AWS SNS specific attributes can be passed through
      attributes: {
        'AWS.SNS.SMS.SenderID': 'VERIFY',
        'AWS.SNS.SMS.MaxPrice': '0.05',
      },
    }, {
      class: 'sms',
      name: 'sns',
    });

    console.log('SMS with attributes sent:', resultWithAttributes);

  } catch (error) {
    // Enhanced error handling with custom error types (v1.1.0)
    if (error.name === 'ValidationError') {
      console.error('Invalid phone number format:', error.message);
    } else if (error.name === 'TransportError') {
      console.error('AWS SNS error:', error.message);
    } else if (error.name === 'ConfigurationError') {
      console.error('Configuration error:', error.message);
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

// Run the example
sendSMSExample();