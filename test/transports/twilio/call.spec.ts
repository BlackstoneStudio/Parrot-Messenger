import Twilio from 'twilio';
import TwilioCall from '../../../src/transports/twilio/call';
import { Envelope, TwilioCall as ITwilioCall } from '../../../src/types';

const mockCreate = jest.fn().mockResolvedValue({ sid: 'test-call-sid' });

jest.mock('twilio', () =>
  jest.fn().mockImplementation(() => ({
    calls: {
      create: mockCreate,
    },
  })),
);

jest.mock('html-to-text', () => ({
  htmlToText: jest.fn((html) =>
    // Simple HTML tag removal
    html.replace(/<[^>]*>/g, ''),
  ),
}));

describe('TwilioCall', () => {
  let twilioCallTransport: TwilioCall;
  let mockSettings: ITwilioCall;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSettings = {
      auth: {
        sid: 'test-account-sid',
        token: 'test-auth-token',
      },
      defaults: {
        from: '+1234567890',
      },
    };

    twilioCallTransport = new TwilioCall(mockSettings);
  });

  describe('constructor', () => {
    it('should initialize with correct settings', () => {
      expect(twilioCallTransport).toBeDefined();
      expect(twilioCallTransport.transport).toBeDefined();
    });

    it('should create Twilio client with credentials', () => {
      expect(Twilio).toHaveBeenCalledWith(mockSettings.auth.sid, mockSettings.auth.token);
    });
  });

  describe('send', () => {
    it('should create call with HTML content', async () => {
      const message: Envelope = {
        from: '+1987654321',
        to: '+1234567890',
        html: '<p>Hello, this is a test call</p>',
      };

      await twilioCallTransport.send(message);

      expect(mockCreate).toHaveBeenCalledWith({
        from: message.from,
        to: message.to,
        twiml: expect.stringContaining('Hello, this is a test call'),
      });
    });

    it('should apply defaults from settings', async () => {
      const message: Envelope = {
        to: '+1234567890',
        html: '<p>Test message</p>',
      };

      await twilioCallTransport.send(message);

      expect(mockCreate).toHaveBeenCalledWith({
        from: mockSettings.defaults?.from,
        to: message.to,
        twiml: expect.stringContaining('Test message'),
      });
    });

    it('should escape XML special characters', async () => {
      const message: Envelope = {
        from: '+1987654321',
        to: '+1234567890',
        html: '<p>Test & "quotes" \'apostrophe\' <tag></p>',
      };

      await twilioCallTransport.send(message);

      const callArgs = mockCreate.mock.calls[0][0];
      // XML builder properly escapes & but not quotes in text content
      expect(callArgs.twiml).toContain('Test &amp; "quotes" \'apostrophe\'');
    });

    it('should include proper TwiML structure', async () => {
      const message: Envelope = {
        from: '+1987654321',
        to: '+1234567890',
        html: '<p>Test message</p>',
      };

      await twilioCallTransport.send(message);

      const callArgs = mockCreate.mock.calls[0][0];
      expect(callArgs.twiml).toContain('<Response>');
      expect(callArgs.twiml).toContain('<Pause length="1"/>');
      expect(callArgs.twiml).toContain('<Say voice="Polly.Joanna">');
      expect(callArgs.twiml).toContain('</Say>');
      expect(callArgs.twiml).toContain('</Response>');
    });

    it('should handle send errors', async () => {
      const error = new Error('Twilio API error');
      mockCreate.mockRejectedValueOnce(error);

      const message: Envelope = {
        from: '+1987654321',
        to: '+1234567890',
        html: '<p>Test message</p>',
      };

      await expect(twilioCallTransport.send(message)).rejects.toThrow(
        'Twilio Call error: Twilio API error',
      );
    });

    it('should merge defaults with message data', async () => {
      const settingsWithDefaults: ITwilioCall = {
        auth: {
          sid: 'test-account-sid',
          token: 'test-auth-token',
        },
        defaults: {
          from: '+1234567890',
          subject: 'Default subject',
        },
      };

      const transport = new TwilioCall(settingsWithDefaults);
      const message: Envelope = {
        to: '+1987654321',
        html: '<p>Test message</p>',
      };

      await transport.send(message);

      expect(mockCreate).toHaveBeenCalledWith({
        from: '+1234567890',
        to: message.to,
        twiml: expect.stringContaining('Test message'),
      });
    });

    it('should use text field when no html is provided', async () => {
      const message: Envelope = {
        from: '+1987654321',
        to: '+1234567890',
        text: 'Plain text message',
      };

      await twilioCallTransport.send(message);

      expect(mockCreate).toHaveBeenCalledWith({
        from: message.from,
        to: message.to,
        twiml: expect.stringContaining('Plain text message'),
      });
    });

    it('should use empty string when neither html nor text is provided', async () => {
      const message: Envelope = {
        from: '+1987654321',
        to: '+1234567890',
      };

      await twilioCallTransport.send(message);

      const callArgs = mockCreate.mock.calls[0][0];
      // XML builder creates self-closing tag for empty content
      expect(callArgs.twiml).toContain('<Say voice="Polly.Joanna"/>');
    });

    it('should handle empty from field', async () => {
      const message: Envelope = {
        to: '+1234567890',
        html: '<p>Test message</p>',
      };

      const transportNoDefaults = new TwilioCall({
        auth: mockSettings.auth,
        defaults: {},
      });

      await transportNoDefaults.send(message);

      expect(mockCreate).toHaveBeenCalledWith({
        from: '',
        to: message.to,
        twiml: expect.stringContaining('Test message'),
      });
    });

    it('should handle empty to field', async () => {
      const message: Envelope = {
        from: '+1987654321',
        html: '<p>Test message</p>',
      };

      await twilioCallTransport.send(message);

      expect(mockCreate).toHaveBeenCalledWith({
        from: message.from,
        to: '',
        twiml: expect.stringContaining('Test message'),
      });
    });

    it('should handle custom voice parameter', async () => {
      const message: Envelope = {
        from: '+1987654321',
        to: '+1234567890',
        html: '<p>Test message</p>',
        voice: 'Amy',
      };

      await twilioCallTransport.send(message);

      const callArgs = mockCreate.mock.calls[0][0];
      // Should use custom voice with Polly prefix
      expect(callArgs.twiml).toContain('<Say voice="Polly.Amy">');
    });

    it('should use default voice when not specified', async () => {
      const message: Envelope = {
        from: '+1987654321',
        to: '+1234567890',
        html: '<p>Test message</p>',
      };

      await twilioCallTransport.send(message);

      const callArgs = mockCreate.mock.calls[0][0];
      expect(callArgs.twiml).toContain('<Say voice="Polly.Joanna">');
    });
  });
});
