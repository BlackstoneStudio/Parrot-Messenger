// eslint-disable-next-line import/no-named-as-default
import Parrot from '../src/index';

jest.useFakeTimers();

jest.mock('../src/transports/aws/ses');

describe('Creates a parrot instance', () => {
  let parrot: Parrot;

  beforeAll(() => {
    process.env.SES_SECRET = 'mock-secret';
    process.env.SES_KEY = 'mock-key';
    process.env.REGION = 'us-east-1';
    process.env.FROM = 'test@example.com';
    process.env.TO = 'recipient@example.com';

    parrot = new Parrot({
      transports: [
        {
          name: 'ses',
          settings: {
            auth: {
              secretAccessKey: `${process.env.SES_SECRET}`,
              accessKeyId: `${process.env.SES_KEY}`,
              region: process.env.REGION,
            },
            defaults: {},
          },
        },
      ],
    });
  });

  it('Sends an email', async () => {
    try {
      await parrot.send({
        from: process.env.FROM,
        to: process.env.TO,
        html: 'Test mail',
        subject: 'Test mail',
        attachments: [
          {
            filename: 'license.txt',
            path: 'https://raw.github.com/nodemailer/nodemailer/master/LICENSE',
          },
        ],
      });
    } catch (e) {
      console.error(e); // eslint-disable-line no-console
    }
  }, 5000);

  it('Registers a template and sends an email with given template', async () => {
    parrot.templates.register({
      name: 'test-template',
      html: '<h1>Test title</h1><p>{{testProp}}</p>',
    });

    parrot.templates.send(
      'test-template',
      {
        from: process.env.FROM,
        to: process.env.TO,
        subject: 'another test',
      },
      {
        testProp: 'Hello',
      },
    );
  });
});
