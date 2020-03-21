import nodemailer from 'nodemailer';
import AWS from 'aws-sdk';

/**
 * AWS Email Transport
 * @param message {Object}
 * @param settings {Object}
 * @returns {Promise<unknown>}
 */
export default (message, settings) => new Promise((resolve, reject) => {
  const transportSettings = {
    ...{ apiVersion: '2010-12-01' },
  };
  delete transportSettings.defaults;

  AWS.config.update(settings.auth);

  const transport = nodemailer.createTransport({
    SES: new AWS.SES(transportSettings),
  });

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
