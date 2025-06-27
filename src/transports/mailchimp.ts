import mailchimp from '@mailchimp/mailchimp_transactional/src/index';
import { Envelope, GenericTransport, Mailchimp as IMailchimp } from '../types';
import { TransportError } from '../errors';

class Mailchimp implements GenericTransport<any> {
  public transport: any;

  constructor(private settings: IMailchimp) {
    this.transport = mailchimp(settings.auth.apiKey);
  }

  async send(message: Envelope) {
    const request = {
      ...this.settings.defaults,
      ...message,
    };

    const mailchimpMessage: any = {
      from_email: request.from || '',
      to: [
        {
          email: request.to || '',
          type: 'to',
        },
      ],
      html: request.html,
      subject: request.subject,
    };

    // Convert attachments to Mailchimp format
    if (request.attachments && request.attachments.length > 0) {
      mailchimpMessage.attachments = request.attachments.map((attachment: any) => {
        // Already in Mailchimp format
        if ('content' in attachment && 'name' in attachment && 'type' in attachment) {
          return attachment;
        }
        // Convert from other formats - this is a simplified conversion
        return {
          type: 'application/octet-stream',
          name: attachment.filename || 'attachment',
          content: attachment.data || attachment.content || '',
        };
      });
    }

    try {
      await this.transport.messages.send({
        key: this.settings.auth.apiKey,
        message: mailchimpMessage,
      });
    } catch (error) {
      throw new TransportError(
        `Mailchimp error: ${error instanceof Error ? error.message : String(error)}`,
        'mailchimp',
        { originalError: error },
      );
    }
  }
}

export default Mailchimp;
