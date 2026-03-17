import formData from 'form-data';
// eslint-disable-next-line import/no-unresolved
import Mailgun from 'mailgun.js';
import { Envelope, GenericTransport, Mailgun as IMailgun } from '../types';
import { TransportError } from '../errors';

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
    };
    if (mailData.attachments) {
      data.attachment = mailData.attachments;
    }

    try {
      await this.transport.messages.create(this.settings.auth.domain, data);
    } catch (error) {
      throw new TransportError(
        `Mailgun error: ${error instanceof Error ? error.message : String(error)}`,
        'mailgun',
        { originalError: error },
      );
    }
  }
}

export default MailgunTransport;
