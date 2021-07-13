import Parrot from '../src';

/**
 * Mailgun Example Settings
 */
const mailgun = {
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
};

/**
 * Mailchimp Example Settings
 */
const mailchimp = {
  name: 'mailchimp',
  settings: {
    auth: {
      apiKey: 'XXX',
    },
    defaults: {
      from: 'me@parrotmessenger.com',
    },
  },
};

/**
 * AWS SES Example Settings
 */
const ses = {
  name: 'ses',
  settings: {
    auth: {
      secretAccessKey: 'XXX',
      accessKeyId: '',
      region: '',
    },
    defaults: {
      from: 'me@parrotmessenger.com',
    },
  },
};

/**
 * Sendgrid Example Settings
 */

const sendgrid = {
  name: 'sendgrid',
  settings: {
    auth: {
      apiKeyPublic: 'XXXX',
      apiKeyPrivate: 'XXXX',
    },
    defaults: {
      from: 'me@parrotmessenger.com',
    },
  },
};

/**
 * Mailjet Email Example Settings
 */
const mailjetEmail = {
  name: 'mailjetEmail',
  settings: {
    auth: {
      apiKeyPublic: 'XXX',
      apiKeyPrivate: 'XXX',
    },
    defaults: {
      from: 'me@parrotmessenger.com',
    },
  },
};

/**
 * Mailjet SMS Example Settings
 */
const mailjetSMS = {
  name: 'mailjetSMS',
  settings: {
    auth: {
      apiKey: 'XXXX',
    },
    defaults: {
      from: 'MJPilot',
    },
  },
};

/**
 * Twilio SMS Example Settings
 */
const twilioSMS = {
  name: 'twilioSMS',
  settings: {
    auth: {
      sid: '',
      token: '',
    },
    defaults: {
      from: '15555555555',
    },
  },
};

/**
 * Twilio Call Example Settings
 */
const twilioCall = {
  name: 'twilioCall',
  settings: {
    auth: {
      sid: '',
      token: '',
    },
    defaults: {
      from: '15555555555',
    },
  },
};

/**
 * SMTP Example Settings
 */
const smtp = {
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
};

Parrot.init({
  transports: [
    mailgun,
    mailchimp,
    ses,
    sendgrid,
    mailjetEmail,
    mailjetSMS,
    twilioSMS,
    twilioCall,
    smtp,
  ],
});

/**
 * Standard HTML Template
 */
Parrot.templates.register({
  name: 'HTML Template',
  html: '<p>Hey there {{name}}!!</p> {{date}}',
});

/**
 * Remote Async Template
 */
Parrot.templates.register({
  name: 'Async Template',
  // Request is a standard Axios type object
  // with an additional resolve parameter
  // that resolves the response of the object
  // API reference for Axios:
  // https://github.com/axios/axios#axios-api
  request: {
    method: 'GET',
    url: 'https://reqres.in/api/unknown/2',
    data: {},
    headers: {},
    resolve: 'support.text',
  },
});

Parrot.templates.send(
  'Async Template',
  {
    // to: '+15555555555',
    to: 'john@doe.com',
    subject: 'Testing',
  },
  // Sample Data for Template
  { name: 'User', date: new Date() },
  // Transport Settings
  // Available classes email, sms & call
  // Available transports per Class:
  // Email: 'ses', 'mailgun', 'mailjetEmail', 'mailchimp', 'smtp'
  // SMS: 'twilioSMS', 'mailjetSMS'
  // Call: 'twilioCall'
  { class: 'email', name: 'mailjetEmail' },
)
  .then((res) => {
    console.log('SEND TEMPALTE OUTPUT', res);
  });
