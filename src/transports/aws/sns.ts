import { SNS } from '@aws-sdk/client-sns';
import { Envelope, AWSSNS } from '../../types';
import { BaseAWSTransport } from './base';

class SNSTransport extends BaseAWSTransport<SNS> {
  transport: SNS;

  constructor(private settings: AWSSNS) {
    super(settings);

    this.transport = new SNS({
      region: this.region,
      credentials: this.credentials,
    });
  }

  async send(envelope: Envelope) {
    const request = {
      ...this.settings.defaults,
      ...envelope,
    };

    // For SMS, the subject is not used, only the text content
    const message = request.text || request.html || '';

    try {
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
    } catch (error) {
      BaseAWSTransport.wrapError(error, 'SNS');
    }
  }
}

export default SNSTransport;
