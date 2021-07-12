import * as nodemailer from 'nodemailer';
import SMTPTransport = require('nodemailer/lib/smtp-transport');
import { Envelope, GenericTransport, SMTP as ISMTP } from '../types';

class SMTP implements GenericTransport<nodemailer.Transporter<SMTPTransport.SentMessageInfo>> {
  transport: nodemailer.Transporter<SMTPTransport.SentMessageInfo>

  constructor(private settings: ISMTP) {
    this.transport = nodemailer.createTransport(settings.auth);
  }

  async send(message: Envelope) {
    const request = {
      ...this.settings.defaults,
      ...message,
    };

    await this.transport.sendMail({
      from: request.from,
      to: request.to,
      subject: request.subject,
      html: request.html,
    });
  }
}

export default SMTP;
