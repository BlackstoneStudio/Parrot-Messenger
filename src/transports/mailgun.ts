import * as mailgun from 'mailgun-js';
// import * as request from 'request';
import { Envelope, GenericTransport, Mailgun as IMailgun } from '../types';

/* if (emailData.attachments) {
    emailData.attachment = request(emailData.attachments[0].path);
    delete emailData.attachments;
  } */

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
    });
  }
}

export default Mailgun;
