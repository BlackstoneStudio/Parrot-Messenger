import TwilioCall from '../../../src/transports/twilio/call';
import { Envelope, TwilioCall as ITwilioCall } from '../../../src/types';
import Twilio from 'twilio';

const mockCreate = jest.fn().mockResolvedValue({ sid: 'test-call-sid' });

jest.mock('twilio', () => {
  return jest.fn().mockImplementation(() => ({
    calls: {
      create: mockCreate,
    },
  }));
});

jest.mock('html-to-text', () => ({
  htmlToText: jest.fn((html) => html.replace(/<[^>]*>/g, '')),
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
      expect(Twilio).toHaveBeenCalledWith(
        mockSettings.auth.sid,
        mockSettings.auth.token
      );
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
        from: mockSettings.defaults.from,
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
      expect(callArgs.twiml).toContain('Test &amp; &quot;quotes&quot; &apos;apostrophe&apos; &lt;tag&gt;');
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

      await expect(twilioCallTransport.send(message)).rejects.toThrow('Twilio API error');
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
        subject: 'Default subject',
        to: message.to,
        twiml: expect.stringContaining('Test message'),
      });
    });
  });
});