import { Envelope, GenericTransport, Settings, Transport } from './types';
import { validateEnvelope } from './validation';
import { ConfigurationError, ValidationError } from './errors';
import TransportRegistry from './registry/TransportRegistry';
import { withRetry } from './utils/retry';

const send = async (
  message: Envelope,
  transports: Settings['transports'],
  transportFilter?: Omit<Transport, 'settings'> | Omit<Transport, 'settings'>[],
) => {
  const matchServices = transports.filter((transport) => {
    if (transportFilter) {
      if (Array.isArray(transportFilter)) {
        return transportFilter.some((f) => {
          if (f.name && f.class) {
            return transport.name === f.name && transport.class === f.class;
          }
          if (f.name) {
            return transport.name === f.name;
          }
          if (f.class) {
            return transport.class === f.class;
          }
          return false;
        });
      }

      if (transportFilter.name && transportFilter.class) {
        return transport.name === transportFilter.name && transport.class === transportFilter.class;
      }
      if (transportFilter.name) {
        return transport.name === transportFilter.name;
      }
      if (transportFilter.class) {
        return transport.class === transportFilter.class;
      }
      return false;
    }

    return true;
  });

  if (!matchServices.length) {
    throw new ConfigurationError(
      `Transport ${
        Array.isArray(transportFilter)
          ? transportFilter.map((f) => f.name).join(', ')
          : transportFilter?.name
      } not found`,
    );
  }

  const registry = TransportRegistry.getInstance();

  await Promise.all(
    matchServices.map(async (transport) => {
      if (!registry.has(transport.name)) {
        throw new ConfigurationError(
          `Transport ${transport.name} not found & no mailer function available`,
        );
      }
      const Mailer = registry.get(transport.name);

      const messageData: Envelope = {
        ...transport.settings.defaults,
        ...message,
      };

      try {
        validateEnvelope(messageData, transport.class);
      } catch (validationError) {
        if (validationError instanceof ValidationError) {
          throw validationError;
        }
        throw new ValidationError(
          `Validation Error: ${validationError instanceof Error ? validationError.message : String(validationError)}`,
        );
      }

      const transportInstance = new Mailer(transport.settings) as GenericTransport;

      await withRetry(() => transportInstance.send(messageData), transport.name, {
        maxRetries: transport.settings.retryOptions?.maxRetries,
        initialDelay: transport.settings.retryOptions?.initialDelay,
        maxDelay: transport.settings.retryOptions?.maxDelay,
        factor: transport.settings.retryOptions?.factor,
      });
    }),
  );
};

export default send;
