import Twilio from 'twilio';
import { htmlToText } from 'html-to-text';
import TwilioSMS from '../../../src/transports/twilio/sms';

jest.mock('twilio');
jest.mock('html-to-text');

describe('Twilio SMS Transport', () => {
  let transport: TwilioSMS;
  let mockCreate: jest.Mock;

  beforeEach(() => {
    mockCreate = jest.fn().mockResolvedValue({ sid: 'message-sid' });

    (Twilio as any).mockReturnValue({
      messages: {
        create: mockCreate,
      },
    });

    (htmlToText as jest.Mock).mockImplementation((html) => html.replace(/<[^>]*>/g, ''));

    transport = new TwilioSMS({
      auth: {
        sid: 'test-sid',
        token: 'test-token',
      },
      defaults: {
        from: '+15551234567',
      },
    });
  });

  it('should initialize Twilio client with credentials', () => {
    expect(Twilio).toHaveBeenCalledWith('test-sid', 'test-token');
  });

  it('should send SMS with text extracted from HTML', async () => {
    await transport.send({
      to: '+15559876543',
      html: '<p>Hello World</p>',
    });

    expect(htmlToText).toHaveBeenCalledWith('<p>Hello World</p>');
    expect(mockCreate).toHaveBeenCalledWith({
      from: '+15551234567',
      to: '+15559876543',
      body: 'Hello World',
    });
  });

  it('should use defaults and override with message data', async () => {
    await transport.send({
      from: '+15555555555',
      to: '+15559999999',
      html: 'Test message',
    });

    expect(mockCreate).toHaveBeenCalledWith({
      from: '+15555555555',
      to: '+15559999999',
      body: 'Test message',
    });
  });

  it('should use text field when no html is provided', async () => {
    await transport.send({
      to: '+15559876543',
      text: 'Plain text message',
    });

    expect(htmlToText).toHaveBeenCalledWith('Plain text message');
    expect(mockCreate).toHaveBeenCalledWith({
      from: '+15551234567',
      to: '+15559876543',
      body: 'Plain text message',
    });
  });

  it('should use empty string when neither html nor text is provided', async () => {
    await transport.send({
      to: '+15559876543',
    });

    expect(mockCreate).toHaveBeenCalledWith({
      from: '+15551234567',
      to: '+15559876543',
      body: '',
    });
  });

  it('should handle empty from field', async () => {
    const transportNoDefaults = new TwilioSMS({
      auth: {
        sid: 'test-sid',
        token: 'test-token',
      },
      defaults: {},
    });

    await transportNoDefaults.send({
      to: '+15559876543',
      text: 'Test message',
    });

    expect(mockCreate).toHaveBeenCalledWith({
      from: '',
      to: '+15559876543',
      body: 'Test message',
    });
  });

  it('should handle empty to field', async () => {
    await transport.send({
      from: '+15551234567',
      text: 'Test message',
    } as any);

    expect(mockCreate).toHaveBeenCalledWith({
      from: '+15551234567',
      to: '',
      body: 'Test message',
    });
  });

  it('should handle both html and text provided (html takes precedence)', async () => {
    await transport.send({
      to: '+15559876543',
      html: '<p>HTML content</p>',
      text: 'Text content',
    });

    expect(htmlToText).toHaveBeenCalledWith('<p>HTML content</p>');
    expect(mockCreate).toHaveBeenCalledWith({
      from: '+15551234567',
      to: '+15559876543',
      body: 'HTML content',
    });
  });
});
