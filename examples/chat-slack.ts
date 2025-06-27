import { Parrot } from '../src';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Slack Integration Examples
 * 
 * Prerequisites:
 * 1. Create a Slack app at https://api.slack.com/apps
 * 2. Install the app to your workspace
 * 3. Get bot token (xoxb-...) or set up incoming webhooks
 * 4. Set environment variables:
 *    - SLACK_BOT_TOKEN for API method
 *    - SLACK_WEBHOOK_URL for webhook method
 */

// Example 1: Basic Slack message via bot token
async function sendBasicMessage() {
  console.log('\n📨 Sending basic Slack message...');

  const parrot = new Parrot({
    transports: [{
      name: 'slack',
      settings: {
        auth: {
          token: process.env.SLACK_BOT_TOKEN,
        },
        defaults: {},
      },
    }],
  });

  await parrot.send({
    to: '#general',
    text: 'Hello from Parrot Messenger! 🦜',
  });

  console.log('✅ Message sent to #general');
}

// Example 2: Rich message with formatting
async function sendRichMessage() {
  console.log('\n🎨 Sending rich formatted message...');

  const parrot = new Parrot({
    transports: [{
      name: 'slack',
      settings: {
        auth: {
          token: process.env.SLACK_BOT_TOKEN,
        },
        defaults: {},
      },
    }],
  });

  await parrot.send({
    to: '#announcements',
    subject: '📢 Important Update',
    html: `
      <p>We're excited to announce <b>new features</b>!</p>
      <ul>
        <li>✨ <strong>Feature 1</strong>: Amazing new capability</li>
        <li>🚀 <strong>Feature 2</strong>: Performance improvements</li>
        <li>🔒 <strong>Feature 3</strong>: Enhanced security</li>
      </ul>
      <p>Learn more at <a href="https://example.com">our documentation</a></p>
    `,
  });

  console.log('✅ Rich message sent');
}

// Example 3: Using Slack webhook
async function sendViaWebhook() {
  console.log('\n🪝 Sending via webhook...');

  const parrot = new Parrot({
    transports: [{
      name: 'slack',
      settings: {
        auth: {
          webhook: process.env.SLACK_WEBHOOK_URL,
        },
        defaults: {},
      },
    }],
  });

  await parrot.send({
    from: 'Deployment Bot',
    text: '✅ Deployment completed successfully!\nVersion: v2.0.0\nEnvironment: Production',
  });

  console.log('✅ Webhook message sent');
}

// Example 4: Slack-specific attachments
async function sendWithAttachments() {
  console.log('\n📎 Sending message with Slack attachments...');

  const parrot = new Parrot({
    transports: [{
      name: 'slack',
      settings: {
        auth: {
          token: process.env.SLACK_BOT_TOKEN,
        },
        defaults: {},
      },
    }],
  });

  await parrot.send({
    to: '#support',
    text: 'New support ticket',
    attachments: [
      {
        fallback: 'New ticket from customer',
        color: '#ff9900',
        pretext: '🎫 New support ticket received',
        title: 'Ticket #1234: Login issue',
        title_link: 'https://support.example.com/tickets/1234',
        text: 'Customer cannot log in to their account',
        fields: [
          {
            title: 'Priority',
            value: 'High',
            short: true,
          },
          {
            title: 'Customer',
            value: 'john@example.com',
            short: true,
          },
        ],
        footer: 'Support System',
        ts: Math.floor(Date.now() / 1000),
      },
    ],
  });

  console.log('✅ Message with attachments sent');
}

// Example 5: Direct message to user
async function sendDirectMessage() {
  console.log('\n💬 Sending direct message...');

  const parrot = new Parrot({
    transports: [{
      name: 'slack',
      settings: {
        auth: {
          token: process.env.SLACK_BOT_TOKEN,
        },
        defaults: {},
      },
    }],
  });

  // Replace with actual Slack user ID
  const userId = 'U1234567890';

  await parrot.send({
    to: userId, // User ID format
    subject: 'Personal Reminder',
    text: 'Don\'t forget about the team meeting at 3 PM!',
  });

  console.log(`✅ Direct message sent to user ${userId}`);
}

// Example 6: Using templates with Slack
async function sendTemplatedMessage() {
  console.log('\n📋 Sending templated message...');

  const parrot = new Parrot({
    transports: [{
      name: 'slack',
      settings: {
        auth: {
          token: process.env.SLACK_BOT_TOKEN,
        },
        defaultChannel: '#notifications',
        defaults: {},
      },
    }],
  });

  // Register a template
  parrot.templates.register('deployment', {
    subject: '🚀 Deployment Status: {{status}}',
    html: `
      <p><b>Deployment {{status}}</b></p>
      <p>Application: {{app}}</p>
      <p>Version: {{version}}</p>
      <p>Environment: {{env}}</p>
      <p>Deployed by: {{user}}</p>
      {{#if success}}
      <p>✅ All checks passed!</p>
      {{else}}
      <p>❌ Deployment failed. Check logs for details.</p>
      {{/if}}
    `,
  });

  // Use the template
  await parrot.templates.send('deployment', {
    data: {
      status: 'Successful',
      app: 'parrot-messenger',
      version: 'v2.0.0',
      env: 'production',
      user: 'deploy-bot',
      success: true,
    },
  });

  console.log('✅ Templated message sent');
}

// Example 7: Error handling
async function demonstrateErrorHandling() {
  console.log('\n⚠️  Demonstrating error handling...');

  const parrot = new Parrot({
    transports: [{
      name: 'slack',
      settings: {
        auth: {
          token: 'invalid-token',
        },
        defaults: {},
      },
    }],
  });

  try {
    await parrot.send({
      to: '#general',
      text: 'This will fail',
    });
  } catch (error: any) {
    console.log('❌ Expected error:', error.message);
    console.log('   Error type:', error.constructor.name);
    console.log('   Transport:', error.transport);
  }
}

// Run examples
async function runExamples() {
  console.log('🦜 Parrot Messenger - Slack Examples\n');

  if (!process.env.SLACK_BOT_TOKEN && !process.env.SLACK_WEBHOOK_URL) {
    console.error('❌ Please set SLACK_BOT_TOKEN or SLACK_WEBHOOK_URL environment variables');
    console.log('\nExample .env configuration:');
    console.log('SLACK_BOT_TOKEN=xoxb-your-bot-token');
    console.log('SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL');
    process.exit(1);
  }

  try {
    // Run examples based on available configuration
    if (process.env.SLACK_BOT_TOKEN) {
      await sendBasicMessage();
      await sendRichMessage();
      await sendWithAttachments();
      // await sendDirectMessage(); // Uncomment with valid user ID
      await sendTemplatedMessage();
    }

    if (process.env.SLACK_WEBHOOK_URL) {
      await sendViaWebhook();
    }

    await demonstrateErrorHandling();

    console.log('\n✅ All examples completed!');
  } catch (error) {
    console.error('\n❌ Example failed:', error);
  }
}

// Run if called directly
if (require.main === module) {
  runExamples();
}

export {
  sendBasicMessage,
  sendRichMessage,
  sendViaWebhook,
  sendWithAttachments,
  sendDirectMessage,
  sendTemplatedMessage,
};