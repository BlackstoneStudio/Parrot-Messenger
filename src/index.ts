import Templates from './templates';
import send from './send';
import getTransportClass from './utils';
import { Envelope, Mailer, ParrotSettings, Transport } from './types';
import { ParrotError } from './errors';

/**
 * Parrot Messenger - Unified messaging library for Email, SMS, and Voice
 *
 * @example
 * ```typescript
 * const parrot = new Parrot({
 *   transports: [{
 *     name: 'sendgrid',
 *     settings: {
 *       auth: { apiKey: 'your-api-key' },
 *       defaults: { from: 'noreply@example.com' }
 *     }
 *   }]
 * });
 *
 * await parrot.send({
 *   to: 'user@example.com',
 *   subject: 'Hello',
 *   html: '<p>Hello World</p>'
 * });
 * ```
 */
class Parrot implements Mailer<Templates> {
  /**
   * Template management system
   */
  public templates: Templates;

  /**
   * Create a new Parrot instance
   *
   * @param settings - Configuration for Parrot
   * @param settings.defaultClass - Default transport class ('email', 'sms', 'call')
   * @param settings.transports - Array of transport configurations
   * @param settings.templateUrlValidation - Security settings for template URL fetching
   */
  constructor(
    private settings: ParrotSettings = {
      defaultClass: 'email',
      transports: [],
    },
  ) {
    this.settings = {
      defaultClass: settings.defaultClass,
      ...settings,
    };

    this.templates = new Templates(this, settings.templateUrlValidation);
  }

  /**
   * Send a message through configured transports
   *
   * @param message - Message envelope containing to, from, subject, content, etc.
   * @param transport - Optional transport filter to use specific transport(s)
   * @throws {ParrotError} When sending fails
   * @throws {ValidationError} When message validation fails
   * @throws {ConfigurationError} When transport is not configured
   */
  async send(
    message: Envelope,
    transport?: Omit<Transport, 'settings'> | Omit<Transport, 'settings'>[],
  ) {
    const transports = this.settings.transports.map((t) => ({
      ...t,
      class: getTransportClass(t.name),
    }));
    try {
      await send(message, transports as Transport[], transport);
    } catch (e) {
      // Re-throw if it's already one of our custom errors
      if (e instanceof ParrotError) {
        throw e;
      }
      // Otherwise wrap in a generic ParrotError
      throw new ParrotError(`Error sending message: ${e.message || e}`, 'SEND_ERROR');
    }
  }
}

export { Parrot };

export default Parrot;
