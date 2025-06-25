import { Envelope, GenericTransport } from '../../types';
import { TransportError } from '../../errors';

/**
 * Base configuration for AWS transports
 */
export interface AWSConfig {
  auth: {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
  };
  defaults?: Envelope;
}

/**
 * Base class for AWS transports (SES, SNS)
 * Provides common AWS configuration and error handling
 */
export abstract class BaseAWSTransport<T> implements GenericTransport<T> {
  protected region: string;

  protected credentials: {
    accessKeyId: string;
    secretAccessKey: string;
  };

  public abstract transport: T;

  constructor(config: AWSConfig) {
    this.region = config.auth.region;
    this.credentials = {
      accessKeyId: config.auth.accessKeyId,
      secretAccessKey: config.auth.secretAccessKey,
    };
  }

  /**
   * Send message through AWS service
   * Must be implemented by subclasses
   */
  abstract send(envelope: Envelope): Promise<void>;

  /**
   * Wrap AWS errors in TransportError
   */
  protected static wrapError(error: any, transportName: string): never {
    const message = error.message || 'Unknown AWS error';
    const details = {
      code: error.code,
      statusCode: error.$metadata?.httpStatusCode,
      requestId: error.$metadata?.requestId,
    };
    
    throw new TransportError(
      `AWS ${transportName} error: ${message}`,
      transportName,
      details
    );
  }
}