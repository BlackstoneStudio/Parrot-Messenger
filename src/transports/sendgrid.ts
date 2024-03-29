import SendgridMail from '@sendgrid/mail';
import { Envelope, GenericTransport, Sendgrid as ISendgrid } from '../types';

class Sendgrid implements GenericTransport {
  constructor(private settings: ISendgrid, public transport: any = SendgridMail) {
    this.transport.setApiKey(settings.auth.apiKey);
  }

  async send(message: Envelope) {
    const request = {
      ...this.settings.defaults,
      ...message,
    };

    await this.transport.send({
      from: request.from,
      to: request.to,
      subject: request.subject,
      html: request.html,
      attachments: request.attachments,
    });
  }
}

export default Sendgrid;
