import Telnyx from 'telnyx';
import { Envelope, GenericTransport, TelnyxSMS } from '../../types';

interface TelnyxClient {
  messages: {
    create(data: Record<string, unknown>): Promise<unknown>;
  };
}

class TelnyxSMSTransport implements GenericTransport {
  transport: TelnyxClient;

  constructor(private settings: TelnyxSMS) {
    this.transport = new Telnyx(this.settings.auth.apiKey);
  }

  async send(envelope: Envelope) {
    const messageData = {
      ...this.settings.defaults,
      ...envelope,
    };

    await this.transport.messages.create({
      from: messageData.from,
      to: messageData.to,
      text: messageData.text || messageData.html,
    });
  }
}

export default TelnyxSMSTransport;
