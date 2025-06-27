import Mailchimp from '../../src/transports/mailchimp';
import { Envelope, Mailchimp as IMailchimp } from '../../src/types';

jest.mock('@mailchimp/mailchimp_transactional/src/index', () =>
  jest.fn(() => ({
    messages: {
      send: jest.fn().mockResolvedValue({ success: true }),
    },
  })),
);

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
      // eslint-disable-next-line global-require
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
              type: 'to',
            },
          ],
          html: message.html,
          subject: message.subject,
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
          from_email: mockSettings.defaults?.from,
          to: [
            {
              email: message.to,
              type: 'to',
            },
          ],
          html: message.html,
          subject: message.subject,
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
              type: 'to',
            },
          ],
          html: message.html,
          subject: message.subject,
          attachments: [
            {
              content: 'base64content',
              name: 'test.pdf',
              type: 'application/octet-stream',
            },
          ],
        },
      });
    });

    it('should handle attachments already in Mailchimp format', async () => {
      const message: Envelope = {
        from: 'sender@example.com',
        to: 'recipient@example.com',
        subject: 'Test Subject',
        html: '<p>Test HTML</p>',
        attachments: [
          {
            content: 'base64content',
            name: 'document.pdf',
            type: 'application/pdf',
          } as any,
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
              type: 'to',
            },
          ],
          html: message.html,
          subject: message.subject,
          attachments: [
            {
              content: 'base64content',
              name: 'document.pdf',
              type: 'application/pdf',
            },
          ],
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
        'Mailchimp error: Mailchimp API error',
      );
    });

    it('should handle missing from and to fields with defaults', async () => {
      const message: Envelope = {
        subject: 'Test Subject',
        html: '<p>Test HTML</p>',
      };

      await mailchimpTransport.send(message);

      expect(mockMailchimpClient.messages.send).toHaveBeenCalledWith({
        key: mockSettings.auth.apiKey,
        message: {
          from_email: 'default@example.com',
          to: [
            {
              email: '',
              type: 'to',
            },
          ],
          html: message.html,
          subject: message.subject,
        },
      });
    });

    it('should handle attachments with missing filename', async () => {
      const message: Envelope = {
        from: 'sender@example.com',
        to: 'recipient@example.com',
        subject: 'Test Subject',
        html: '<p>Test HTML</p>',
        attachments: [
          {
            content: 'base64content',
          } as any,
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
              type: 'to',
            },
          ],
          html: message.html,
          subject: message.subject,
          attachments: [
            {
              content: 'base64content',
              name: 'attachment',
              type: 'application/octet-stream',
            },
          ],
        },
      });
    });
  });
});
