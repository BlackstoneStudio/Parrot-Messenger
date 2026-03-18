import { MockTransport } from '../../src/testing';
import { Envelope } from '../../src/types';
import TransportRegistry from '../../src/registry/TransportRegistry';

describe('MockTransport', () => {
  beforeEach(() => {
    MockTransport.clear();
  });

  describe('send', () => {
    it('should capture sent messages', async () => {
      const transport = new MockTransport();
      const envelope: Envelope = {
        from: 'sender@example.com',
        to: 'recipient@example.com',
        subject: 'Test Subject',
        html: '<p>Hello</p>',
      };

      await transport.send(envelope);

      expect(MockTransport.messages).toHaveLength(1);
      expect(MockTransport.messages[0].envelope).toEqual(envelope);
      expect(MockTransport.messages[0].timestamp).toBeInstanceOf(Date);
    });

    it('should capture multiple messages', async () => {
      const transport = new MockTransport();

      await transport.send({ to: 'a@test.com', text: 'First' });
      await transport.send({ to: 'b@test.com', text: 'Second' });
      await transport.send({ to: 'c@test.com', text: 'Third' });

      expect(MockTransport.messages).toHaveLength(3);
      expect(MockTransport.messages[0].envelope.to).toBe('a@test.com');
      expect(MockTransport.messages[1].envelope.to).toBe('b@test.com');
      expect(MockTransport.messages[2].envelope.to).toBe('c@test.com');
    });

    it('should merge defaults with envelope', async () => {
      const transport = new MockTransport({
        defaults: {
          from: 'default@example.com',
          subject: 'Default Subject',
        },
      });

      await transport.send({ to: 'recipient@example.com', html: '<p>Hi</p>' });

      expect(MockTransport.messages[0].envelope).toEqual({
        from: 'default@example.com',
        subject: 'Default Subject',
        to: 'recipient@example.com',
        html: '<p>Hi</p>',
      });
    });

    it('should allow envelope to override defaults', async () => {
      const transport = new MockTransport({
        defaults: { from: 'default@example.com' },
      });

      await transport.send({ from: 'override@example.com', to: 'test@test.com' });

      expect(MockTransport.messages[0].envelope.from).toBe('override@example.com');
    });

    it('should share messages across instances', async () => {
      const transport1 = new MockTransport();
      const transport2 = new MockTransport();

      await transport1.send({ to: 'a@test.com', text: 'From instance 1' });
      await transport2.send({ to: 'b@test.com', text: 'From instance 2' });

      expect(MockTransport.messages).toHaveLength(2);
    });
  });

  describe('lastMessage', () => {
    it('should return the most recent message', async () => {
      const transport = new MockTransport();

      await transport.send({ to: 'first@test.com', text: 'First' });
      await transport.send({ to: 'last@test.com', text: 'Last' });

      expect(MockTransport.lastMessage?.envelope.to).toBe('last@test.com');
    });

    it('should return undefined when no messages sent', () => {
      expect(MockTransport.lastMessage).toBeUndefined();
    });
  });

  describe('clear', () => {
    it('should remove all captured messages', async () => {
      const transport = new MockTransport();

      await transport.send({ to: 'test@test.com', text: 'Hello' });
      expect(MockTransport.messages).toHaveLength(1);

      MockTransport.clear();
      expect(MockTransport.messages).toHaveLength(0);
    });
  });

  describe('simulated failures', () => {
    it('should throw when shouldFail is true', async () => {
      const transport = new MockTransport({ shouldFail: true });

      await expect(transport.send({ to: 'test@test.com', text: 'Hello' })).rejects.toThrow(
        'Mock transport simulated failure',
      );
    });

    it('should throw with custom error message', async () => {
      const transport = new MockTransport({
        shouldFail: true,
        failMessage: 'Rate limit exceeded',
      });

      await expect(transport.send({ to: 'test@test.com', text: 'Hello' })).rejects.toThrow(
        'Rate limit exceeded',
      );
    });

    it('should not capture message when failing', async () => {
      const transport = new MockTransport({ shouldFail: true });

      try {
        await transport.send({ to: 'test@test.com', text: 'Hello' });
      } catch {
        // expected
      }

      expect(MockTransport.messages).toHaveLength(0);
    });
  });

  describe('simulated latency', () => {
    it('should delay send when latency is set', async () => {
      const transport = new MockTransport({ latency: 50 });
      const start = Date.now();

      await transport.send({ to: 'test@test.com', text: 'Hello' });

      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThanOrEqual(40);
      expect(MockTransport.messages).toHaveLength(1);
    });
  });

  describe('register', () => {
    afterEach(() => {
      const registry = TransportRegistry.getInstance();
      registry.reset();
    });

    it('should register mock transport in the registry', () => {
      MockTransport.register();

      const registry = TransportRegistry.getInstance();
      expect(registry.has('mock')).toBe(true);
    });

    it('should not throw when registering twice', () => {
      MockTransport.register();
      expect(() => MockTransport.register()).not.toThrow();
    });
  });

  describe('unregister', () => {
    it('should reset registry to defaults (removing mock)', () => {
      MockTransport.register();
      const registry = TransportRegistry.getInstance();
      expect(registry.has('mock')).toBe(true);

      MockTransport.unregister();
      expect(registry.has('mock')).toBe(false);
    });

    it('should not throw when mock is not registered', () => {
      expect(() => MockTransport.unregister()).not.toThrow();
    });
  });
});
