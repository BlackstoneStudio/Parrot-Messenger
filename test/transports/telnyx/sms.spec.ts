import TelnyxSMSTransport from '../../../src/transports/telnyx/sms';
import { Envelope, TelnyxSMS } from '../../../src/types';

jest.mock('telnyx', () => ({
  Telnyx: jest.fn().mockImplementation(() => ({
    messages: { send: jest.fn().mockResolvedValue({ id: 'default-id' }) },
  })),
}));

jest.mock('html-to-text', () => ({
  htmlToText: jest.fn((html: string) => html.replace(/<[^>]*>/g, '')),
}));

describe('TelnyxSMSTransport', () => {
  let telnyxTransport: TelnyxSMSTransport;
  let mockSettings: TelnyxSMS;
  let mockTransport: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockTransport = {
      messages: {
        send: jest.fn().mockResolvedValue({ id: 'test-message-id' }),
      },
    };

    mockSettings = {
      auth: {
        apiKey: 'test-api-key',
      },
      defaults: {
        from: '+1234567890',
      },
    };

    telnyxTransport = new TelnyxSMSTransport(mockSettings, mockTransport);
  });

  describe('constructor', () => {
    it('should initialize with correct settings', () => {
      expect(telnyxTransport).toBeDefined();
      expect(telnyxTransport.transport).toBeDefined();
    });

    it('should use provided transport', () => {
      expect(telnyxTransport.transport).toBe(mockTransport);
    });

    it('should use Telnyx SDK as default transport when none provided', () => {
      const transportWithDefaults = new TelnyxSMSTransport(mockSettings);
      expect(transportWithDefaults.transport).toBeDefined();
    });
  });

  describe('send', () => {
    it('should send SMS with text content', async () => {
      const message: Envelope = {
        from: '+1987654321',
        to: '+1234567890',
        text: 'Test SMS message',
      };

      await telnyxTransport.send(message);

      expect(mockTransport.messages.send).toHaveBeenCalledWith({
        from: message.from,
        to: message.to,
        text: message.text,
      });
    });

    it('should use HTML content when text is not provided', async () => {
      const message: Envelope = {
        from: '+1987654321',
        to: '+1234567890',
        html: '<p>Test HTML message</p>',
      };

      await telnyxTransport.send(message);

      expect(mockTransport.messages.send).toHaveBeenCalledWith({
        from: message.from,
        to: message.to,
        text: expect.stringContaining('Test HTML message'),
      });
    });

    it('should apply defaults from settings', async () => {
      const message: Envelope = {
        to: '+1234567890',
        text: 'Test message',
      };

      await telnyxTransport.send(message);

      expect(mockTransport.messages.send).toHaveBeenCalledWith({
        from: mockSettings.defaults?.from,
        to: message.to,
        text: message.text,
      });
    });

    it('should handle send errors', async () => {
      const error = new Error('Telnyx API error');
      mockTransport.messages.send.mockRejectedValueOnce(error);

      const message: Envelope = {
        from: '+1987654321',
        to: '+1234567890',
        text: 'Test message',
      };

      await expect(telnyxTransport.send(message)).rejects.toThrow(
        'Telnyx SMS error: Telnyx API error',
      );
    });

    it('should wrap non-Error throw in TransportError', async () => {
      mockTransport.messages.send.mockRejectedValueOnce('string error');

      const message: Envelope = {
        from: '+1987654321',
        to: '+1234567890',
        text: 'Test message',
      };

      await expect(telnyxTransport.send(message)).rejects.toThrow('Telnyx SMS error: string error');
    });

    it('should merge defaults with message data', async () => {
      const settingsWithDefaults: TelnyxSMS = {
        auth: {
          apiKey: 'test-api-key',
        },
        defaults: {
          from: '+1234567890',
          subject: 'Default subject',
        },
      };

      const transport = new TelnyxSMSTransport(settingsWithDefaults, mockTransport);
      const message: Envelope = {
        to: '+1987654321',
        text: 'Test message',
      };

      await transport.send(message);

      expect(mockTransport.messages.send).toHaveBeenCalledWith({
        from: '+1234567890',
        to: message.to,
        text: message.text,
      });
    });
  });

  describe('MMS', () => {
    it('should send MMS when mediaUrls are provided', async () => {
      const message: Envelope = {
        from: '+1987654321',
        to: '+1234567890',
        text: 'Check out this image',
        mediaUrls: ['https://example.com/image.jpg'],
      };

      await telnyxTransport.send(message);

      expect(mockTransport.messages.send).toHaveBeenCalledWith({
        from: message.from,
        to: message.to,
        text: message.text,
        type: 'MMS',
        media_urls: ['https://example.com/image.jpg'],
        subject: undefined,
      });
    });

    it('should include subject for MMS when provided', async () => {
      const message: Envelope = {
        from: '+1987654321',
        to: '+1234567890',
        text: 'Check out this image',
        subject: 'Photo attachment',
        mediaUrls: ['https://example.com/image.jpg'],
      };

      await telnyxTransport.send(message);

      expect(mockTransport.messages.send).toHaveBeenCalledWith({
        from: message.from,
        to: message.to,
        text: message.text,
        type: 'MMS',
        media_urls: ['https://example.com/image.jpg'],
        subject: 'Photo attachment',
      });
    });

    it('should send MMS with multiple media URLs', async () => {
      const message: Envelope = {
        from: '+1987654321',
        to: '+1234567890',
        text: 'Multiple images',
        mediaUrls: ['https://example.com/image1.jpg', 'https://example.com/image2.png'],
      };

      await telnyxTransport.send(message);

      expect(mockTransport.messages.send).toHaveBeenCalledWith({
        from: message.from,
        to: message.to,
        text: message.text,
        type: 'MMS',
        media_urls: ['https://example.com/image1.jpg', 'https://example.com/image2.png'],
        subject: undefined,
      });
    });

    it('should send as SMS when mediaUrls is empty array', async () => {
      const message: Envelope = {
        from: '+1987654321',
        to: '+1234567890',
        text: 'No media',
        mediaUrls: [],
      };

      await telnyxTransport.send(message);

      expect(mockTransport.messages.send).toHaveBeenCalledWith({
        from: message.from,
        to: message.to,
        text: message.text,
      });
    });
  });
});
