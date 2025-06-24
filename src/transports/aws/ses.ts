import AWS from 'aws-sdk';
import { Transporter, createTransport } from 'nodemailer';
import { AWSSESConfig, Envelope, GenericTransport } from '../../types';

class SES implements GenericTransport<Transporter> {
  private transportSettings = {
    apiVersion: '2010-12-01',
  };

  transport: Transporter;

  constructor(private settings: AWSSESConfig) {
    const sesClient = new AWS.SES({
      ...this.transportSettings,
      ...settings.auth,
    });

    this.transport = createTransport({
      SES: sesClient,
    });
  }

  async send(envelope: Envelope) {
    const request = {
      ...this.settings.defaults,
      ...envelope,
    };

    await this.transport.sendMail(request);
  }
}

export default SES;
