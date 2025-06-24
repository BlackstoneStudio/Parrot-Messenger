import TelnyxSMSTransport from '../../../src/transports/telnyx/sms';
import { Envelope, TelnyxSMS } from '../../../src/types';

const mockCreate = jest.fn().mockResolvedValue({ id: 'test-message-id' });

jest.mock('telnyx', () => {
  return jest.fn().mockImplementation(() => ({
    messages: {
      create: mockCreate,
    },
  }));
});

describe('TelnyxSMSTransport', () => {
  let telnyxTransport: TelnyxSMSTransport;
  let mockSettings: TelnyxSMS;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockSettings = {
      auth: {
        apiKey: 'test-api-key',
      },
      defaults: {
        from: '+1234567890',
      },
    };

    telnyxTransport = new TelnyxSMSTransport(mockSettings);
  });

  describe('constructor', () => {
    it('should initialize with correct settings', () => {
      expect(telnyxTransport).toBeDefined();
      expect(telnyxTransport.transport).toBeDefined();
    });

    it('should create Telnyx client with API key', () => {
      const TelnyxMock = require('telnyx');
      expect(TelnyxMock).toHaveBeenCalledWith(mockSettings.auth.apiKey);
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

      expect(mockCreate).toHaveBeenCalledWith({
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

      expect(mockCreate).toHaveBeenCalledWith({
        from: message.from,
        to: message.to,
        text: '<p>Test HTML message</p>',
      });
    });

    it('should apply defaults from settings', async () => {
      const message: Envelope = {
        to: '+1234567890',
        text: 'Test message',
      };

      await telnyxTransport.send(message);

      expect(mockCreate).toHaveBeenCalledWith({
        from: mockSettings.defaults.from,
        to: message.to,
        text: message.text,
      });
    });

    it('should handle send errors', async () => {
      const error = new Error('Telnyx API error');
      mockCreate.mockRejectedValueOnce(error);

      const message: Envelope = {
        from: '+1987654321',
        to: '+1234567890',
        text: 'Test message',
      };

      await expect(telnyxTransport.send(message)).rejects.toThrow('Telnyx API error');
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

      const transport = new TelnyxSMSTransport(settingsWithDefaults);
      const message: Envelope = {
        to: '+1987654321',
        text: 'Test message',
      };

      await transport.send(message);

      expect(mockCreate).toHaveBeenCalledWith({
        from: '+1234567890',
        to: message.to,
        text: message.text,
      });
    });
  });
});