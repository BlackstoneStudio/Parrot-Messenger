import Telnyx from 'telnyx';
import { htmlToText } from 'html-to-text';
import { Envelope, GenericTransport, TelnyxSMS } from '../../types';
import { TransportError } from '../../errors';

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

    try {
      await this.transport.messages.create({
        from: messageData.from,
        to: messageData.to,
        text: messageData.text || (messageData.html ? htmlToText(messageData.html) : ''),
      });
    } catch (error) {
      throw new TransportError(
        `Telnyx SMS error: ${error instanceof Error ? error.message : String(error)}`,
        'telnyxSMS',
        { originalError: error }
      );
    }
  }
}

export default TelnyxSMSTransport;
