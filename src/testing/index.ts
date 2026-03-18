import { Envelope, GenericTransport, Defaults } from '../types';
import TransportRegistry from '../registry/TransportRegistry';

export interface MockMessage {
  envelope: Envelope;
  timestamp: Date;
}

export interface MockTransportOptions extends Defaults {
  shouldFail?: boolean;
  failMessage?: string;
  latency?: number;
}

class MockTransport implements GenericTransport<Record<string, never>> {
  public transport: Record<string, never> = {};

  private static store: MockMessage[] = [];

  private shouldFail: boolean;

  private failMessage: string;

  private latency: number;

  constructor(private settings: MockTransportOptions = {}) {
    this.shouldFail = settings.shouldFail ?? false;
    this.failMessage = settings.failMessage ?? 'Mock transport simulated failure';
    this.latency = settings.latency ?? 0;
  }

  async send(envelope: Envelope): Promise<void> {
    if (this.latency > 0) {
      await new Promise((resolve) => {
        setTimeout(resolve, this.latency);
      });
    }

    if (this.shouldFail) {
      throw new Error(this.failMessage);
    }

    const merged: Envelope = {
      ...this.settings.defaults,
      ...envelope,
    };

    MockTransport.store.push({
      envelope: merged,
      timestamp: new Date(),
    });
  }

  static get messages(): ReadonlyArray<MockMessage> {
    return MockTransport.store;
  }

  static get lastMessage(): MockMessage | undefined {
    return MockTransport.store[MockTransport.store.length - 1];
  }

  static clear(): void {
    MockTransport.store = [];
  }

  static register(): void {
    const registry = TransportRegistry.getInstance();
    if (!registry.has('mock')) {
      registry.register('mock', MockTransport as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    }
  }

  static unregister(): void {
    const registry = TransportRegistry.getInstance();
    if (registry.has('mock')) {
      registry.reset();
    }
  }
}

export { MockTransport };
export default MockTransport;
