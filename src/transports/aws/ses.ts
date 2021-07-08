import { createTransport, Transporter } from 'nodemailer';
import * as AWS from 'aws-sdk';
import { AWSSESConfig, GenericTransport } from '../../types';

class SES implements GenericTransport {
  private transportSettings = {
    apiVersion: '2010-12-01',
  };

  public transport: Transporter

  constructor(settings: AWSSESConfig) {
    AWS.config.update(settings.auth);

    this.transport = createTransport({
      SES: new AWS.SES(this.transportSettings),
    });
  }
}

export default SES;
