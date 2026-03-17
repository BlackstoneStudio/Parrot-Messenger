import Twilio from 'twilio';
import { htmlToText } from 'html-to-text';
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

    // Build TwiML using Twilio's built-in VoiceResponse builder
    const response = new Twilio.twiml.VoiceResponse();
    response.pause({ length: 1 });
    response.say({ voice: request.voice ? `Polly.${request.voice}` : 'Polly.Joanna' }, textContent);
    const twiml = response.toString();

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
