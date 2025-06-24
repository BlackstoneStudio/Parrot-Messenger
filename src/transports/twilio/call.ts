import Twilio from 'twilio';
import { htmlToText } from 'html-to-text';
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

    const textContent = htmlToText(request.html)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

    await this.transport.calls.create({
      from: request.from,
      to: request.to,
      twiml: `
        <Response>
          <Pause length="1"/>
          <Say voice="Polly.Joanna">
            ${textContent}
          </Say>
        </Response> 
      `,
    });
  }
}

export default TwilioCall;
