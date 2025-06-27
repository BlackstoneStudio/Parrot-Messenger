import { Parrot } from '../src';

/**
 * Advanced Template Engine Example
 * Demonstrates the powerful template capabilities of Parrot Messenger
 * including async templates, remote data fetching, and complex rendering
 */

async function setupTransports() {
  return new Parrot({
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
            from: 'notifications@example.com',
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
}

async function demonstrateTemplates() {
  const parrot = await setupTransports();

  // Example 1: Basic HTML Template with Handlebars
  console.log('\n--- Example 1: Basic HTML Template ---');
  
  parrot.templates.register({
    name: 'welcome-email',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Welcome {{userName}}!</h1>
        <p>Thank you for joining our platform on {{joinDate}}.</p>
        {{#if isPremium}}
          <p style="color: gold;">🌟 You're a Premium member!</p>
        {{else}}
          <p>Consider upgrading to Premium for exclusive features.</p>
        {{/if}}
        <ul>
          {{#each features}}
            <li>{{this}}</li>
          {{/each}}
        </ul>
      </div>
    `,
  });

  try {
    await parrot.templates.send(
      'welcome-email',
      {
        to: 'newuser@example.com',
        subject: 'Welcome to Our Platform!',
      },
      {
        userName: 'John Doe',
        joinDate: new Date().toLocaleDateString(),
        isPremium: true,
        features: ['Unlimited Storage', 'Priority Support', 'Advanced Analytics'],
      },
      { class: 'email', name: 'ses' }
    );
    console.log('✓ Welcome email sent successfully');
  } catch (error) {
    console.error('✗ Error sending welcome email:', error.message);
  }

  // Example 2: Async Template with Remote Data
  console.log('\n--- Example 2: Async Template with Remote Data ---');
  
  parrot.templates.register({
    name: 'weather-notification',
    html: 'Current temperature in NYC: {{temperature}}°C, Wind: {{windspeed}} km/h',
    request: {
      method: 'GET',
      url: 'https://api.open-meteo.com/v1/forecast',
      params: {
        latitude: 40.7128,
        longitude: -74.0060,
        current_weather: true,
      },
      resolve: 'current_weather', // Extract the current_weather object
    },
  });

  try {
    await parrot.templates.send(
      'weather-notification',
      {
        to: '+1234567890',
      },
      {}, // No additional data needed, it comes from the API
      { class: 'sms', name: 'twilioSMS' }
    );
    console.log('✓ Weather SMS sent with live data');
  } catch (error) {
    console.error('✗ Error sending weather notification:', error.message);
  }

  // Example 3: Multi-language Template
  console.log('\n--- Example 3: Multi-language Template ---');
  
  const translations = {
    en: {
      subject: 'Order Confirmation #{{orderId}}',
      greeting: 'Hello {{name}}!',
      message: 'Your order has been confirmed.',
      total: 'Total: ${{total}}',
      thank: 'Thank you for your purchase!',
    },
    es: {
      subject: 'Confirmación de Pedido #{{orderId}}',
      greeting: '¡Hola {{name}}!',
      message: 'Tu pedido ha sido confirmado.',
      total: 'Total: ${{total}}',
      thank: '¡Gracias por tu compra!',
    },
    fr: {
      subject: 'Confirmation de Commande #{{orderId}}',
      greeting: 'Bonjour {{name}}!',
      message: 'Votre commande a été confirmée.',
      total: 'Total: {{total}}€',
      thank: 'Merci pour votre achat!',
    },
  };

  // Register templates for each language
  Object.entries(translations).forEach(([lang, texts]) => {
    parrot.templates.register({
      name: `order-confirmation-${lang}`,
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>${texts.greeting}</h2>
          <p>${texts.message}</p>
          <p><strong>${texts.total}</strong></p>
          <p>${texts.thank}</p>
        </div>
      `,
    });
  });

  // Send in different languages
  const orders = [
    { lang: 'en', email: 'john@example.com', name: 'John', orderId: '12345', total: '99.99' },
    { lang: 'es', email: 'maria@example.com', name: 'María', orderId: '12346', total: '89.99' },
    { lang: 'fr', email: 'pierre@example.com', name: 'Pierre', orderId: '12347', total: '79.99' },
  ];

  for (const order of orders) {
    try {
      await parrot.templates.send(
        `order-confirmation-${order.lang}`,
        {
          to: order.email,
          subject: translations[order.lang].subject.replace('{{orderId}}', order.orderId),
        },
        {
          name: order.name,
          orderId: order.orderId,
          total: order.total,
        },
        { class: 'email', name: 'ses' }
      );
      console.log(`✓ Order confirmation sent to ${order.name} in ${order.lang}`);
    } catch (error) {
      console.error(`✗ Error sending to ${order.name}:`, error.message);
    }
  }

  // Example 4: Dynamic Template with Complex Logic
  console.log('\n--- Example 4: Dynamic Template with Complex Logic ---');
  
  parrot.templates.register({
    name: 'invoice-template',
    html: `
      <style>
        .invoice { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; }
        .header { background: #f0f0f0; padding: 20px; text-align: center; }
        .items { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .items th, .items td { padding: 10px; border-bottom: 1px solid #ddd; }
        .items th { background: #f9f9f9; text-align: left; }
        .total { text-align: right; font-size: 1.2em; font-weight: bold; }
      </style>
      <div class="invoice">
        <div class="header">
          <h1>Invoice #{{invoice.number}}</h1>
          <p>Date: {{invoice.date}}</p>
        </div>
        
        <h3>Bill To:</h3>
        <p>{{customer.name}}<br>{{customer.email}}</p>
        
        <table class="items">
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {{#each items}}
            <tr>
              <td>{{name}}</td>
              <td>{{quantity}}</td>
              <td>\${{price}}</td>
              <td>\${{multiply quantity price}}</td>
            </tr>
            {{/each}}
          </tbody>
        </table>
        
        <p class="total">
          Subtotal: \${{invoice.subtotal}}<br>
          Tax ({{invoice.taxRate}}%): \${{invoice.tax}}<br>
          <strong>Total: \${{invoice.total}}</strong>
        </p>
        
        {{#if invoice.isPastDue}}
        <p style="color: red; font-weight: bold;">
          ⚠️ This invoice is past due. Please pay immediately.
        </p>
        {{/if}}
      </div>
    `,
  });

  // Register Handlebars helper for multiplication
  const Handlebars = require('handlebars');
  Handlebars.registerHelper('multiply', (a, b) => (a * b).toFixed(2));

  const invoiceData = {
    invoice: {
      number: 'INV-2024-001',
      date: new Date().toLocaleDateString(),
      subtotal: '250.00',
      taxRate: 8,
      tax: '20.00',
      total: '270.00',
      isPastDue: false,
    },
    customer: {
      name: 'Acme Corporation',
      email: 'billing@acme.com',
    },
    items: [
      { name: 'Professional Services', quantity: 5, price: 40 },
      { name: 'Software License', quantity: 1, price: 50 },
    ],
  };

  try {
    await parrot.templates.send(
      'invoice-template',
      {
        to: invoiceData.customer.email,
        subject: `Invoice ${invoiceData.invoice.number}`,
        attachments: [{
          filename: `invoice-${invoiceData.invoice.number}.pdf`,
          // In a real scenario, you'd generate a PDF here
          content: Buffer.from('Invoice PDF content would go here'),
        }],
      },
      invoiceData,
      { class: 'email', name: 'ses' }
    );
    console.log('✓ Invoice email sent with attachment');
  } catch (error) {
    console.error('✗ Error sending invoice:', error.message);
  }

  // Example 5: Template with External API and Error Handling
  console.log('\n--- Example 5: Template with External API ---');
  
  parrot.templates.register({
    name: 'user-activity-report',
    html: 'Report generated with ID: {{.}}',
    request: {
      method: 'POST',
      url: 'https://jsonplaceholder.typicode.com/posts',
      data: {
        userId: 'USER_ID_PLACEHOLDER',
        title: 'Activity Report',
        body: 'Fetching user activity...',
      },
      headers: {
        'Content-Type': 'application/json',
      },
      resolve: 'id', // Will resolve to the created post ID
    },
  });

  try {
    await parrot.templates.send(
      'user-activity-report',
      {
        to: 'admin@example.com',
        subject: 'Daily Activity Report',
      },
      { userId: 123 },
      { class: 'email', name: 'ses' }
    );
    console.log('✓ Activity report sent with API data');
  } catch (error) {
    if (error.name === 'TemplateError') {
      console.error('✗ Template processing failed:', error.message);
    } else {
      console.error('✗ Error:', error.message);
    }
  }
}

// Run all examples
demonstrateTemplates()
  .then(() => console.log('\n✓ All template examples completed'))
  .catch(error => console.error('\n✗ Unexpected error:', error));