import mailjet from 'node-mailjet';
import htmlToText from 'html-to-text';

/**
 * Mailjet Email Transport
 * @param message {Object}
 * @param settings {Object}
 * @returns {Promise<unknown>}
 */
export default (message, settings) => new Promise((resolve, reject) => {
  const transport = mailjet.connect(settings.auth.apiKey);

  const body = htmlToText.fromString(message.html);

  const messageData = {
    ...settings.defaults || {},
    ...{
      To: message.to,
      From: message.from || settings.defaults.from,
      Text: body,
    },
  };

  const request = transport
    .post('sms-send', { version: 'v4' })
    .request(messageData);

  request
    .then(async (info) => {
      resolve(info.body);
    })
    .catch((error) => {
      reject(error);
    });
});
