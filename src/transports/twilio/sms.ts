import * as Twilio from 'twilio';
import { htmlToText } from 'html-to-text';
import { Envelope, GenericTransport, TwilioSMS as ITwilioSMS } from '../../types';

class TwilioSMS implements GenericTransport<Twilio.Twilio> {
  transport: Twilio.Twilio

  constructor(private setttings: ITwilioSMS) {
    this.transport = Twilio(setttings.auth.sid, setttings.auth.token);
  }

  async send(message: Envelope) {
    const request = {
      ...this.setttings.defaults,
      ...message,
    };
    await this.transport.messages.create({
      from: request.from,
      to: request.to,
      body: htmlToText(request.html),
    });
  }
}

export default TwilioSMS;
