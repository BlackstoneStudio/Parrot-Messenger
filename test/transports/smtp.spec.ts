import * as nodemailer from 'nodemailer';
import SMTP from '../../src/transports/smtp';

jest.mock('nodemailer');

describe('SMTP Transport', () => {
  let transport: SMTP;
  let mockSendMail: jest.Mock;

  beforeEach(() => {
    mockSendMail = jest.fn().mockResolvedValue({ messageId: '123' });
    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: mockSendMail
    });

    transport = new SMTP({
      auth: {
        host: 'smtp.example.com',
        port: 587,
        secure: false,
        auth: {
          user: 'user@example.com',
          pass: 'password'
        }
      },
      defaults: {
        from: 'default@example.com'
      }
    });
  });

  it('should create transport with correct settings', () => {
    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      host: 'smtp.example.com',
      port: 587,
      secure: false,
      auth: {
        user: 'user@example.com',
        pass: 'password'
      }
    });
  });

  it('should send email with correct parameters', async () => {
    await transport.send({
      to: 'recipient@example.com',
      subject: 'Test Email',
      html: '<p>Test content</p>'
    });

    expect(mockSendMail).toHaveBeenCalledWith({
      from: 'default@example.com',
      to: 'recipient@example.com',
      subject: 'Test Email',
      html: '<p>Test content</p>'
    });
  });

  it('should override defaults with message data', async () => {
    await transport.send({
      from: 'override@example.com',
      to: 'recipient@example.com',
      subject: 'Test',
      html: 'Content'
    });

    expect(mockSendMail).toHaveBeenCalledWith({
      from: 'override@example.com',
      to: 'recipient@example.com',
      subject: 'Test',
      html: 'Content'
    });
  });
});