import * as aws from '@aws-sdk/client-ses';
import { Transporter, createTransport } from 'nodemailer';
import { AWSSESConfig, Envelope, GenericTransport } from '../../types';

class SES implements GenericTransport<Transporter> {
  transport: Transporter;

  constructor(private settings: AWSSESConfig) {
    const ses = new aws.SES({
      apiVersion: '2010-12-01',
      region: settings.auth.region,
      credentials: {
        accessKeyId: settings.auth.accessKeyId,
        secretAccessKey: settings.auth.secretAccessKey,
      },
    });

    this.transport = createTransport({
      SES: { ses, aws },
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
