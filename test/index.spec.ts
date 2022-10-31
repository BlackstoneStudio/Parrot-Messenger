// eslint-disable-next-line import/no-named-as-default
import Parrot from '../src/index';

jest.useFakeTimers({ legacyFakeTimers: true });

describe('Creates a parrot instance', () => {
  let parrot: Parrot;

  beforeAll(() => {
    parrot = new Parrot({
      transports: [
        {
          name: 'ses',
          settings: {
            auth: {
              secretAccessKey: process.env.SES_SECRET,
              accessKeyId: process.env.SES_KEY,
              region: process.env.REGION,
            },
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
      });
    } catch (e) {
      console.error(e);
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
      }
    );
  });
});
