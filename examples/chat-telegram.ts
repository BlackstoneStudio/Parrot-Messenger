import { Parrot } from '../src';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Telegram Bot Integration Examples
 * 
 * Prerequisites:
 * 1. Create a bot via @BotFather on Telegram
 * 2. Get your bot token
 * 3. Set environment variable:
 *    - TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
 * 4. Get chat IDs by sending a message to your bot and checking:
 *    https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates
 */

// Example 1: Basic Telegram message
async function sendBasicMessage() {
  console.log('\n📨 Sending basic Telegram message...');

  const parrot = new Parrot({
    transports: [{
      name: 'telegram',
      settings: {
        auth: {
          botToken: process.env.TELEGRAM_BOT_TOKEN!,
        },
        defaults: {},
      },
    }],
  });

  // Replace with your chat ID
  const chatId = '123456789';

  await parrot.send({
    to: chatId,
    text: 'Hello from Parrot Messenger! 🦜',
  });

  console.log(`✅ Message sent to chat ${chatId}`);
}

// Example 2: Rich HTML formatted message
async function sendHTMLMessage() {
  console.log('\n🎨 Sending HTML formatted message...');

  const parrot = new Parrot({
    transports: [{
      name: 'telegram',
      settings: {
        auth: {
          botToken: process.env.TELEGRAM_BOT_TOKEN!,
        },
        parseMode: 'HTML',
        defaults: {},
      },
    }],
  });

  const chatId = '123456789';

  await parrot.send({
    to: chatId,
    subject: '📢 Important Update',
    html: `
      <p>We're excited to announce <b>new features</b>!</p>
      <p>✨ <b>Feature 1</b>: Amazing new capability</p>
      <p>🚀 <b>Feature 2</b>: Performance improvements</p>
      <p>🔒 <b>Feature 3</b>: Enhanced security</p>
      <p>Learn more at <a href="https://example.com">our documentation</a></p>
      <hr>
      <p><i>Sent via Parrot Messenger</i></p>
    `,
  });

  console.log('✅ HTML message sent');
}

// Example 3: Markdown formatted message
async function sendMarkdownMessage() {
  console.log('\n📝 Sending Markdown formatted message...');

  const parrot = new Parrot({
    transports: [{
      name: 'telegram',
      settings: {
        auth: {
          botToken: process.env.TELEGRAM_BOT_TOKEN!,
        },
        parseMode: 'Markdown',
        defaults: {},
      },
    }],
  });

  const chatId = '123456789';

  await parrot.send({
    to: chatId,
    subject: 'Daily Report',
    text: `Here's your daily summary:

*Tasks Completed:* 15
*In Progress:* 3
*Pending:* 7

_Performance Metrics:_
• Response Time: *12ms*
• Uptime: *99.9%*
• Active Users: *1,234*

[View Full Report](https://example.com/reports)`,
  });

  console.log('✅ Markdown message sent');
}

// Example 4: Message with inline keyboard
async function sendWithInlineKeyboard() {
  console.log('\n⌨️  Sending message with inline keyboard...');

  const parrot = new Parrot({
    transports: [{
      name: 'telegram',
      settings: {
        auth: {
          botToken: process.env.TELEGRAM_BOT_TOKEN!,
        },
        defaults: {},
      },
    }],
  });

  const chatId = '123456789';

  await parrot.send({
    to: chatId,
    text: '🎯 How would you rate our service?',
    attachments: [
      {
        inline_keyboard: [
          [
            { text: '⭐ Excellent', callback_data: 'rating_5' },
            { text: '😊 Good', callback_data: 'rating_4' },
          ],
          [
            { text: '😐 Average', callback_data: 'rating_3' },
            { text: '😕 Poor', callback_data: 'rating_2' },
          ],
          [
            { text: '💬 Leave Feedback', url: 'https://example.com/feedback' },
          ],
        ],
      },
    ],
  });

  console.log('✅ Message with inline keyboard sent');
}

// Example 5: Sending to a channel
async function sendToChannel() {
  console.log('\n📢 Sending to Telegram channel...');

  const parrot = new Parrot({
    transports: [{
      name: 'telegram',
      settings: {
        auth: {
          botToken: process.env.TELEGRAM_BOT_TOKEN!,
        },
        defaults: {},
      },
    }],
  });

  // Use @channelname format
  await parrot.send({
    to: '@yourchannel',
    subject: '📰 Latest News',
    html: `
      <b>Breaking News!</b>
      
      <p>Parrot Messenger now supports <u>Telegram</u>!</p>
      
      <b>Key Features:</b>
      • HTML & Markdown formatting
      • Inline keyboards
      • Channel broadcasts
      • Media attachments
      
      <i>Stay tuned for more updates!</i>
    `,
  });

  console.log('✅ Message sent to channel');
}

// Example 6: Using default chat ID
async function sendWithDefaults() {
  console.log('\n🔧 Sending with default configuration...');

  const parrot = new Parrot({
    transports: [{
      name: 'telegram',
      settings: {
        auth: {
          botToken: process.env.TELEGRAM_BOT_TOKEN!,
        },
        defaultChatId: '123456789', // Default recipient
        disableNotification: true,
        disableWebPagePreview: true,
        defaults: {},
      },
    }],
  });

  // No 'to' field needed - uses defaultChatId
  await parrot.send({
    text: '🔕 This is a silent notification with no link preview',
  });

  console.log('✅ Message sent with defaults');
}

// Example 7: Using templates
async function sendTemplatedMessage() {
  console.log('\n📋 Sending templated message...');

  const parrot = new Parrot({
    transports: [{
      name: 'telegram',
      settings: {
        auth: {
          botToken: process.env.TELEGRAM_BOT_TOKEN!,
        },
        defaultChatId: '123456789',
        defaults: {},
      },
    }],
  });

  // Register a template
  parrot.templates.register('alert', {
    subject: '🚨 {{severity}} Alert',
    html: `
      <b>{{severity}} Alert: {{title}}</b>
      
      <p>{{description}}</p>
      
      <b>Details:</b>
      • Time: <code>{{time}}</code>
      • System: <code>{{system}}</code>
      • Impact: <i>{{impact}}</i>
      
      {{#if resolved}}
      ✅ <b>Status: Resolved</b>
      {{else}}
      ⚠️ <b>Status: Active</b>
      {{/if}}
    `,
  });

  // Use the template
  await parrot.templates.send('alert', {
    data: {
      severity: 'High',
      title: 'Database Connection Lost',
      description: 'Primary database cluster is unreachable',
      time: new Date().toISOString(),
      system: 'prod-db-01',
      impact: 'Users may experience slow loading times',
      resolved: false,
    },
  });

  console.log('✅ Templated message sent');
}

// Example 8: Error handling
async function demonstrateErrorHandling() {
  console.log('\n⚠️  Demonstrating error handling...');

  const parrot = new Parrot({
    transports: [{
      name: 'telegram',
      settings: {
        auth: {
          botToken: 'invalid-token-format',
        },
        defaults: {},
      },
    }],
  });

  try {
    await parrot.send({
      to: '123456789',
      text: 'This will fail',
    });
  } catch (error: any) {
    console.log('❌ Expected error:', error.message);
    console.log('   Error type:', error.constructor.name);
    console.log('   Transport:', error.transport);
  }
}

// Example 9: Different parse modes
async function demonstrateParseModes() {
  console.log('\n🎯 Demonstrating different parse modes...');

  const chatId = '123456789';

  // HTML mode
  const htmlParrot = new Parrot({
    transports: [{
      name: 'telegram',
      settings: {
        auth: {
          botToken: process.env.TELEGRAM_BOT_TOKEN!,
        },
        parseMode: 'HTML',
        defaults: {},
      },
    }],
  });

  await htmlParrot.send({
    to: chatId,
    text: '<b>Bold</b>, <i>italic</i>, <u>underline</u>, <s>strikethrough</s>',
  });

  // MarkdownV2 mode
  const mdParrot = new Parrot({
    transports: [{
      name: 'telegram',
      settings: {
        auth: {
          botToken: process.env.TELEGRAM_BOT_TOKEN!,
        },
        parseMode: 'MarkdownV2',
        defaults: {},
      },
    }],
  });

  await mdParrot.send({
    to: chatId,
    text: '*Bold*, _italic_, __underline__, ~strikethrough~',
  });

  console.log('✅ Different parse modes demonstrated');
}

// Run examples
async function runExamples() {
  console.log('🦜 Parrot Messenger - Telegram Examples\n');

  if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.error('❌ Please set TELEGRAM_BOT_TOKEN environment variable');
    console.log('\nExample .env configuration:');
    console.log('TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11');
    console.log('\nGet your bot token from @BotFather on Telegram');
    process.exit(1);
  }

  try {
    // Note: Replace chat IDs with your actual values
    console.log('⚠️  Note: Update chat IDs in the examples with your actual values\n');

    // Uncomment examples to run (requires valid chat IDs)
    // await sendBasicMessage();
    // await sendHTMLMessage();
    // await sendMarkdownMessage();
    // await sendWithInlineKeyboard();
    // await sendToChannel();
    // await sendWithDefaults();
    // await sendTemplatedMessage();
    // await demonstrateParseModes();
    
    await demonstrateErrorHandling();

    console.log('\n✅ Examples completed!');
    console.log('\n💡 Tip: Get chat IDs by sending a message to your bot and checking:');
    console.log(`   https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getUpdates`);
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
  sendHTMLMessage,
  sendMarkdownMessage,
  sendWithInlineKeyboard,
  sendToChannel,
  sendWithDefaults,
  sendTemplatedMessage,
  demonstrateParseModes,
};