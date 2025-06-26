import { compile } from 'handlebars';
import Axios from 'axios';
import { Envelope, Mailer, Transport } from '../types';
import { TemplateError, ConfigurationError } from '../errors';
import {
  validateUrl,
  createSecureAxiosConfig,
  UrlValidationOptions,
} from '../security/urlValidator';
import { SimpleCache } from '../utils/cache';
import { RateLimiter } from '../utils/rateLimiter';

/**
 * Template management system for Parrot Messenger
 * Supports static templates and async templates fetched via HTTP
 */
class Templates {
  public templates: Map<
    string,
    {
      name: string;
      html: string;
      request?: Record<string | number, any>;
    }
  >;

  private urlValidationOptions: UrlValidationOptions;

  private cache: SimpleCache<string>;

  private rateLimiter: RateLimiter;

  constructor(
    private mailer: Mailer<Templates>,
    urlValidationOptions?: UrlValidationOptions,
  ) {
    this.templates = new Map();
    // Cache template content for 15 minutes by default
    this.cache = new SimpleCache<string>(15 * 60 * 1000);
    // Rate limit: 100 requests per minute per URL
    this.rateLimiter = new RateLimiter(100, 60000);
    this.urlValidationOptions = urlValidationOptions || {
      allowedProtocols: ['https'],
      allowedHosts: [], // Empty means all hosts allowed (but still validates other security aspects)
      blockPrivateIPs: true,
      timeout: 5000,
    };
  }

  /**
   * Register a new template
   *
   * @param options - Template configuration
   * @param options.name - Unique name for the template
   * @param options.html - Handlebars template string or static HTML
   * @param options.request - Optional HTTP request config for async templates
   * @returns Map of all registered templates
   * @throws {TemplateError} When template parsing fails
   */
  register({
    name,
    html,
    request,
  }: {
    name: string;
    html: string;
    request?: Record<string | number, any>;
  }) {
    // Test that the template is a valid handlebars template
    try {
      if (!request) {
        const handlebarsTemplate = compile(html);
        handlebarsTemplate({});
      }
    } catch (e) {
      throw new TemplateError(
        `Error parsing template "${name}": ${e instanceof Error ? e.message : String(e)}`,
      );
    }

    // Add this template to the store
    this.templates.set(name, {
      name,
      html,
      request: request || undefined,
    });

    return this.templates;
  }

  /**
   * List all registered template names
   *
   * @returns Array of template names
   */
  list(): string[] {
    const keys: string[] = [];
    this.templates.forEach((_, key) => {
      keys.push(key);
    });

    return keys;
  }

  /**
   * Send a message using a registered template
   *
   * @param name - Name of the registered template
   * @param settings - Message envelope settings (to, from, etc.)
   * @param data - Data to pass to the Handlebars template
   * @param transport - Optional transport filter
   * @throws {TemplateError} When template is not found or processing fails
   * @throws {ConfigurationError} When async template URL validation fails
   */
  async send(
    name: string,
    settings: Envelope,
    // eslint-disable-next-line default-param-last
    data = {},
    transport?: Omit<Transport, 'settings'> | Omit<Transport, 'settings'>[],
  ) {
    const template = this.templates.get(name);

    if (!template) {
      throw new TemplateError(`Template "${name}" not found`);
    }

    let content = template.html;

    if (template.request) {
      const { request } = template;

      try {
        // Validate URL for security
        if (!request.url) {
          throw new ConfigurationError('Template request must include a URL');
        }

        // Create cache key from URL and resolve path
        const cacheKey = `${request.url}${request.resolve ? `:${request.resolve}` : ''}`;

        // Check cache first
        const cachedContent = this.cache.get(cacheKey);
        if (cachedContent !== undefined) {
          content = cachedContent;
        } else {
          // Check rate limit
          if (!this.rateLimiter.tryRequest(request.url)) {
            const resetTime = this.rateLimiter.getResetTime(request.url);
            throw new TemplateError(
              `Rate limit exceeded for template URL. Try again in ${Math.ceil(resetTime / 1000)} seconds`,
              { url: request.url, resetTimeMs: resetTime },
            );
          }

          const validatedUrl = validateUrl(request.url, this.urlValidationOptions);
          const axiosConfig = createSecureAxiosConfig(
            validatedUrl,
            this.urlValidationOptions.timeout,
          );

          // Merge with any additional axios options (excluding url)
          const { url: _url, ...otherRequestOptions } = request; // eslint-disable-line @typescript-eslint/no-unused-vars
          const finalConfig = { ...axiosConfig, ...otherRequestOptions };

          const req = await Axios(finalConfig);

          // Safely resolve the path in the response
          if (request.resolve) {
            const resolvePath = String(request.resolve).split('.');
            content = resolvePath.reduce((obj, key) => {
              if (obj && typeof obj === 'object' && key in obj) {
                return obj[key];
              }
              throw new TemplateError(`Path "${request.resolve}" not found in template response`);
            }, req.data);
          } else {
            content = req.data;
          }

          // Cache the resolved content
          this.cache.set(cacheKey, String(content));
        }
      } catch (e) {
        if (e instanceof ConfigurationError) {
          throw e; // Re-throw security errors as-is
        }
        throw new TemplateError(
          `Error fetching async template "${name}": ${e instanceof Error ? e.message : String(e)}`,
          {
            request,
          },
        );
      }
    }

    if (!content) {
      throw new TemplateError(`No content found for template "${name}"`);
    }

    // Compile the handlebars template and render
    const handlebarsTemplate = compile(content);
    const html = handlebarsTemplate(data);

    const message = {
      ...settings,
      html,
    };

    // MJS makes this as an export so we need
    // to access default prop of mailer
    return this.mailer.send(message, transport);
  }

  /**
   * Clear the template cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   * @returns Object with cache size
   */
  getCacheStats(): { size: number } {
    return {
      size: this.cache.size(),
    };
  }
}

export default Templates;
