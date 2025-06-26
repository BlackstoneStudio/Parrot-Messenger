import Twilio from 'twilio';
import { htmlToText } from 'html-to-text';
import { create } from 'xmlbuilder2';
import { Envelope, GenericTransport, TwilioCall as ITwilioCall } from '../../types';

class TwilioCall implements GenericTransport<Twilio.Twilio> {
  transport: Twilio.Twilio;

  constructor(private settings: ITwilioCall) {
    this.transport = Twilio(settings.auth.sid, settings.auth.token);
  }

  async send(message: Envelope) {
    const request = {
      ...this.settings.defaults,
      ...message,
    };

    const textContent = htmlToText(request.html || request.text || '');

    // Build TwiML using XML builder to prevent injection attacks
    const twiml = create({ version: '1.0', encoding: 'UTF-8' })
      .ele('Response')
      .ele('Pause')
      .att('length', '1')
      .up()
      .ele('Say')
      .att('voice', 'Polly.Joanna')
      .txt(textContent)
      .up()
      .end({ prettyPrint: true });

    await this.transport.calls.create({
      from: request.from || '',
      to: request.to || '',
      twiml,
    });
  }
}

export default TwilioCall;
