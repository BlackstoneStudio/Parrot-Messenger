import Sengrid from '@sendgrid/mail';

/**
 * Sendgrid Email Transport
 * @param email
 * @param settings
 * @returns {Promise<unknown>}
 */
export default (message, settings) => new Promise((resolve, reject) => {
  const transport = Sengrid.setApiKey(settings.auth.apiKey);
  const emailData = {
    ...settings.defaults || {},
    ...message,
  };

  // TODO: Implement Attachment Translator

  transport.send(emailData, (error, info) => {
    if (error) {
      reject(error);
      return;
    }
    resolve(info);
  });
});
