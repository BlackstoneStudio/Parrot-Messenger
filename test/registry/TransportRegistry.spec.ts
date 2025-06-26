import TransportRegistry from '../../src/registry/TransportRegistry';
import { ConfigurationError } from '../../src/errors';

describe('TransportRegistry', () => {
  let registry: TransportRegistry;

  beforeEach(() => {
    // Get a fresh instance and clear it
    registry = TransportRegistry.getInstance();
    registry.clear();
  });

  afterEach(() => {
    // Reset the registry after each test
    registry.reset();
  });

  describe('getInstance', () => {
    it('should return the same instance', () => {
      const instance1 = TransportRegistry.getInstance();
      const instance2 = TransportRegistry.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('register', () => {
    it('should register a transport', () => {
      const mockTransport = jest.fn();
      registry.register('test', mockTransport);
      expect(registry.has('test')).toBe(true);
    });

    it('should throw when registering duplicate transport', () => {
      const mockTransport = jest.fn();
      registry.register('test', mockTransport);

      expect(() => {
        registry.register('test', mockTransport);
      }).toThrow(ConfigurationError);

      expect(() => {
        registry.register('test', mockTransport);
      }).toThrow('Transport "test" is already registered');
    });
  });

  describe('get', () => {
    it('should get a registered transport', () => {
      const mockTransport = jest.fn();
      registry.register('test', mockTransport);

      const result = registry.get('test');
      expect(result).toBe(mockTransport);
    });

    it('should throw when getting non-existent transport', () => {
      expect(() => {
        registry.get('nonexistent');
      }).toThrow(ConfigurationError);

      expect(() => {
        registry.get('nonexistent');
      }).toThrow('Transport "nonexistent" not found');
    });
  });

  describe('has', () => {
    it('should return true for registered transport', () => {
      const mockTransport = jest.fn();
      registry.register('test', mockTransport);
      expect(registry.has('test')).toBe(true);
    });

    it('should return false for non-registered transport', () => {
      expect(registry.has('nonexistent')).toBe(false);
    });
  });

  describe('list', () => {
    it('should return empty array when no transports registered', () => {
      expect(registry.list()).toEqual([]);
    });

    it('should return list of registered transport names', () => {
      const transport1 = jest.fn();
      const transport2 = jest.fn();
      const transport3 = jest.fn();

      registry.register('transport1', transport1);
      registry.register('transport2', transport2);
      registry.register('transport3', transport3);

      const list = registry.list();
      expect(list).toHaveLength(3);
      expect(list).toContain('transport1');
      expect(list).toContain('transport2');
      expect(list).toContain('transport3');
    });
  });

  describe('clear', () => {
    it('should remove all registered transports', () => {
      const transport1 = jest.fn();
      const transport2 = jest.fn();

      registry.register('transport1', transport1);
      registry.register('transport2', transport2);

      expect(registry.list()).toHaveLength(2);

      registry.clear();

      expect(registry.list()).toHaveLength(0);
      expect(registry.has('transport1')).toBe(false);
      expect(registry.has('transport2')).toBe(false);
    });
  });

  describe('reset', () => {
    it('should clear and re-register default transports', () => {
      // First clear to ensure we start fresh
      registry.clear();
      expect(registry.list()).toHaveLength(0);

      // Reset should register default transports
      registry.reset();

      const list = registry.list();
      expect(list.length).toBeGreaterThan(0);

      // Check for some expected default transports
      expect(registry.has('ses')).toBe(true);
      expect(registry.has('sns')).toBe(true);
      expect(registry.has('smtp')).toBe(true);
      expect(registry.has('sendgrid')).toBe(true);
      expect(registry.has('mailgun')).toBe(true);
      expect(registry.has('mailchimp')).toBe(true);
      expect(registry.has('twilioSMS')).toBe(true);
      expect(registry.has('twilioCall')).toBe(true);
      expect(registry.has('telnyxSMS')).toBe(true);
      expect(registry.has('slack')).toBe(true);
      expect(registry.has('telegram')).toBe(true);
    });
  });
});
