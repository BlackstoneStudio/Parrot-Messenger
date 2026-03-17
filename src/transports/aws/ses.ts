import * as aws from '@aws-sdk/client-ses';
import { Transporter, createTransport } from 'nodemailer';
import { AWSSESConfig, Envelope } from '../../types';
import { BaseAWSTransport } from './base';

class SES extends BaseAWSTransport<Transporter> {
  transport: Transporter;

  constructor(private settings: AWSSESConfig) {
    super(settings);

    const ses = new aws.SES({
      apiVersion: '2010-12-01',
      region: this.region,
      credentials: this.credentials,
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

    try {
      await this.transport.sendMail(request);
    } catch (error) {
      BaseAWSTransport.wrapError(error, 'SES');
    }
  }
}

export default SES;
