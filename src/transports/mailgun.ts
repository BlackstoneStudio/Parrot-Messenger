import formData from 'form-data';
import Mailgun from 'mailgun.js';
// eslint-disable-next-line import/no-unresolved
import Client from 'mailgun.js/client';
import { Envelope, GenericTransport, Mailgun as IMailgun } from '../types';

class MailgunTransport implements GenericTransport {
  transport: Client;

  private mailgun = new Mailgun(formData);

  constructor(private settings: IMailgun) {
    this.transport = this.mailgun.client({
      username: 'api',
      key: this.settings.auth.apiKey,
    });
  }

  async send(message: Envelope) {
    const mailData = {
      ...this.settings.defaults,
      ...message,
    };
    const data: any = {
      from: mailData.from,
      to: mailData.to,
      subject: mailData.subject,
      text: mailData.text,
      html: mailData.html,
      attachments: mailData.attachments,
    };
    if (mailData.attachments) data.attachment = mailData.attachments;
    await this.transport.messages.create(this.settings.auth.domain, data);
  }
}

export default MailgunTransport;
