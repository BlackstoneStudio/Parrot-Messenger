import Twilio from 'twilio';
import { htmlToText } from 'html-to-text';
import { Envelope, GenericTransport, TwilioSMS as ITwilioSMS } from '../../types';

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
    await this.transport.messages.create({
      from: request.from || '',
      to: request.to || '',
      body: htmlToText(request.html || request.text || ''),
    });
  }
}

export default TwilioSMS;
