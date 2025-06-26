import Sendgrid from '../../src/transports/sendgrid';
import { Envelope, Sendgrid as ISendgrid } from '../../src/types';

describe('Sendgrid', () => {
  let sendgridTransport: Sendgrid;
  let mockSettings: ISendgrid;
  let mockTransport: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockTransport = {
      setApiKey: jest.fn().mockImplementation(() => {}),
      send: jest.fn().mockResolvedValue({ success: true }),
    };

    mockSettings = {
      auth: {
        apiKey: 'SG.test-api-key',
      },
      defaults: {
        from: 'default@example.com',
      },
    };

    sendgridTransport = new Sendgrid(mockSettings, mockTransport);
  });

  describe('constructor', () => {
    it('should initialize with correct settings', () => {
      expect(sendgridTransport).toBeDefined();
      expect(sendgridTransport.transport).toBeDefined();
    });

    it('should set API key on transport', () => {
      expect(mockTransport.setApiKey).toHaveBeenCalledWith('SG.test-api-key');
    });

    it('should use SendgridMail as default transport', () => {
      const transportWithDefaults = new Sendgrid(mockSettings);
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
      };

      await sendgridTransport.send(message);

      expect(mockTransport.send).toHaveBeenCalledWith({
        from: message.from,
        to: message.to,
        subject: message.subject,
        html: message.html,
        attachments: undefined,
      });
    });

    it('should apply defaults from settings', async () => {
      const message: Envelope = {
        to: 'recipient@example.com',
        subject: 'Test Subject',
        html: '<p>Test HTML</p>',
      };

      await sendgridTransport.send(message);

      expect(mockTransport.send).toHaveBeenCalledWith({
        from: mockSettings.defaults?.from,
        to: message.to,
        subject: message.subject,
        html: message.html,
        attachments: undefined,
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

      await sendgridTransport.send(message);

      expect(mockTransport.send).toHaveBeenCalledWith({
        from: message.from,
        to: message.to,
        subject: message.subject,
        html: message.html,
        attachments: message.attachments,
      });
    });

    it('should handle send errors', async () => {
      const error = new Error('Sendgrid API error');
      mockTransport.send.mockRejectedValueOnce(error);

      const message: Envelope = {
        from: 'sender@example.com',
        to: 'recipient@example.com',
        subject: 'Test Subject',
        html: '<p>Test HTML</p>',
      };

      await expect(sendgridTransport.send(message)).rejects.toThrow('Sendgrid API error');
    });

    it('should merge defaults with message data', async () => {
      const settingsWithDefaults: ISendgrid = {
        auth: {
          apiKey: 'SG.test-api-key-2',
        },
        defaults: {
          from: 'default@example.com',
          text: 'Default text content',
        },
      };

      const transport = new Sendgrid(settingsWithDefaults, mockTransport);
      const message: Envelope = {
        to: 'recipient@example.com',
        subject: 'Test Subject',
        html: '<p>Test HTML</p>',
      };

      await transport.send(message);

      expect(mockTransport.send).toHaveBeenCalledWith({
        from: 'default@example.com',
        text: 'Default text content',
        to: message.to,
        subject: message.subject,
        html: message.html,
        attachments: undefined,
      });
    });
  });
});
