import Parrot from './src/main';

Parrot.init({
  defaultEmail: 'Parrot Mailer me@parrotmessenger.com',
  transports: [
    {
      name: 'aws',
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
      name: 'twilioCall',
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
  letItParrot: true,
});


Parrot.templates.register({
  name: 'Test Template',
  html: '<p>Hey there {{name}}!!</p>',
});

Parrot.templates.send(
  'Test Template',
  {
    // to: '523325481771‬',
    // to: 'bernardo@nishikawa.co',
    subject: 'Testing',
  },
  { name: 'Parrot' },
  'mailgun', // optional
).then((res) => {
  console.log('SEND TEMPALTE OUTPUT', res);
});
