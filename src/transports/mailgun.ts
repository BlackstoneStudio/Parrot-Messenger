import mailgun from 'mailgun-js';
import request from 'request';

/**
 * Mailgun Email Transport
 * @param message {Object}
 * @param settings {Object}
 * @returns {Promise<unknown>}
 */
export default (message, settings) => new Promise((resolve, reject) => {
  const transport = mailgun(settings.auth);
  const emailData = {
    ...settings.defaults || {},
    ...message,
  };
  if (emailData.attachments) {
    emailData.attachment = request(emailData.attachments[0].path);
    delete emailData.attachments;
  }

  transport.messages().send(emailData, (error, info) => {
    if (error) {
      reject(error);
      return;
    }
    resolve(info);
  });
});
