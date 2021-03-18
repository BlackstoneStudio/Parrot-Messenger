import nodemailer from 'nodemailer';

/**
 * Mailgun Email Transport
 * @param email {Object}
 * @param settings {Object}
 * @returns {Promise<unknown>}
 */
export default (message, settings) => new Promise((resolve, reject) => {
  const transportSettings = { ...settings };
  delete transportSettings.defaults;

  const transport = nodemailer.createTransport(transportSettings);

  const emailData = {
    ...settings.defaults || {},
    ...message,
  };

  transport.sendMail(emailData, (error, info) => {
    if (error) {
      reject(error);
      return;
    }
    resolve(info);
  });
});
