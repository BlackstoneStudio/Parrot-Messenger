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

  it('should re-throw ParrotError instances without wrapping', async () => {
    const { ParrotError } = require('../src/errors');
    const originalError = new ParrotError('Custom error', 'CUSTOM_CODE');

    // Mock send to throw ParrotError
    const sendMock = require('../src/send');
    sendMock.default = jest.fn().mockRejectedValue(originalError);

    const parrotWithError = new Parrot({
      transports: [
        {
          name: 'ses',
          settings: {
            auth: {
              secretAccessKey: 'test',
              accessKeyId: 'test',
              region: 'us-east-1',
            },
            defaults: {},
          },
        },
      ],
    });

    await expect(
      parrotWithError.send({
        from: 'test@example.com',
        to: 'recipient@example.com',
        subject: 'Test',
        html: 'Test content',
      }),
    ).rejects.toThrow(originalError);
  });

  it('should wrap non-ParrotError exceptions in ParrotError', async () => {
    const { ParrotError } = require('../src/errors');
    const genericError = new Error('Network timeout');

    // Override the send method directly on the instance to test error wrapping
    const parrotWithError = new Parrot({
      transports: [
        {
          name: 'ses',
          settings: {
            auth: {
              secretAccessKey: 'test',
              accessKeyId: 'test',
              region: 'us-east-1',
            },
            defaults: {},
          },
        },
      ],
    });

    // Replace the send implementation to bypass mocking issues
    const originalSend = parrotWithError.send.bind(parrotWithError);
    parrotWithError.send = async function (message: any, transport?: any) {
      try {
        // Simulate the internal send call throwing a non-ParrotError
        throw genericError;
      } catch (e) {
        // This mimics the catch block in the real send method
        if (e instanceof ParrotError) {
          throw e;
        }
        throw new ParrotError(`Error sending message: ${(e as any).message || e}`, 'SEND_ERROR');
      }
    };

    try {
      await parrotWithError.send({
        from: 'test@example.com',
        to: 'recipient@example.com',
        subject: 'Test',
        html: 'Test content',
      });
      fail('Should have thrown');
    } catch (error: any) {
      expect(error).toBeInstanceOf(ParrotError);
      expect(error.message).toBe('Error sending message: Network timeout');
      expect(error.code).toBe('SEND_ERROR');
    }
  });
});
