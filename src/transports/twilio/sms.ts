import Twilio from 'twilio';
import { htmlToText } from 'html-to-text';
import { Envelope, GenericTransport, TwilioSMS as ITwilioSMS } from '../../types';
import { TransportError } from '../../errors';

class TwilioSMS implements GenericTransport<Twilio.Twilio> {
  transport: Twilio.Twilio;

  constructor(private settings: ITwilioSMS) {
    this.transport = Twilio(settings.auth.sid, settings.auth.token);
  }

  async send(message: Envelope) {
    const request = {
      ...this.settings.defaults,
      ...message,
    };
    try {
      await this.transport.messages.create({
        from: request.from || '',
        to: request.to || '',
        body: htmlToText(request.html || request.text || ''),
      });
    } catch (error) {
      throw new TransportError(
        `Twilio SMS error: ${error instanceof Error ? error.message : String(error)}`,
        'twilioSMS',
        { originalError: error }
      );
    }
  }
}

export default TwilioSMS;
