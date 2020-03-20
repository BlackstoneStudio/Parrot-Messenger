import smtp from './transports/smtp';
import mailgun from './transports/mailgun';
import aws from './transports/aws';
import sendgrid from './transports/sendgrid';
import twilioSMS from './transports/twilio/sms';
import twilioCall from './transports/twilio/call';

/**
 * Message Sending Service
 * @param message
 * @param settings
 * @param uniqueTransport
 * @returns {Promise<{success: boolean}>}
 */
const send = async (message, settings, uniqueTransport) => {
  const availableTransports = {
    smtp,
    mailgun,
    aws,
    sendgrid,
    twilioSMS,
    twilioCall,
  };

  let transports = [...settings.transports];

  if (uniqueTransport) {
    const matchService = settings.transports.find((e) => e.name === uniqueTransport);
    if (!matchService) {
      throw new Error(`Parrot Messenger [Send]: Transport ${uniqueTransport} not found`);
    }
    transports = [
      matchService,
    ];
  }

  const errors = [];
  let response = null;

  for (let i = 0; i < transports.length; i++) {
    if (i > 0 && errors.length === 0) return;
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
