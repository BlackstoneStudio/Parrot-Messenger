import { SNS } from '@aws-sdk/client-sns';
import { Envelope, GenericTransport, AWSSNS } from '../../types';

class SNSTransport implements GenericTransport {
  transport: SNS;

  constructor(private settings: AWSSNS) {
    this.transport = new SNS({
      region: settings.auth.region,
      credentials: {
        accessKeyId: settings.auth.accessKeyId,
        secretAccessKey: settings.auth.secretAccessKey,
      },
    });
  }

  async send(envelope: Envelope) {
    const request = {
      ...this.settings.defaults,
      ...envelope,
    };

    // For SMS, the subject is not used, only the text content
    const message = request.text || request.html || '';

    await this.transport.publish({
      Message: message,
      PhoneNumber: request.to,
      MessageAttributes: {
        'AWS.SNS.SMS.SenderID': {
          DataType: 'String',
          StringValue: request.from || 'ParrotSMS',
        },
        'AWS.SNS.SMS.SMSType': {
          DataType: 'String',
          StringValue: this.settings.smsType || 'Transactional',
        },
      },
    });
  }
}

export default SNSTransport;
