import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { Transporter, createTransport } from 'nodemailer';
import { AWSSESConfig, Envelope, GenericTransport } from '../../types';

class SES implements GenericTransport<Transporter> {
  private sesClient: SESClient;

  transport: Transporter;

  constructor(private settings: AWSSESConfig) {
    this.sesClient = new SESClient(settings.auth);

    this.transport = createTransport({
      SES: { ses: this.sesClient },
    });
  }

  async send(envelope: Envelope) {
    const request = {
      ...this.settings.defaults,
      ...envelope,
    };

    const sendEmailCommand = new SendEmailCommand({
      Source: request.from,
      Destination: { ToAddresses: [request.to] },
      Message: {
        Subject: { Data: request.subject },
        Body: { Html: { Data: request.html } },
      },
    });

    await this.sesClient.send(sendEmailCommand);
  }
}

export default SES;
