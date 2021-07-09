import * as mailjet from 'node-mailjet';
import { Envelope, GenericTransport, MailjetEmail as TMailjetEmail } from '../../types';

class MailjetEmail implements GenericTransport<mailjet.Email.PostResource> {
  public transport: mailjet.Email.PostResource

  constructor(private settings: TMailjetEmail) {
    this.transport = mailjet.connect(
      settings.auth.apiKeyPublic,
      settings.auth.apiKeyPrivate,
    ).post('send', { version: 'v3.1' });
  }

  async send(envelope: Envelope) {
    const request = {
      ...this.settings.defaults,
      ...envelope,
    };

    await this.transport.request({
      Messages: [{
        From: {
          Email: request.from,
        },
        To: [{
          Email: request.to,
        }],
        Subject: request.subject,
        HTMLPart: request.html,
      }],
    });
  }
}

export default MailjetEmail;
