import mailgun from 'mailgun-js';
import { Envelope, GenericTransport, Mailgun as IMailgun } from '../types';

class Mailgun implements GenericTransport {
  transport: mailgun.Mailgun

  constructor(private settings: IMailgun) {
    this.transport = mailgun(settings.auth);
  }

  async send(message: Envelope) {
    const mailData = {
      ...this.settings.defaults,
      ...message,
    };

    await this.transport.messages().send({
      from: mailData.from,
      to: mailData.to,
      subject: mailData.subject,
      html: mailData.html,
      attachment: mailData.attachment,
    });
  }
}

export default Mailgun;
