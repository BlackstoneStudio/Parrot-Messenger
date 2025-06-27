import Parrot from '../src';

/**
 * Multi-Transport Example
 * Demonstrates how to configure multiple transports and implement
 * fallback strategies for high availability messaging
 */

async function setupMultipleTransports() {
  const parrot = new Parrot({
    transports: [
      // Primary email transport
      {
        name: 'ses',
        settings: {
          auth: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
            region: 'us-east-1',
          },
          defaults: {
            from: 'notifications@example.com',
          },
        },
      },
      // Fallback email transport
      {
        name: 'mailgun',
        settings: {
          auth: {
            domain: process.env.MAILGUN_DOMAIN || 'example.com',
            apiKey: process.env.MAILGUN_API_KEY || '',
          },
          defaults: {
            from: 'notifications@example.com',
          },
        },
      },
      // Additional fallback
      {
        name: 'smtp',
        settings: {
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: process.env.SMTP_PORT || '587',
          secure: false,
          auth: {
            user: process.env.SMTP_USER || '',
            pass: process.env.SMTP_PASS || '',
          },
          defaults: {
            from: 'notifications@example.com',
          },
        },
      },
      // SMS transports
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
      {
        name: 'sns',
        settings: {
          auth: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
            region: 'us-east-1',
          },
          smsType: 'Transactional',
        },
      },
      // Call transport
      {
        name: 'twilioCall',
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
      // Chat transports
      {
        name: 'slack',
        settings: {
          auth: {
            token: process.env.SLACK_BOT_TOKEN || '',
          },
          defaultChannel: '#notifications',
          defaults: {},
        },
      },
      {
        name: 'telegram',
        settings: {
          auth: {
            botToken: process.env.TELEGRAM_BOT_TOKEN || '',
          },
          defaultChatId: process.env.TELEGRAM_CHAT_ID || '',
          defaults: {},
        },
      },
    ],
  });

  return parrot;
}

// Example 1: Automatic Fallback for Email
async function emailWithFallback(parrot: Parrot) {
  console.log('\n--- Example 1: Email with Automatic Fallback ---');
  
  const envelope = {
    to: 'user@example.com',
    subject: 'Important Notification',
    html: '<h1>Your Account Update</h1><p>This is an important message.</p>',
    text: 'Your Account Update\n\nThis is an important message.',
  };

  // When no specific transport is specified, Parrot will use the first available
  try {
    await parrot.send(envelope, { class: 'email' });
    console.log('✓ Email sent successfully using default transport');
  } catch (error: any) {
    console.error('✗ All email transports failed:', error.message);
  }
}

// Example 2: Manual Fallback Strategy
async function manualFallbackStrategy(parrot: Parrot) {
  console.log('\n--- Example 2: Manual Fallback Strategy ---');
  
  const envelope = {
    to: 'user@example.com',
    subject: 'Order Confirmation',
    html: '<p>Your order #12345 has been confirmed!</p>',
  };

  const emailTransports = ['ses', 'mailgun', 'smtp'];
  let sent = false;
  let errors: any[] = [];

  for (const transport of emailTransports) {
    try {
      console.log(`  Attempting to send via ${transport}...`);
      
      await parrot.send(envelope, {
        class: 'email',
        name: transport,
      });
      
      console.log(`✓ Successfully sent via ${transport}`);
      sent = true;
      break;
    } catch (error: any) {
      console.log(`  ✗ ${transport} failed: ${error.message}`);
      errors.push({ transport, error: error.message });
    }
  }

  if (!sent) {
    console.error('✗ Failed to send email via any transport:', errors);
  }
}

// Example 3: Multi-Channel Notifications
async function multiChannelNotification(parrot: Parrot) {
  console.log('\n--- Example 3: Multi-Channel Notification ---');
  
  const criticalAlert = {
    email: 'admin@example.com',
    phone: '+1234567890',
    message: 'CRITICAL: Server CPU usage above 90%',
  };

  const results: any = {
    email: null,
    sms: null,
    call: null,
  };

  // Send email notification
  try {
    results.email = await parrot.send({
      to: criticalAlert.email,
      subject: 'Critical Server Alert',
      html: `<h1 style="color: red;">Critical Alert</h1><p>${criticalAlert.message}</p>`,
      text: criticalAlert.message,
    }, { class: 'email' });
    console.log('✓ Email notification sent');
  } catch (error: any) {
    console.error('✗ Email failed:', error.message);
  }

  // Send SMS notification
  try {
    results.sms = await parrot.send({
      to: criticalAlert.phone,
      text: criticalAlert.message,
    }, { class: 'sms' });
    console.log('✓ SMS notification sent');
  } catch (error: any) {
    console.error('✗ SMS failed:', error.message);
  }

  // For critical alerts, also make a call
  try {
    results.call = await parrot.send({
      to: criticalAlert.phone,
      text: criticalAlert.message,
    }, { class: 'call' });
    console.log('✓ Voice call initiated');
  } catch (error: any) {
    console.error('✗ Call failed:', error.message);
  }

  return results;
}

// Example 4: Multi-Channel Chat Notifications
async function multiChannelChatNotification(parrot: Parrot) {
  console.log('\n--- Example 4: Multi-Channel Chat Notifications ---');
  
  const announcement = {
    title: '🚀 New Feature Release',
    message: 'We just released a new feature: Dark Mode!',
    details: 'Enable it in Settings > Appearance > Theme',
  };

  const results: any = {};

  // Send to Slack
  try {
    await parrot.send({
      to: '#announcements',
      subject: announcement.title,
      html: `<b>${announcement.message}</b><br><br>${announcement.details}`,
    }, { name: 'slack' });
    console.log('✓ Slack notification sent');
    results.slack = true;
  } catch (error: any) {
    console.error('✗ Slack failed:', error.message);
    results.slack = false;
  }

  // Send to Telegram
  try {
    await parrot.send({
      to: '@yourchannel',
      subject: announcement.title,
      html: `<b>${announcement.message}</b>\n\n${announcement.details}`,
    }, { name: 'telegram' });
    console.log('✓ Telegram notification sent');
    results.telegram = true;
  } catch (error: any) {
    console.error('✗ Telegram failed:', error.message);
    results.telegram = false;
  }

  // Fallback to email if both chat services fail
  if (!results.slack && !results.telegram) {
    try {
      await parrot.send({
        to: 'team@example.com',
        subject: announcement.title,
        html: `<h2>${announcement.message}</h2><p>${announcement.details}</p>`,
      }, { class: 'email' });
      console.log('✓ Fallback email sent');
      results.email = true;
    } catch (error: any) {
      console.error('✗ Email fallback failed:', error.message);
      results.email = false;
    }
  }

  return results;
}

// Example 5: Load Balancing Across Transports
async function loadBalancingExample(parrot: Parrot) {
  console.log('\n--- Example 5: Load Balancing Across Transports ---');
  
  const transports = ['ses', 'mailgun'];
  let currentIndex = 0;
  
  // Simple round-robin load balancer
  function getNextTransport() {
    const transport = transports[currentIndex];
    currentIndex = (currentIndex + 1) % transports.length;
    return transport;
  }

  // Send multiple emails distributed across transports
  const recipients = [
    'user1@example.com',
    'user2@example.com',
    'user3@example.com',
    'user4@example.com',
  ];

  const sendPromises = recipients.map(async (recipient, index) => {
    const transport = getNextTransport();
    
    try {
      await parrot.send({
        to: recipient,
        subject: 'Newsletter',
        html: '<p>This week\'s newsletter content...</p>',
      }, {
        class: 'email',
        name: transport,
      });
      
      console.log(`✓ Email ${index + 1} sent to ${recipient} via ${transport}`);
      return { success: true, recipient, transport };
    } catch (error) {
      console.error(`✗ Failed to send to ${recipient}:`, error.message);
      return { success: false, recipient, error: error.message };
    }
  });

  const results = await Promise.all(sendPromises);
  
  const successful = results.filter(r => r.success).length;
  console.log(`\nLoad balancing complete: ${successful}/${recipients.length} emails sent`);
}

// Example 6: Priority-based Transport Selection
async function priorityBasedSelection(parrot: Parrot) {
  console.log('\n--- Example 6: Priority-based Transport Selection ---');
  
  // Define transport priorities based on cost/reliability
  const transportPriority = {
    email: [
      { name: 'ses', cost: 0.0001, reliability: 0.99 },
      { name: 'mailgun', cost: 0.0008, reliability: 0.98 },
      { name: 'smtp', cost: 0, reliability: 0.95 },
    ],
    sms: [
      { name: 'sns', cost: 0.0075, reliability: 0.99 },
      { name: 'twilioSMS', cost: 0.0085, reliability: 0.98 },
    ],
  };

  async function sendWithPriority(envelope: any, messageClass: string, preferLowCost = true) {
    const transports = transportPriority[messageClass];
    
    // Sort by priority (cost or reliability)
    const sorted = [...transports].sort((a, b) => {
      if (preferLowCost) {
        return a.cost - b.cost;
      }
      return b.reliability - a.reliability;
    });

    for (const transport of sorted) {
      try {
        console.log(`  Trying ${transport.name} (cost: $${transport.cost}, reliability: ${transport.reliability})`);
        
        await parrot.send(envelope, {
          class: messageClass,
          name: transport.name,
        });
        
        console.log(`✓ Sent via ${transport.name}`);
        return { success: true, transport: transport.name, cost: transport.cost };
      } catch (error: any) {
        console.log(`  ✗ ${transport.name} failed: ${error.message}`);
      }
    }
    
    throw new Error(`All ${messageClass} transports failed`);
  }

  // Send cost-optimized email
  try {
    await sendWithPriority({
      to: 'budget@example.com',
      subject: 'Cost-optimized delivery',
      text: 'This email was sent via the most cost-effective transport',
    }, 'email', true);
  } catch (error: any) {
    console.error('✗ Cost-optimized sending failed:', error.message);
  }

  // Send reliability-optimized SMS
  try {
    await sendWithPriority({
      to: '+1234567890',
      text: 'This SMS was sent via the most reliable transport',
    }, 'sms', false);
  } catch (error: any) {
    console.error('✗ Reliability-optimized sending failed:', error.message);
  }
}

// Run all examples
async function runExamples() {
  const parrot = await setupMultipleTransports();
  
  await emailWithFallback(parrot);
  await manualFallbackStrategy(parrot);
  await multiChannelNotification(parrot);
  await multiChannelChatNotification(parrot);
  await loadBalancingExample(parrot);
  await priorityBasedSelection(parrot);
}

runExamples()
  .then(() => console.log('\n✓ All multi-transport examples completed'))
  .catch((error: any) => console.error('\n✗ Unexpected error:', error));