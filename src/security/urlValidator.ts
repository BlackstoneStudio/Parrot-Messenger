import { URL } from 'url';
import { ConfigurationError } from '../errors';

export interface UrlValidationOptions {
  allowedProtocols?: string[];
  allowedHosts?: string[];
  allowedPorts?: number[];
  blockPrivateIPs?: boolean;
  timeout?: number;
}

const DEFAULT_OPTIONS: UrlValidationOptions = {
  allowedProtocols: ['https'],
  allowedHosts: [],
  allowedPorts: [443],
  blockPrivateIPs: true,
  timeout: 5000,
};

/**
 * Validates a URL for safe external requests
 * Prevents SSRF attacks by checking against allowlists
 */
export function validateUrl(urlString: string, options: UrlValidationOptions = {}): URL {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  let url: URL;
  try {
    url = new URL(urlString);
  } catch {
    throw new ConfigurationError(`Invalid URL format: ${urlString}`);
  }

  // Check protocol
  if (opts.allowedProtocols && opts.allowedProtocols.length > 0) {
    const protocol = url.protocol.slice(0, -1); // Remove trailing colon
    if (!opts.allowedProtocols.includes(protocol)) {
      throw new ConfigurationError(
        `Protocol "${protocol}" not allowed. Allowed protocols: ${opts.allowedProtocols.join(', ')}`
      );
    }
  }

  // Check host
  if (opts.allowedHosts && opts.allowedHosts.length > 0) {
    if (!opts.allowedHosts.includes(url.hostname)) {
      throw new ConfigurationError(
        `Host "${url.hostname}" not allowed. Allowed hosts: ${opts.allowedHosts.join(', ')}`
      );
    }
  }

  // Check port
  let port;
  if (url.port) {
    port = parseInt(url.port, 10);
  } else {
    port = url.protocol === 'https:' ? 443 : 80;
  }
  if (opts.allowedPorts && opts.allowedPorts.length > 0) {
    if (!opts.allowedPorts.includes(port)) {
      throw new ConfigurationError(
        `Port ${port} not allowed. Allowed ports: ${opts.allowedPorts.join(', ')}`
      );
    }
  }

  // Block private IPs
  if (opts.blockPrivateIPs) {
    const privateIPRanges = [
      /^127\./,           // Loopback
      /^10\./,            // Private Class A
      /^172\.(1[6-9]|2\d|3[01])\./,  // Private Class B
      /^192\.168\./,      // Private Class C
      /^169\.254\./,      // Link-local
      /^::1$/,            // IPv6 loopback
      /^fe80::/,          // IPv6 link-local
      /^fc00::/,          // IPv6 unique local
    ];

    const {hostname} = url;
    
    // Check if hostname is an IP address
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    const ipv6Regex = /^([\da-f]{0,4}:){2,7}[\da-f]{0,4}$/i;
    
    if (ipv4Regex.test(hostname) || ipv6Regex.test(hostname)) {
      // eslint-disable-next-line no-restricted-syntax
      for (const range of privateIPRanges) {
        if (range.test(hostname)) {
          throw new ConfigurationError(`Private IP addresses are not allowed: ${hostname}`);
        }
      }
    }

    // Block localhost and metadata endpoints
    const blockedHosts = ['localhost', '0.0.0.0', 'metadata.google.internal', '169.254.169.254'];
    if (blockedHosts.includes(hostname.toLowerCase())) {
      throw new ConfigurationError(`Blocked host: ${hostname}`);
    }
  }

  return url;
}

/**
 * Create axios config with security settings
 */
export function createSecureAxiosConfig(url: URL, timeout: number = 5000) {
  return {
    url: url.toString(),
    timeout,
    maxRedirects: 5,
    validateStatus: (status: number) => status >= 200 && status < 400,
    // Prevent following redirects to different protocols
    beforeRedirect: (options: any) => {
      const redirectUrl = new URL(options.url);
      if (redirectUrl.protocol !== url.protocol) {
        throw new ConfigurationError('Protocol redirect not allowed');
      }
    },
  };
}