import { Resend as ResendSDK } from 'resend';
import { Envelope, GenericTransport, Resend as IResend } from '../types';
import { TransportError } from '../errors';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ResendEmails = { send(data: any): Promise<{ data: unknown; error: unknown }> };

class Resend implements GenericTransport {
  public transport: ResendEmails;

  constructor(
    private settings: IResend,
    transport?: ResendEmails,
  ) {
    this.transport = transport ?? new ResendSDK(settings.auth.apiKey).emails;
  }

  async send(message: Envelope) {
    const request = {
      ...this.settings.defaults,
      ...message,
    };

    try {
      const { error } = await this.transport.send({
        from: request.from,
        to: request.to,
        subject: request.subject,
        text: request.text,
        html: request.html,
        attachments: request.attachments,
      });

      if (error) {
        throw new Error(
          typeof error === 'object' && 'message' in error
            ? String((error as { message: unknown }).message)
            : String(error),
        );
      }
    } catch (error) {
      if (error instanceof TransportError) {
        throw error;
      }
      throw new TransportError(
        `Resend error: ${error instanceof Error ? error.message : String(error)}`,
        'resend',
        { originalError: error },
      );
    }
  }
}

export default Resend;
