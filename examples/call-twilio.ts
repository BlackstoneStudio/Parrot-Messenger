import Parrot from '../src';

/**
 * Twilio Voice Call Example
 * Demonstrates making voice calls using Twilio API
 * with TwiML for call content
 */

async function makeVoiceCalls() {
  // Initialize Parrot with Twilio Call
  Parrot.init({
    transports: [
      {
        name: 'twilioCall',
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
    // Example 1: Simple text-to-speech call
    const result = await Parrot.send({
      to: '+1234567890',
      text: 'Hello! This is an automated call from Parrot Messenger. Have a great day!',
    }, {
      class: 'call',
      name: 'twilioCall',
    });

    console.log('✓ Voice call initiated:', result);

    // Example 2: Emergency notification call
    const emergencyResult = await Parrot.send({
      to: '+1234567890',
      text: 'Attention! This is an emergency notification. Server CPU usage has exceeded 90 percent. Please check immediately.',
      // Twilio will convert this to TwiML with <Say> tags
    }, {
      class: 'call',
      name: 'twilioCall',
    });

    console.log('✓ Emergency call initiated:', emergencyResult);

    // Example 3: Multi-language call
    const multiLangResult = await Parrot.send({
      to: '+1234567890',
      text: '<Say language="en-US">Hello!</Say><Say language="es-ES">¡Hola!</Say><Say language="fr-FR">Bonjour!</Say>',
      // Direct TwiML for multi-language support
    }, {
      class: 'call',
      name: 'twilioCall',
    });

    console.log('✓ Multi-language call initiated:', multiLangResult);

    // Example 4: Call with custom voice and speech rate
    const customVoiceResult = await Parrot.send({
      to: '+1234567890',
      text: 'This message uses a different voice and speaking rate.',
      voice: 'woman', // or 'man', 'alice', 'amazon.polly.Amy', etc.
      language: 'en-US',
    }, {
      class: 'call',
      name: 'twilioCall',
    });

    console.log('✓ Custom voice call initiated:', customVoiceResult);

    // Example 5: Appointment reminder call
    const appointment = {
      patientName: 'John Doe',
      doctorName: 'Dr. Smith',
      date: 'tomorrow at 2 PM',
    };

    const reminderResult = await Parrot.send({
      to: '+1234567890',
      text: `Hello ${appointment.patientName}. This is a reminder about your appointment with ${appointment.doctorName} ${appointment.date}. Press 1 to confirm or 2 to reschedule.`,
    }, {
      class: 'call',
      name: 'twilioCall',
    });

    console.log('✓ Appointment reminder call initiated:', reminderResult);

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

// Batch calling with rate limiting
async function makeBatchCalls() {
  console.log('\n--- Batch Voice Call Example ---');
  
  const recipients = [
    { phone: '+1234567890', name: 'Alice', code: '1234' },
    { phone: '+0987654321', name: 'Bob', code: '5678' },
    { phone: '+1112223333', name: 'Charlie', code: '9012' },
  ];

  // Rate limit to avoid overwhelming the system
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  for (const recipient of recipients) {
    try {
      const result = await Parrot.send({
        to: recipient.phone,
        text: `Hello ${recipient.name}. Your verification code is ${recipient.code}. Please repeat: ${recipient.code.split('').join(' ')}.`,
      }, {
        class: 'call',
        name: 'twilioCall',
      });

      console.log(`✓ Call to ${recipient.name} initiated: ${result.sid}`);
      
      // Wait 2 seconds between calls
      await delay(2000);
    } catch (error) {
      console.error(`✗ Failed to call ${recipient.name}:`, error.message);
    }
  }
}

// Advanced TwiML examples
function showAdvancedExamples() {
  console.log(`
Advanced TwiML Examples:
------------------------

1. Call with gather (input collection):
   <Response>
     <Say>Press 1 for sales, 2 for support</Say>
     <Gather numDigits="1" action="/handle-input">
       <Say>Please make your selection</Say>
     </Gather>
   </Response>

2. Call with pause and emphasis:
   <Response>
     <Say>
       Your code is <pause length="1"/>
       <emphasis level="strong">1 2 3 4</emphasis>
     </Say>
   </Response>

3. Call with background music:
   <Response>
     <Play>http://example.com/hold-music.mp3</Play>
     <Say>Thank you for holding</Say>
   </Response>

Note: Parrot Messenger currently converts text to basic TwiML.
For advanced features, use Twilio's API directly or extend
the Parrot transport.
  `);
}

// Configuration tips
function showConfigurationTips() {
  console.log(`
Twilio Voice Configuration Tips:
--------------------------------
1. Sign up at https://www.twilio.com
2. Buy a phone number with voice capabilities
3. Get your Account SID and Auth Token
4. Set up TwiML apps for advanced features
5. Configure status callbacks for tracking

Environment variables needed:
- TWILIO_ACCOUNT_SID
- TWILIO_AUTH_TOKEN
- TWILIO_PHONE_NUMBER

Voice features:
- Text-to-speech (TTS)
- Multiple languages and voices
- Call recording
- Call conferencing
- Interactive Voice Response (IVR)
- Call forwarding
- Voicemail
- Call analytics

Best practices:
- Keep messages concise and clear
- Use appropriate voice for context
- Add pauses for number readability
- Implement retry logic for failed calls
- Monitor call completion rates
- Comply with calling regulations (TCPA)

Pricing notes:
- Charged per minute
- Rates vary by country
- Inbound calls also charged
- Recording storage has additional costs
  `);
}

// Run example
if (require.main === module) {
  makeVoiceCalls()
    .then(() => makeBatchCalls())
    .then(() => {
      console.log('\n✓ Twilio Voice examples completed');
      showAdvancedExamples();
      showConfigurationTips();
    })
    .catch(console.error);
}