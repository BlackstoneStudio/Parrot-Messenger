import Postmark from '../../src/transports/postmark';
import { Envelope, Postmark as IPostmark } from '../../src/types';

describe('Postmark', () => {
  let postmarkTransport: Postmark;
  let mockSettings: IPostmark;
  let mockTransport: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockTransport = {
      sendEmail: jest.fn().mockResolvedValue({ MessageID: 'test-message-id' }),
    };

    mockSettings = {
      auth: {
        serverToken: 'test-server-token',
      },
      defaults: {
        from: 'default@example.com',
      },
    };

    postmarkTransport = new Postmark(mockSettings, mockTransport);
  });

  describe('constructor', () => {
    it('should initialize with correct settings', () => {
      expect(postmarkTransport).toBeDefined();
      expect(postmarkTransport.transport).toBeDefined();
    });

    it('should use provided transport', () => {
      expect(postmarkTransport.transport).toBe(mockTransport);
    });

    it('should use PostmarkSDK as default transport when none provided', () => {
      const transportWithDefaults = new Postmark(mockSettings);
      expect(transportWithDefaults.transport).toBeDefined();
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

      await postmarkTransport.send(message);

      expect(mockTransport.sendEmail).toHaveBeenCalledWith({
        From: message.from,
        To: message.to,
        Subject: message.subject,
        TextBody: message.text,
        HtmlBody: message.html,
        Attachments: undefined,
      });
    });

    it('should apply defaults from settings', async () => {
      const message: Envelope = {
        to: 'recipient@example.com',
        subject: 'Test Subject',
        html: '<p>Test HTML</p>',
      };

      await postmarkTransport.send(message);

      expect(mockTransport.sendEmail).toHaveBeenCalledWith({
        From: mockSettings.defaults?.from,
        To: message.to,
        Subject: message.subject,
        TextBody: undefined,
        HtmlBody: message.html,
        Attachments: undefined,
      });
    });

    it('should merge defaults with message data', async () => {
      const settingsWithDefaults: IPostmark = {
        auth: {
          serverToken: 'test-server-token-2',
        },
        defaults: {
          from: 'default@example.com',
          text: 'Default text content',
        },
      };

      const transport = new Postmark(settingsWithDefaults, mockTransport);
      const message: Envelope = {
        to: 'recipient@example.com',
        subject: 'Test Subject',
        html: '<p>Test HTML</p>',
      };

      await transport.send(message);

      expect(mockTransport.sendEmail).toHaveBeenCalledWith({
        From: 'default@example.com',
        To: message.to,
        Subject: message.subject,
        TextBody: 'Default text content',
        HtmlBody: message.html,
        Attachments: undefined,
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
            type: 'application/pdf',
            disposition: 'attachment',
          },
        ],
      };

      await postmarkTransport.send(message);

      expect(mockTransport.sendEmail).toHaveBeenCalledWith({
        From: message.from,
        To: message.to,
        Subject: message.subject,
        TextBody: undefined,
        HtmlBody: message.html,
        Attachments: message.attachments,
      });
    });

    it('should wrap send errors in TransportError', async () => {
      const error = new Error('Postmark API error');
      mockTransport.sendEmail.mockRejectedValueOnce(error);

      const message: Envelope = {
        from: 'sender@example.com',
        to: 'recipient@example.com',
        subject: 'Test Subject',
        html: '<p>Test HTML</p>',
      };

      await expect(postmarkTransport.send(message)).rejects.toThrow(
        'Postmark error: Postmark API error',
      );
    });

    it('should wrap non-Error throw in TransportError', async () => {
      mockTransport.sendEmail.mockRejectedValueOnce('string error');

      const message: Envelope = {
        from: 'sender@example.com',
        to: 'recipient@example.com',
        subject: 'Test Subject',
        html: '<p>Test HTML</p>',
      };

      await expect(postmarkTransport.send(message)).rejects.toThrow('Postmark error: string error');
    });
  });
});
