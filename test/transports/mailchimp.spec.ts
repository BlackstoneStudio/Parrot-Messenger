import Mailchimp from '../../src/transports/mailchimp';
import { Envelope, Mailchimp as IMailchimp } from '../../src/types';

jest.mock('@mailchimp/mailchimp_transactional/src/index', () => {
  return jest.fn(() => ({
    messages: {
      send: jest.fn().mockResolvedValue({ success: true }),
    },
  }));
});

describe('Mailchimp', () => {
  let mailchimpTransport: Mailchimp;
  let mockSettings: IMailchimp;
  let mockMailchimpClient: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSettings = {
      auth: {
        apiKey: 'test-api-key',
      },
      defaults: {
        from: 'default@example.com',
      },
    };

    mailchimpTransport = new Mailchimp(mockSettings);
    mockMailchimpClient = mailchimpTransport.transport;
  });

  describe('constructor', () => {
    it('should initialize with correct settings', () => {
      expect(mailchimpTransport).toBeDefined();
      expect(mailchimpTransport.transport).toBeDefined();
    });

    it('should create mailchimp client with apiKey', () => {
      const mailchimpMock = require('@mailchimp/mailchimp_transactional/src/index');
      expect(mailchimpMock).toHaveBeenCalledWith(mockSettings.auth.apiKey);
    });
  });

  describe('send', () => {
    it('should send message with correct parameters', async () => {
      const message: Envelope = {
        from: 'sender@example.com',
        to: 'recipient@example.com',
        subject: 'Test Subject',
        html: '<p>Test HTML</p>',
      };

      await mailchimpTransport.send(message);

      expect(mockMailchimpClient.messages.send).toHaveBeenCalledWith({
        key: mockSettings.auth.apiKey,
        message: {
          from_email: message.from,
          to: [
            {
              email: message.to,
            },
          ],
          html: message.html,
          subject: message.subject,
          attachments: undefined,
        },
      });
    });

    it('should apply defaults from settings', async () => {
      const message: Envelope = {
        to: 'recipient@example.com',
        subject: 'Test Subject',
        html: '<p>Test HTML</p>',
      };

      await mailchimpTransport.send(message);

      expect(mockMailchimpClient.messages.send).toHaveBeenCalledWith({
        key: mockSettings.auth.apiKey,
        message: {
          from_email: mockSettings.defaults.from,
          to: [
            {
              email: message.to,
            },
          ],
          html: message.html,
          subject: message.subject,
          attachments: undefined,
        },
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

      await mailchimpTransport.send(message);

      expect(mockMailchimpClient.messages.send).toHaveBeenCalledWith({
        key: mockSettings.auth.apiKey,
        message: {
          from_email: message.from,
          to: [
            {
              email: message.to,
            },
          ],
          html: message.html,
          subject: message.subject,
          attachments: message.attachments,
        },
      });
    });

    it('should handle send errors', async () => {
      const error = new Error('Mailchimp API error');
      mockMailchimpClient.messages.send.mockRejectedValueOnce(error);

      const message: Envelope = {
        from: 'sender@example.com',
        to: 'recipient@example.com',
        subject: 'Test Subject',
        html: '<p>Test HTML</p>',
      };

      await expect(mailchimpTransport.send(message)).rejects.toThrow(
        'Mailchimp API error'
      );
    });
  });
});