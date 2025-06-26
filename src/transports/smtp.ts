import * as nodemailer from 'nodemailer';
import * as SMTPTransport from 'nodemailer/lib/smtp-transport';
import { Envelope, GenericTransport, SMTP as ISMTP } from '../types';
import { TransportError } from '../errors';

class SMTP implements GenericTransport<nodemailer.Transporter<SMTPTransport.SentMessageInfo>> {
  transport: nodemailer.Transporter<SMTPTransport.SentMessageInfo>;

  constructor(private settings: ISMTP) {
    this.transport = nodemailer.createTransport(settings.auth);
  }

  async send(message: Envelope) {
    const request = {
      ...this.settings.defaults,
      ...message,
    };

    try {
      await this.transport.sendMail({
        from: request.from,
        to: request.to,
        subject: request.subject,
        text: request.text,
        html: request.html,
        attachments: request.attachments,
      });
    } catch (error) {
      throw new TransportError(
        `SMTP error: ${error instanceof Error ? error.message : String(error)}`,
        'smtp',
        { originalError: error }
      );
    }
  }
}

export default SMTP;
