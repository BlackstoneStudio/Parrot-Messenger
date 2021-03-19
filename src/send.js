import smtp from './transports/smtp';
import mailgun from './transports/mailgun';
import mailjetEmail from './transports/mailjet/email';
import mailjetSMS from './transports/mailjet/sms';
import mailchimp from './transports/mailchimp';
import ses from './transports/aws/ses';
import sendgrid from './transports/sendgrid';
import twilioSMS from './transports/twilio/sms';
import twilioCall from './transports/twilio/call';

/**
 * Message Sending Service
 * @param message {Object}
 * @param settings {Object}
 * @param transportFilter {String|Array|Object}
 * @returns {Promise<{success: boolean}>}
 */
const send = async (message, settings, transportFilter) => {
  const availableTransports = {
    smtp,
    mailgun,
    mailjetEmail,
    mailjetSMS,
    mailchimp,
    ses,
    sendgrid,
    twilioSMS,
    twilioCall,
  };

  let transports = [...settings.transports];
  const isMultiSend = Array.isArray(transportFilter);

  if (transportFilter) {
    const matchServices = settings.transports.filter((e) => {
      if (Array.isArray(transportFilter)) {
        return transportFilter.indexOf(e.name) !== -1;
      }

      if (transportFilter.class) {
        return e.class === transportFilter.class;
      }

      return e.name === transportFilter;
    });
    if (!matchServices.length) {
      throw new Error(`Parrot Messenger [Send]: Transport ${transportFilter.join(', ')} not found`);
    }
    transports = [
      ...matchServices,
    ];
  }

  const errors = [];
  let response = null;

  for (let i = 0; i < transports.length; i++) {
    if (i > 0 && errors.length === 0 && !isMultiSend) return;
    const transport = transports[i];

    try {
      if (availableTransports[transports.name] && !transport.mailer) {
        throw new Error(`Parrot Messenger [Send]: Transport ${transport.name} not found & no mailer function available`);
      }
      const mailer = availableTransports[transport.name] || transport.mailer;

      const messageData = {
        ...transport.defaults,
        ...message,
      };

      // eslint-disable-next-line
      response = await mailer(messageData, transport.settings);
    } catch (e) {
      errors.push({
        transport: transport.name,
        error: e.message,
      });
    }
  }

  const success = errors.length !== transports.length;

  const result = {
    success,
  };

  if (errors.length) {
    result.errors = errors;
  }

  if (response) {
    result.response = response;
  }

  // eslint-disable-next-line
  return result;
};

export default send;
