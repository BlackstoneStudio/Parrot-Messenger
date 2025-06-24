import formData from 'form-data';
// eslint-disable-next-line import/no-unresolved
import Mailgun from 'mailgun.js';
import { Envelope, GenericTransport, Mailgun as IMailgun } from '../types';

interface MailgunClient {
  messages: {
    create(domain: string, data: Record<string, unknown>): Promise<unknown>;
  };
}

class MailgunTransport implements GenericTransport {
  transport: MailgunClient;

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
    const data: Record<string, unknown> = {
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
