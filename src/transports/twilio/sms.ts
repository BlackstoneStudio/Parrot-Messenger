import Twilio from 'twilio';
import htmlToText from 'html-to-text';

/**
 * Twilio Email Transport
 * @param message {Object}
 * @param settings {Object}
 * @returns {Promise<unknown>}
 */
export default (message, settings) => new Promise((resolve, reject) => {
  const transport = Twilio(settings.auth.sid, settings.auth.token);

  const body = htmlToText.fromString(message.html);

  const messageData = {
    ...settings.defaults || {},
    ...{
      to: message.to,
      from: message.from || settings.defaults.from,
      body,
    },
  };

  transport.messages
    .create(messageData)
    .then((info) => {
      resolve(info);
    }).catch((error) => {
      reject(error);
    });
});
