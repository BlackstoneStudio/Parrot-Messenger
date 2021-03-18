import mailjet from 'node-mailjet';

/**
 * Mailjet Email Transport
 * @param message {Object}
 * @param settings {Object}
 * @returns {Promise<unknown>}
 */
export default (message, settings) => new Promise((resolve, reject) => {
  const transport = mailjet.connect(settings.auth.apiKeyPublic, settings.auth.apiKeyPrivate);
  const emailData = {
    ...settings.defaults || {},
    ...message,
  };

  const messageData = {
    From: {
      Email: emailData.from,
    },
    To: [{
      Email: emailData.to,
    }],
    Subject: emailData.subject,
    HTMLPart: emailData.html,
  };

  const request = transport
    .post('send', { version: 'v3.1' })
    .request({
      Sandbox: false,
      Messages: [messageData],
    });

  request
    .then(async (info) => {
      resolve(info.body);
    })
    .catch((error) => {
      reject(error);
    });
});
