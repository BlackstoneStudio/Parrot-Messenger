import { Parrot } from '../src';
import { MockTransport } from '../src/testing';

/**
 * Mock Transport Example
 * Demonstrates how to use MockTransport for testing your messaging logic
 * without sending real emails, SMS, or calls.
 */

// Register the mock transport before creating Parrot instances
MockTransport.register();

async function exampleBasicUsage() {
  const parrot = new Parrot({
    transports: [
      {
        name: 'mock',
        settings: {
          defaults: {
            from: 'noreply@example.com',
          },
        },
      },
    ],
  });

  // Send a message — nothing leaves your machine
  await parrot.send(
    {
      to: 'user@example.com',
      subject: 'Welcome!',
      html: '<h1>Welcome to our app</h1>',
    },
    { class: 'email', name: 'mock' },
  );

  // Inspect captured messages
  console.log('Messages sent:', MockTransport.messages.length);
  console.log('Last message to:', MockTransport.lastMessage?.envelope.to);
  console.log('Last message subject:', MockTransport.lastMessage?.envelope.subject);

  // Clean up between tests
  MockTransport.clear();
}

async function exampleErrorSimulation() {
  const parrot = new Parrot({
    transports: [
      {
        name: 'mock',
        settings: {
          shouldFail: true,
          failMessage: 'Provider rate limit exceeded',
        },
      },
    ],
  });

  try {
    await parrot.send(
      { to: 'user@example.com', subject: 'Test', html: '<p>Hi</p>' },
      { class: 'email', name: 'mock' },
    );
  } catch (error) {
    console.log('Caught expected error:', error.message);
  }
}

async function exampleJestPattern() {
  // Typical Jest test pattern:
  //
  // beforeAll(() => MockTransport.register());
  // beforeEach(() => MockTransport.clear());
  //
  // it('should send welcome email on signup', async () => {
  //   await signupUser({ email: 'new@user.com' });
  //
  //   expect(MockTransport.messages).toHaveLength(1);
  //   expect(MockTransport.lastMessage?.envelope.to).toBe('new@user.com');
  //   expect(MockTransport.lastMessage?.envelope.subject).toContain('Welcome');
  // });
  //
  // it('should handle provider failures gracefully', async () => {
  //   const parrot = new Parrot({
  //     transports: [{ name: 'mock', settings: { shouldFail: true } }],
  //   });
  //   await expect(parrot.send(...)).rejects.toThrow();
  // });

  console.log('See code comments for Jest test pattern');
}

// Run examples
if (require.main === module) {
  (async () => {
    await exampleBasicUsage();
    await exampleErrorSimulation();
    await exampleJestPattern();
    console.log('\nMock transport examples completed');
  })().catch(console.error);
}
