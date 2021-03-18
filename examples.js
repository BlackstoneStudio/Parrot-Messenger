import Parrot from './src';

Parrot.init({
  transports: [
    {
      name: 'mailchimp',
      settings: {
        auth: {
          apiKey: '26QSqaIxFOBKoZkj6jYLkw',
        },
        defaults: {
          from: 'me@parrotmessenger.com',
        },
      },
    },
    {
      name: 'mailjet',
      settings: {
        auth: {
          apiKeyPublic: 'XXXX',
          apiKeyPrivate: 'XXXX',
        },
        defaults: {
          from: 'me@parrotmessenger.com',
        },
      },
    },
    {
      name: 'mailjet',
      settings: {
        auth: {
          apiKeyPublic: 'XXXX',
          apiKeyPrivate: 'XXXX',
        },
        defaults: {
          from: 'me@parrotmessenger.com',
        },
      },
    },
    {
      name: 'ses',
      settings: {
        auth: {
          secretAccessKey: '/smgt0t1ShhvY1',
          accessKeyId: '',
          region: 'us-east-1',
        },
        defaults: {
          from: 'me@parrotmessenger.com',
        },
      },
    },
    {
      name: 'smtp',
      settings: {
        host: 'smtp.gmail.com',
        port: '587',
        secure: true,
        auth: {
          user: '',
          pass: '',
        },
        defaults: {
          from: 'Parrot Mailer me@parrotmessenger.com',
        },
      },
    },
    {
      name: 'mailgun',
      settings: {
        auth: {
          domain: 'email.parrotmessenger.com',
          apiKey: '',
        },
        defaults: {
          from: 'me@parrotmessenger.com',
        },
      },
    },
    {
      name: 'twilioSMS',
      settings: {
        auth: {
          sid: '',
          token: '',
        },
        defaults: {
          from: '14152149707',
        },
      },
    },
  ],
});

Parrot.templates.register({
  name: 'Test Template',
  html: '<p>Hey there {{name}}!!</p>',
});

Parrot.templates.send(
  'Test Template',
  {
    // to: '523325481771‬',
    to: 'bernardo@nishikawa.co',
    subject: 'Testing',
  },
  // Sample Data for Template
  { name: 'User' },
  { class: 'email', name: 'mailchimp' },
)
  .then((res) => {
    console.log('SEND TEMPALTE OUTPUT', res);
  });
