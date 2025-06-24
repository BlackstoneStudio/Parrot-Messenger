import SES from '../../../src/transports/aws/ses';
import * as AWS from 'aws-sdk';
import * as nodemailer from 'nodemailer';

jest.mock('aws-sdk', () => {
  const mockSES = jest.fn();
  return {
    SES: mockSES,
    config: {
      update: jest.fn()
    }
  };
});
jest.mock('nodemailer');

describe('AWS SES Transport', () => {
  let transport: SES;
  let mockSendMail: jest.Mock;

  beforeEach(() => {
    mockSendMail = jest.fn().mockResolvedValue({ messageId: '123' });
    
    (AWS.SES as unknown as jest.Mock).mockImplementation(() => ({}));
    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: mockSendMail
    });

    transport = new SES({
      auth: {
        accessKeyId: 'test-key',
        secretAccessKey: 'test-secret',
        region: 'us-east-1'
      },
      defaults: {
        from: 'noreply@example.com'
      }
    });
  });

  it('should create SES client with correct config', () => {
    expect(AWS.SES).toHaveBeenCalledWith({
      apiVersion: '2010-12-01',
      accessKeyId: 'test-key',
      secretAccessKey: 'test-secret',
      region: 'us-east-1'
    });
  });

  it('should not pollute global AWS config', () => {
    expect(AWS.config.update).not.toHaveBeenCalled();
  });

  it('should send email through SES transport', async () => {
    await transport.send({
      to: 'recipient@example.com',
      subject: 'Test Email',
      html: '<p>Test content</p>'
    });

    expect(mockSendMail).toHaveBeenCalledWith({
      from: 'noreply@example.com',
      to: 'recipient@example.com',
      subject: 'Test Email',
      html: '<p>Test content</p>'
    });
  });
});