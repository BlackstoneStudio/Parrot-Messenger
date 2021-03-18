import mailchimp from '@mailchimp/mailchimp_transactional';

/**
 * Mailchimp Email Transport
 * @param message {Object}
 * @param settings {Object}
 * @returns {Promise<unknown>}
 */
export default (message, settings) => new Promise(async (resolve, reject) => {
  const transport = mailchimp(settings.auth.apiKey);
  const emailData = {
    ...settings.defaults || {},
    ...message,
  };

  const messageData = {
    key: settings.auth.apiKey,
    message: {
      from_email: emailData.from,
      to: [
        {
          email: emailData.to,
        },
      ],
      html: emailData.html,
      subject: emailData.subject,
    },
  };

  transport
    .messages.send(messageData)
    .then((info) => {
      if (info[0].status === 'rejected') {
        reject(info);
        return;
      }
      resolve(info);
    })
    .catch((error) => {
      reject(error);
    });
});
