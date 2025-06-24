import SendgridMail from '@sendgrid/mail';
import { Envelope, GenericTransport, Sendgrid as ISendgrid } from '../types';

interface SendgridTransport {
  setApiKey(apiKey: string): void;
  send(data: Record<string, unknown>): Promise<unknown>;
}

class Sendgrid implements GenericTransport {
  public transport: SendgridTransport;

  constructor(
    private settings: ISendgrid,
    transport: SendgridTransport = SendgridMail as unknown as SendgridTransport,
  ) {
    this.transport = transport;
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
