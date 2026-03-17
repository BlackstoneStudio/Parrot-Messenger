import * as PostmarkSDK from 'postmark';
import { Envelope, GenericTransport, Postmark as IPostmark } from '../types';
import { TransportError } from '../errors';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PostmarkClient = { sendEmail(data: any): Promise<unknown> };

class Postmark implements GenericTransport {
  public transport: PostmarkClient;

  constructor(
    private settings: IPostmark,
    transport?: PostmarkClient,
  ) {
    this.transport = transport ?? new PostmarkSDK.ServerClient(settings.auth.serverToken);
  }

  async send(message: Envelope) {
    const request = {
      ...this.settings.defaults,
      ...message,
    };

    try {
      await this.transport.sendEmail({
        From: request.from,
        To: request.to,
        Subject: request.subject,
        TextBody: request.text,
        HtmlBody: request.html,
        Attachments: request.attachments,
      });
    } catch (error) {
      throw new TransportError(
        `Postmark error: ${error instanceof Error ? error.message : String(error)}`,
        'postmark',
        { originalError: error },
      );
    }
  }
}

export default Postmark;
