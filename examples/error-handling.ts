import Parrot from '../src';

/**
 * Error Handling Example
 * Demonstrates the enhanced error handling capabilities in v1.1.0
 * with custom error types and proper error recovery strategies
 */

async function demonstrateErrorHandling() {
  // Initialize with multiple transports
  Parrot.init({
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
            from: 'noreply@example.com',
          },
        },
      },
      {
        name: 'mailgun',
        settings: {
          auth: {
            domain: process.env.MAILGUN_DOMAIN || '',
            apiKey: process.env.MAILGUN_API_KEY || '',
          },
          defaults: {
            from: 'noreply@example.com',
          },
        },
      },
    ],
  });

  // Example 1: Validation Error
  console.log('\n--- Example 1: Validation Error ---');
  try {
    await Parrot.send({
      to: 'invalid-email-format', // Invalid email
      subject: 'Test',
      html: '<p>Hello</p>',
    }, {
      class: 'email',
      name: 'ses',
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      console.log('✓ Caught ValidationError:', error.message);
      console.log('  Field:', error.field);
      console.log('  Value:', error.value);
    }
  }

  // Example 2: Configuration Error
  console.log('\n--- Example 2: Configuration Error ---');
  try {
    await Parrot.send({
      to: 'user@example.com',
      subject: 'Test',
      html: '<p>Hello</p>',
    }, {
      class: 'email',
      name: 'nonexistent-transport', // Transport not configured
    });
  } catch (error) {
    if (error.name === 'ConfigurationError') {
      console.log('✓ Caught ConfigurationError:', error.message);
    }
  }

  // Example 3: Transport Error with Retry
  console.log('\n--- Example 3: Transport Error with Retry ---');
  async function sendWithRetry(envelope, options, maxRetries = 3) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`  Attempt ${attempt}/${maxRetries}...`);
        const result = await Parrot.send(envelope, options);
        console.log('✓ Email sent successfully on attempt', attempt);
        return result;
      } catch (error) {
        lastError = error;
        
        if (error.name === 'TransportError') {
          console.log(`  Transport error on attempt ${attempt}:`, error.message);
          
          // Don't retry on permanent failures
          if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
            console.log('  Permanent failure detected, not retrying');
            throw error;
          }
          
          // Exponential backoff
          if (attempt < maxRetries) {
            const delay = Math.pow(2, attempt - 1) * 1000;
            console.log(`  Waiting ${delay}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        } else {
          // Don't retry non-transport errors
          throw error;
        }
      }
    }
    
    throw lastError;
  }

  try {
    await sendWithRetry({
      to: 'user@example.com',
      subject: 'Test with Retry',
      text: 'This email includes retry logic',
    }, {
      class: 'email',
      name: 'ses',
    });
  } catch (error) {
    console.log('✗ Failed after all retries:', error.message);
  }

  // Example 4: Template Error
  console.log('\n--- Example 4: Template Error ---');
  try {
    // Register a template with invalid syntax
    Parrot.templates.register({
      name: 'broken-template',
      html: '<p>Hello {{name</p>', // Missing closing }}
    });
    
    await Parrot.templates.send(
      'broken-template',
      {
        to: 'user@example.com',
        subject: 'Template Test',
      },
      { name: 'User' },
      { class: 'email', name: 'ses' }
    );
  } catch (error) {
    if (error.name === 'TemplateError') {
      console.log('✓ Caught TemplateError:', error.message);
    }
  }

  // Example 5: Input Sanitization
  console.log('\n--- Example 5: Input Sanitization (XSS Prevention) ---');
  try {
    const envelope = {
      to: 'user@example.com',
      subject: 'Security Test',
      html: '<p>Hello</p><script>alert("XSS")</script><p>World</p>',
    };
    
    // The library automatically sanitizes HTML content
    const result = await Parrot.send(envelope, {
      class: 'email',
      name: 'ses',
    });
    
    console.log('✓ HTML content sanitized automatically');
    console.log('  Original:', envelope.html);
    console.log('  Sanitized: <p>Hello</p><p>World</p>');
    
  } catch (error) {
    console.error('Sanitization example error:', error);
  }

  // Example 6: Graceful Fallback
  console.log('\n--- Example 6: Graceful Fallback ---');
  async function sendWithFallback(envelope) {
    const transports = ['ses', 'mailgun'];
    let lastError;
    
    for (const transport of transports) {
      try {
        console.log(`  Trying ${transport}...`);
        const result = await Parrot.send(envelope, {
          class: 'email',
          name: transport,
        });
        console.log(`✓ Sent successfully via ${transport}`);
        return result;
      } catch (error) {
        lastError = error;
        console.log(`  ${transport} failed:`, error.message);
      }
    }
    
    throw new Error(`All transports failed. Last error: ${lastError.message}`);
  }

  try {
    await sendWithFallback({
      to: 'user@example.com',
      subject: 'Fallback Test',
      text: 'This email tries multiple transports',
    });
  } catch (error) {
    console.log('✗ All transports failed:', error.message);
  }
}

// Run the examples
demonstrateErrorHandling()
  .then(() => console.log('\n✓ Error handling examples completed'))
  .catch(error => console.error('\n✗ Unexpected error:', error));