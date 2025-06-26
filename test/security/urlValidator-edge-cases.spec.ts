import { validateUrl } from '../../src/security/urlValidator';
import { ConfigurationError } from '../../src/errors';

describe('urlValidator edge cases', () => {
  it('should validate when protocols list is empty', () => {
    const url = validateUrl('ftp://example.com', {
      allowedProtocols: [],
      allowedPorts: [21, 80, 443], // Include FTP default port
    });
    expect(url.protocol).toBe('ftp:');
  });

  it('should validate when hosts list is empty (default behavior)', () => {
    const url = validateUrl('https://any-host.com', { allowedHosts: [] });
    expect(url.hostname).toBe('any-host.com');
  });

  it('should validate when ports list is empty', () => {
    const url = validateUrl('https://example.com:9999', { allowedPorts: [] });
    expect(url.port).toBe('9999');
  });

  it('should skip host validation when no allowed hosts specified', () => {
    // This tests the branch where allowedHosts.length === 0
    const url = validateUrl('https://any-random-host.example', {
      allowedHosts: [],
    });
    expect(url.hostname).toBe('any-random-host.example');
  });
});
