import { createTransport, Transporter } from 'nodemailer';
import * as AWS from 'aws-sdk';
import { AWSSESConfig, Envelope, GenericTransport } from '../../types';

class SES implements GenericTransport<Transporter> {
  private transportSettings = {
    apiVersion: '2010-12-01',
  };

  transport: Transporter

  constructor(private settings: AWSSESConfig) {
    AWS.config.update(settings.auth);

    this.transport = createTransport({
      SES: new AWS.SES(this.transportSettings),
    });
  }

  async send(envelope: Envelope) {
    const request = {
      ...this.settings.defaults,
      ...envelope,
    };

    await this.transport.sendMail({
      from: request.from,
      to: request.to,
      subject: request.subject,
      html: request.html,
    });
  }
}

export default SES;
