import Twilio from 'twilio';
import { htmlToText } from 'html-to-text';
import { create } from 'xmlbuilder2';
import { Envelope, GenericTransport, TwilioCall as ITwilioCall } from '../../types';
import { TransportError } from '../../errors';

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
      .att('voice', request.voice ? `Polly.${request.voice}` : 'Polly.Joanna')
      .txt(textContent)
      .up()
      .end({ prettyPrint: true });

    try {
      await this.transport.calls.create({
        from: request.from || '',
        to: request.to || '',
        twiml,
      });
    } catch (error) {
      throw new TransportError(
        `Twilio Call error: ${error instanceof Error ? error.message : String(error)}`,
        'twilioCall',
        { originalError: error },
      );
    }
  }
}

export default TwilioCall;
