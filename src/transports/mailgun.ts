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
    await this.transport.messages.create(this.settings.auth.domain, {
      from: mailData.from,
      to: mailData.to,
      subject: mailData.subject,
      text: mailData.text,
      html: mailData.html,
      attachment: mailData.attachments,
    });
  }
}

export default MailgunTransport;
