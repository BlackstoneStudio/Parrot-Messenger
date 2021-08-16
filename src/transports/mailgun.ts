import mailgun from 'mailgun-js';
import request from 'request';
import { Envelope, GenericTransport, Mailgun as IMailgun } from '../types';

class Mailgun implements GenericTransport {
  transport: mailgun.Mailgun

  constructor(private settings: IMailgun) {
    this.transport = mailgun(settings.auth);
  }

  async send(message: Envelope) {
    const writableMessage: Envelope & { attachment: any } = {
      ...message,
    } as Envelope & { attachment: any };
    if (writableMessage.attachments) {
      writableMessage.attachment = request(writableMessage.attachments[0].path);
      delete writableMessage.attachments;
    }
    const mailData = {
      ...this.settings.defaults,
      ...writableMessage,
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
