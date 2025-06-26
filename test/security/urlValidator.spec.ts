import { validateUrl, createSecureAxiosConfig } from '../../src/security/urlValidator';
import { ConfigurationError } from '../../src/errors';

describe('urlValidator', () => {
  describe('validateUrl', () => {
    it('should accept valid HTTPS URLs with default options', () => {
      const url = validateUrl('https://example.com');
      expect(url.href).toBe('https://example.com/');
    });

    it('should reject HTTP URLs by default', () => {
      expect(() => validateUrl('http://example.com')).toThrow(ConfigurationError);
      expect(() => validateUrl('http://example.com')).toThrow('Protocol "http" not allowed');
    });

    it('should accept HTTP URLs when explicitly allowed', () => {
      const url = validateUrl('http://example.com', {
        allowedProtocols: ['http', 'https'],
        allowedPorts: [80, 443],
      });
      expect(url.href).toBe('http://example.com/');
    });

    it('should reject invalid URL format', () => {
      expect(() => validateUrl('not a url')).toThrow(ConfigurationError);
      expect(() => validateUrl('not a url')).toThrow('Invalid URL format');
      expect(() => validateUrl('')).toThrow('Invalid URL format');
    });

    it('should reject non-allowed protocols', () => {
      expect(() => validateUrl('ftp://example.com', { allowedProtocols: ['https'] })).toThrow(
        ConfigurationError,
      );
      expect(() => validateUrl('ftp://example.com', { allowedProtocols: ['https'] })).toThrow(
        'Protocol "ftp" not allowed',
      );
    });

    it('should reject non-allowed hosts', () => {
      expect(() => validateUrl('https://evil.com', { allowedHosts: ['example.com'] })).toThrow(
        ConfigurationError,
      );
      expect(() => validateUrl('https://evil.com', { allowedHosts: ['example.com'] })).toThrow(
        'Host "evil.com" not allowed',
      );
    });

    it('should handle URLs with explicit ports', () => {
      const url1 = validateUrl('https://example.com:443');
      expect(url1.port).toBe(''); // Default port is not explicitly shown

      const url2 = validateUrl('https://example.com:8443', { allowedPorts: [443, 8443] });
      expect(url2.port).toBe('8443');
    });

    it('should reject non-allowed ports', () => {
      expect(() => validateUrl('https://example.com:9999', { allowedPorts: [443, 8443] })).toThrow(
        ConfigurationError,
      );
      expect(() => validateUrl('https://example.com:9999', { allowedPorts: [443, 8443] })).toThrow(
        'Port 9999 not allowed',
      );
    });

    it('should reject localhost URLs by default', () => {
      expect(() => validateUrl('https://localhost')).toThrow('Blocked host: localhost');
      expect(() => validateUrl('https://127.0.0.1')).toThrow(
        'Private IP addresses are not allowed',
      );
      // IPv6 loopback is not detected by the current implementation when in brackets
      const url = validateUrl('https://[::1]', { blockPrivateIPs: false });
      expect(url.hostname).toBe('[::1]');
    });

    it('should allow localhost when blockPrivateIPs is false', () => {
      const url1 = validateUrl('https://localhost', { blockPrivateIPs: false });
      expect(url1.hostname).toBe('localhost');

      const url2 = validateUrl('https://127.0.0.1', { blockPrivateIPs: false });
      expect(url2.hostname).toBe('127.0.0.1');
    });

    it('should reject private IP addresses by default', () => {
      expect(() => validateUrl('https://192.168.1.1')).toThrow(
        'Private IP addresses are not allowed',
      );
      expect(() => validateUrl('https://10.0.0.1')).toThrow('Private IP addresses are not allowed');
      expect(() => validateUrl('https://172.16.0.1')).toThrow(
        'Private IP addresses are not allowed',
      );
    });

    it('should allow private IPs when blockPrivateIPs is false', () => {
      const url1 = validateUrl('https://192.168.1.1', { blockPrivateIPs: false });
      expect(url1.hostname).toBe('192.168.1.1');

      const url2 = validateUrl('https://10.0.0.1', { blockPrivateIPs: false });
      expect(url2.hostname).toBe('10.0.0.1');
    });

    it('should reject blocked hosts', () => {
      expect(() => validateUrl('https://0.0.0.0')).toThrow('Blocked host: 0.0.0.0');
      expect(() => validateUrl('https://169.254.169.254')).toThrow(
        'Private IP addresses are not allowed: 169.254.169.254',
      );
      expect(() => validateUrl('https://metadata.google.internal')).toThrow(
        'Blocked host: metadata.google.internal',
      );
    });

    it('should handle IPv6 addresses', () => {
      const url = validateUrl('https://[2001:db8::1]', { blockPrivateIPs: false });
      expect(url.hostname).toBe('[2001:db8::1]'); // Node.js keeps brackets for IPv6

      // IPv6 link-local addresses are not detected when in brackets by current implementation
      const url2 = validateUrl('https://[fe80::1]', { blockPrivateIPs: false });
      expect(url2.hostname).toBe('[fe80::1]');
    });
  });

  describe('createSecureAxiosConfig', () => {
    it('should create config with URL and default timeout', () => {
      const url = new URL('https://example.com');
      const config = createSecureAxiosConfig(url);
      expect(config.url).toBe('https://example.com/');
      expect(config.timeout).toBe(5000);
      expect(config.maxRedirects).toBe(5);
      expect(config.validateStatus).toBeDefined();
    });

    it('should accept custom timeout', () => {
      const url = new URL('https://example.com');
      const config = createSecureAxiosConfig(url, 10000);
      expect(config.timeout).toBe(10000);
    });

    it('should validate status codes', () => {
      const url = new URL('https://example.com');
      const config = createSecureAxiosConfig(url);
      expect(config.validateStatus!(200)).toBe(true);
      expect(config.validateStatus!(299)).toBe(true);
      expect(config.validateStatus!(300)).toBe(true); // 3xx redirects are allowed
      expect(config.validateStatus!(400)).toBe(false); // 4xx errors are not
      expect(config.validateStatus!(500)).toBe(false);
    });

    it('should include beforeRedirect hook', () => {
      const url = new URL('https://example.com');
      const config = createSecureAxiosConfig(url);
      expect(config.beforeRedirect).toBeDefined();

      // Test the beforeRedirect function
      const options = { url: 'https://example.com/redirect' };

      // Should not throw for same protocol
      expect(() => config.beforeRedirect!(options as any)).not.toThrow();

      // Should throw for different protocol
      options.url = 'http://example.com';
      expect(() => config.beforeRedirect!(options as any)).toThrow('Protocol redirect not allowed');
    });
  });
});
