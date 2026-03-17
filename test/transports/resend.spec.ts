import ResendTransport from '../../src/transports/resend';
import { Envelope, Resend as IResend } from '../../src/types';

describe('Resend', () => {
  let resendTransport: ResendTransport;
  let mockSettings: IResend;
  let mockTransport: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockTransport = {
      send: jest.fn().mockResolvedValue({ data: { id: 'test-message-id' }, error: null }),
    };

    mockSettings = {
      auth: {
        apiKey: 're_test_api_key',
      },
      defaults: {
        from: 'default@example.com',
      },
    };

    resendTransport = new ResendTransport(mockSettings, mockTransport);
  });

  describe('constructor', () => {
    it('should initialize with correct settings', () => {
      expect(resendTransport).toBeDefined();
      expect(resendTransport.transport).toBeDefined();
    });

    it('should use provided transport', () => {
      expect(resendTransport.transport).toBe(mockTransport);
    });

    it('should use ResendSDK as default transport when none provided', () => {
      const transportWithDefaults = new ResendTransport(mockSettings);
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

      await resendTransport.send(message);

      expect(mockTransport.send).toHaveBeenCalledWith({
        from: message.from,
        to: message.to,
        subject: message.subject,
        text: message.text,
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

      await resendTransport.send(message);

      expect(mockTransport.send).toHaveBeenCalledWith({
        from: mockSettings.defaults?.from,
        to: message.to,
        subject: message.subject,
        text: undefined,
        html: message.html,
        attachments: undefined,
      });
    });

    it('should merge defaults with message data', async () => {
      const settingsWithDefaults: IResend = {
        auth: {
          apiKey: 're_test_api_key_2',
        },
        defaults: {
          from: 'default@example.com',
          text: 'Default text content',
        },
      };

      const transport = new ResendTransport(settingsWithDefaults, mockTransport);
      const message: Envelope = {
        to: 'recipient@example.com',
        subject: 'Test Subject',
        html: '<p>Test HTML</p>',
      };

      await transport.send(message);

      expect(mockTransport.send).toHaveBeenCalledWith({
        from: 'default@example.com',
        to: message.to,
        subject: message.subject,
        text: 'Default text content',
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

      await resendTransport.send(message);

      expect(mockTransport.send).toHaveBeenCalledWith({
        from: message.from,
        to: message.to,
        subject: message.subject,
        text: undefined,
        html: message.html,
        attachments: message.attachments,
      });
    });

    it('should wrap API errors returned in response in TransportError', async () => {
      mockTransport.send.mockResolvedValueOnce({
        data: null,
        error: { message: 'Invalid API key', name: 'api_error' },
      });

      const message: Envelope = {
        from: 'sender@example.com',
        to: 'recipient@example.com',
        subject: 'Test Subject',
        html: '<p>Test HTML</p>',
      };

      await expect(resendTransport.send(message)).rejects.toThrow('Resend error: Invalid API key');
    });

    it('should wrap thrown errors in TransportError', async () => {
      const error = new Error('Network error');
      mockTransport.send.mockRejectedValueOnce(error);

      const message: Envelope = {
        from: 'sender@example.com',
        to: 'recipient@example.com',
        subject: 'Test Subject',
        html: '<p>Test HTML</p>',
      };

      await expect(resendTransport.send(message)).rejects.toThrow('Resend error: Network error');
    });

    it('should wrap non-Error throw in TransportError', async () => {
      mockTransport.send.mockRejectedValueOnce('string error');

      const message: Envelope = {
        from: 'sender@example.com',
        to: 'recipient@example.com',
        subject: 'Test Subject',
        html: '<p>Test HTML</p>',
      };

      await expect(resendTransport.send(message)).rejects.toThrow('Resend error: string error');
    });
  });
});
