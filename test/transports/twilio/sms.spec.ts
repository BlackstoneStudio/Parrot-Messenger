import TwilioSMS from '../../../src/transports/twilio/sms';
import Twilio from 'twilio';
import { htmlToText } from 'html-to-text';

jest.mock('twilio');
jest.mock('html-to-text');

describe('Twilio SMS Transport', () => {
  let transport: TwilioSMS;
  let mockCreate: jest.Mock;

  beforeEach(() => {
    mockCreate = jest.fn().mockResolvedValue({ sid: 'message-sid' });
    
    (Twilio as any).mockReturnValue({
      messages: {
        create: mockCreate
      }
    });

    (htmlToText as jest.Mock).mockImplementation((html) => html.replace(/<[^>]*>/g, ''));

    transport = new TwilioSMS({
      auth: {
        sid: 'test-sid',
        token: 'test-token'
      },
      defaults: {
        from: '+15551234567'
      }
    });
  });

  it('should initialize Twilio client with credentials', () => {
    expect(Twilio).toHaveBeenCalledWith('test-sid', 'test-token');
  });

  it('should send SMS with text extracted from HTML', async () => {
    await transport.send({
      to: '+15559876543',
      html: '<p>Hello World</p>'
    });

    expect(htmlToText).toHaveBeenCalledWith('<p>Hello World</p>');
    expect(mockCreate).toHaveBeenCalledWith({
      from: '+15551234567',
      to: '+15559876543',
      body: 'Hello World'
    });
  });

  it('should use defaults and override with message data', async () => {
    await transport.send({
      from: '+15555555555',
      to: '+15559999999',
      html: 'Test message'
    });

    expect(mockCreate).toHaveBeenCalledWith({
      from: '+15555555555',
      to: '+15559999999',
      body: 'Test message'
    });
  });
});