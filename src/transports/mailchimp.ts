import mailchimp from '@mailchimp/mailchimp_transactional/src/index';
import { Envelope, GenericTransport, Mailchimp as IMailchimp } from '../types';

class Mailchimp implements GenericTransport<any> {
  transport;

  constructor(private settings: IMailchimp) {
    this.transport = mailchimp(settings.auth.apiKey);
  }

  async send(message: Envelope) {
    const request = {
      ...this.settings.defaults,
      ...message,
    };

    await this.transport.messages.send({
      key: this.settings.auth.apiKey,
      message: {
        from_email: request.from,
        to: [
          {
            email: request.to,
          },
        ],
        html: request.html,
        subject: request.subject,
        attachments: request.attachments,
      },
    });
  }
}

export default Mailchimp;
