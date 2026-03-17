import { Telnyx } from 'telnyx';
import { htmlToText } from 'html-to-text';
import { Envelope, GenericTransport, TelnyxSMS } from '../../types';
import { TransportError } from '../../errors';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TelnyxClient = { messages: { send(data: any): Promise<unknown> } };

class TelnyxSMSTransport implements GenericTransport {
  transport: TelnyxClient;

  constructor(
    private settings: TelnyxSMS,
    transport?: TelnyxClient,
  ) {
    this.transport = transport ?? new Telnyx({ apiKey: this.settings.auth.apiKey });
  }

  async send(envelope: Envelope) {
    const messageData = {
      ...this.settings.defaults,
      ...envelope,
    };

    const text = messageData.text || (messageData.html ? htmlToText(messageData.html) : '');
    const isMMS = messageData.mediaUrls && messageData.mediaUrls.length > 0;

    try {
      await this.transport.messages.send({
        from: messageData.from,
        to: messageData.to,
        text,
        ...(isMMS && {
          type: 'MMS' as const,
          media_urls: messageData.mediaUrls,
          subject: messageData.subject,
        }),
      });
    } catch (error) {
      throw new TransportError(
        `Telnyx SMS error: ${error instanceof Error ? error.message : String(error)}`,
        'telnyxSMS',
        { originalError: error },
      );
    }
  }
}

export default TelnyxSMSTransport;
