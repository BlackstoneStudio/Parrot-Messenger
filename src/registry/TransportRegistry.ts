import { GenericTransport } from '../types';
import { ConfigurationError } from '../errors';
import { TRANSPORT_NAMES } from '../constants/transports';

// Import all transports
import SMTP from '../transports/smtp';
import Mailgun from '../transports/mailgun';
import Mailchimp from '../transports/mailchimp';
import SES from '../transports/aws/ses';
import SNS from '../transports/aws/sns';
import Sendgrid from '../transports/sendgrid';
import TwilioSMS from '../transports/twilio/sms';
import TwilioCall from '../transports/twilio/call';
import TelnyxSMS from '../transports/telnyx/sms';

type TransportConstructor = new (settings: any) => GenericTransport;

/**
 * Registry for managing transport implementations
 * Provides centralized transport registration and retrieval
 */
class TransportRegistry {
  private static instance: TransportRegistry; // eslint-disable-line no-use-before-define

  private transports: Map<string, TransportConstructor>;

  private constructor() {
    this.transports = new Map();
    this.registerDefaultTransports();
  }

  /**
   * Get singleton instance of TransportRegistry
   */
  static getInstance(): TransportRegistry {
    if (!TransportRegistry.instance) {
      TransportRegistry.instance = new TransportRegistry();
    }
    return TransportRegistry.instance;
  }

  /**
   * Register default transports
   */
  private registerDefaultTransports(): void {
    this.register(TRANSPORT_NAMES.SMTP, SMTP);
    this.register(TRANSPORT_NAMES.MAILGUN, Mailgun);
    this.register(TRANSPORT_NAMES.MAILCHIMP, Mailchimp);
    this.register(TRANSPORT_NAMES.SES, SES);
    this.register(TRANSPORT_NAMES.SNS, SNS);
    this.register(TRANSPORT_NAMES.SENDGRID, Sendgrid);
    this.register(TRANSPORT_NAMES.TWILIO_SMS, TwilioSMS);
    this.register(TRANSPORT_NAMES.TWILIO_CALL, TwilioCall);
    this.register(TRANSPORT_NAMES.TELNYX_SMS, TelnyxSMS);
  }

  /**
   * Register a new transport
   *
   * @param name - Unique name for the transport
   * @param transport - Transport constructor
   * @throws {ConfigurationError} If transport name is already registered
   */
  register(name: string, transport: TransportConstructor): void {
    if (this.transports.has(name)) {
      throw new ConfigurationError(`Transport "${name}" is already registered`);
    }
    this.transports.set(name, transport);
  }

  /**
   * Get a transport by name
   *
   * @param name - Transport name
   * @returns Transport constructor
   * @throws {ConfigurationError} If transport is not found
   */
  get(name: string): TransportConstructor {
    const transport = this.transports.get(name);
    if (!transport) {
      throw new ConfigurationError(`Transport "${name}" not found`);
    }
    return transport;
  }

  /**
   * Check if a transport is registered
   *
   * @param name - Transport name
   * @returns True if transport is registered
   */
  has(name: string): boolean {
    return this.transports.has(name);
  }

  /**
   * Get all registered transport names
   *
   * @returns Array of transport names
   */
  list(): string[] {
    return Array.from(this.transports.keys());
  }

  /**
   * Clear all registered transports (useful for testing)
   */
  clear(): void {
    this.transports.clear();
  }

  /**
   * Reset to default transports
   */
  reset(): void {
    this.clear();
    this.registerDefaultTransports();
  }
}

export default TransportRegistry;
