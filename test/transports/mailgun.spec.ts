import MailgunTransport from '../../src/transports/mailgun';
import { Envelope, Mailgun as IMailgun } from '../../src/types';

const mockCreate = jest.fn().mockResolvedValue({ id: 'test-message-id' });
const mockClient = jest.fn(() => ({
  messages: {
    create: mockCreate,
  },
}));

jest.mock('mailgun.js', () =>
  jest.fn().mockImplementation(() => ({
    client: mockClient,
  })),
);

jest.mock('form-data', () => jest.fn());

describe('MailgunTransport', () => {
  let mailgunTransport: MailgunTransport;
  let mockSettings: IMailgun;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSettings = {
      auth: {
        apiKey: 'test-api-key',
        domain: 'test.mailgun.org',
      },
      defaults: {
        from: 'default@example.com',
      },
    };

    mailgunTransport = new MailgunTransport(mockSettings);
  });

  describe('constructor', () => {
    it('should initialize with correct settings', () => {
      expect(mailgunTransport).toBeDefined();
      expect(mailgunTransport.transport).toBeDefined();
    });

    it('should create mailgun client with correct credentials', () => {
      expect(mockClient).toHaveBeenCalledWith({
        username: 'api',
        key: mockSettings.auth.apiKey,
      });
    });
  });

  describe('send', () => {
    it('should send message with correct parameters', async () => {
      const message: Envelope = {
        from: 'sender@example.com',
        to: 'recipient@example.com',
        subject: 'Test Subject',
        html: '<p>Test HTML</p>',
        text: 'Test text',
      };

      await mailgunTransport.send(message);

      expect(mockCreate).toHaveBeenCalledWith(mockSettings.auth.domain, {
        from: message.from,
        to: message.to,
        subject: message.subject,
        text: message.text,
        html: message.html,
      });
    });

    it('should apply defaults from settings', async () => {
      const message: Envelope = {
        to: 'recipient@example.com',
        subject: 'Test Subject',
        html: '<p>Test HTML</p>',
      };

      await mailgunTransport.send(message);

      expect(mockCreate).toHaveBeenCalledWith(mockSettings.auth.domain, {
        from: mockSettings.defaults?.from,
        to: message.to,
        subject: message.subject,
        text: undefined,
        html: message.html,
      });
    });

    it('should handle attachments when provided', async () => {
      const message: Envelope = {
        from: 'sender@example.com',
        to: 'recipient@example.com',
        subject: 'Test Subject',
        html: '<p>Test HTML</p>',
        attachments: [
          {
            filename: 'test.pdf',
            content: 'base64content',
          },
        ],
      };

      await mailgunTransport.send(message);

      expect(mockCreate).toHaveBeenCalledWith(mockSettings.auth.domain, {
        from: message.from,
        to: message.to,
        subject: message.subject,
        text: undefined,
        html: message.html,
        attachment: message.attachments,
      });
    });

    it('should handle send errors', async () => {
      const error = new Error('Mailgun API error');
      mockCreate.mockRejectedValueOnce(error);

      const message: Envelope = {
        from: 'sender@example.com',
        to: 'recipient@example.com',
        subject: 'Test Subject',
        html: '<p>Test HTML</p>',
      };

      await expect(mailgunTransport.send(message)).rejects.toThrow('Mailgun error: Mailgun API error');
    });

    it('should merge defaults with message data', async () => {
      const settingsWithDefaults: IMailgun = {
        auth: {
          apiKey: 'test-api-key',
          domain: 'test.mailgun.org',
        },
        defaults: {
          from: 'default@example.com',
        },
      };

      const transport = new MailgunTransport(settingsWithDefaults);
      const message: Envelope = {
        to: 'recipient@example.com',
        subject: 'Test Subject',
        html: '<p>Test HTML</p>',
      };

      await transport.send(message);

      expect(mockCreate).toHaveBeenCalledWith(settingsWithDefaults.auth.domain, {
        from: 'default@example.com',
        to: message.to,
        subject: message.subject,
        text: undefined,
        html: message.html,
      });
    });
  });
});
