import SMTP from './transports/smtp';
import Mailgun from './transports/mailgun';
// import MailjetEmail from './transports/mailjet/email';
// import MailjetSMS from './transports/mailjet/sms';
import Mailchimp from './transports/mailchimp';
import SES from './transports/aws/ses';
import SNS from './transports/aws/sns';
import Sendgrid from './transports/sendgrid';
import TwilioSMS from './transports/twilio/sms';
import TwilioCall from './transports/twilio/call';
import TelnyxSMS from './transports/telnyx/sms';
import {
  Envelope, GenericTransport, Settings, Transport,
} from './types';
import { validateEnvelope } from './validation';

const availableTransports = new Map();
availableTransports.set('smtp', SMTP);
availableTransports.set('mailgun', Mailgun);
// availableTransports.set('mailjetEmail', MailjetEmail);
// availableTransports.set('mailjetSMS', MailjetSMS);
availableTransports.set('mailchimp', Mailchimp);
availableTransports.set('ses', SES);
availableTransports.set('sns', SNS);
availableTransports.set('sendgrid', Sendgrid);
availableTransports.set('twilioSMS', TwilioSMS);
availableTransports.set('twilioCall', TwilioCall);
availableTransports.set('telnyxSMS', TelnyxSMS);

const send = async (
  message: Envelope,
  transports: Settings['transports'],
  transportFilter?: Omit<Transport, 'settings'> | Omit<Transport, 'settings'>[],
) => {
  const matchServices = transports.filter((transport) => {
    if (transportFilter) {
      if (Array.isArray(transportFilter)) {
        return transportFilter.some((f) => {
          if (f.name && f.class) {
            return transport.name === f.name && transport.class === f.class;
          }
          if (f.name) {
            return transport.name === f.name;
          }
          if (f.class) {
            return transport.class === f.class;
          }
          return false;
        });
      }

      if (transportFilter.name && transportFilter.class) {
        return transport.name === transportFilter.name && transport.class === transportFilter.class;
      }
      if (transportFilter.name) {
        return transport.name === transportFilter.name;
      }
      if (transportFilter.class) {
        return transport.class === transportFilter.class;
      }
      return false;
    }

    return true;
  });

  if (!matchServices.length) {
    throw new Error(`Transport ${
      Array.isArray(transportFilter) ? transportFilter.map((f) => f.name).join(', ') : transportFilter?.name
    } not found`);
  }

  await Promise.all(matchServices.map(async (transport) => {
    if (!availableTransports.has(transport.name)) {
      throw new Error(`Transport ${transport.name} not found & no mailer function available`);
    }
    const Mailer = availableTransports.get(transport.name);

    const messageData: Envelope = {
      ...transport.settings.defaults,
      ...message,
    };

    try {
      validateEnvelope(messageData, transport.class);
    } catch (validationError) {
      throw new Error(`Validation Error: ${validationError.message}`);
    }

    await (new Mailer(transport.settings) as GenericTransport)
      .send(messageData);
  }));
};

export default send;
