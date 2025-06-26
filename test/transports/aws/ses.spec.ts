import * as aws from '@aws-sdk/client-ses';
import * as nodemailer from 'nodemailer';
import SES from '../../../src/transports/aws/ses';

jest.mock('@aws-sdk/client-ses', () => {
  const mockSES = jest.fn();
  return {
    SES: mockSES,
  };
});
jest.mock('nodemailer');

describe('AWS SES Transport', () => {
  let transport: SES;
  let mockSendMail: jest.Mock;

  beforeEach(() => {
    mockSendMail = jest.fn().mockResolvedValue({ messageId: '123' });

    (aws.SES as unknown as jest.Mock).mockImplementation(() => ({}));
    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: mockSendMail,
    });

    transport = new SES({
      auth: {
        accessKeyId: 'test-key',
        secretAccessKey: 'test-secret',
        region: 'us-east-1',
      },
      defaults: {
        from: 'noreply@example.com',
      },
    });
  });

  it('should create SES client with correct config', () => {
    expect(aws.SES).toHaveBeenCalledWith({
      apiVersion: '2010-12-01',
      region: 'us-east-1',
      credentials: {
        accessKeyId: 'test-key',
        secretAccessKey: 'test-secret',
      },
    });
  });

  it('should send email through SES transport', async () => {
    await transport.send({
      to: 'recipient@example.com',
      subject: 'Test Email',
      html: '<p>Test content</p>',
    });

    expect(mockSendMail).toHaveBeenCalledWith({
      from: 'noreply@example.com',
      to: 'recipient@example.com',
      subject: 'Test Email',
      html: '<p>Test content</p>',
    });
  });

  it('should handle send errors and throw TransportError', async () => {
    const sesError = new Error('SES send failed');
    mockSendMail.mockRejectedValueOnce(sesError);

    await expect(
      transport.send({
        to: 'recipient@example.com',
        subject: 'Test Email',
        html: '<p>Test content</p>',
      }),
    ).rejects.toThrow('SES error: SES send failed');
  });

  it('should handle AWS specific errors', async () => {
    const awsError = {
      message: 'Invalid email address',
      code: 'MessageRejected',
      statusCode: 400,
    };
    mockSendMail.mockRejectedValueOnce(awsError);

    await expect(
      transport.send({
        to: 'recipient@example.com',
        subject: 'Test Email',
        html: '<p>Test content</p>',
      }),
    ).rejects.toThrow('SES error: Invalid email address');
  });

  it('should handle errors without message', async () => {
    const error = { code: 'UnknownError' };
    mockSendMail.mockRejectedValueOnce(error);

    await expect(
      transport.send({
        to: 'recipient@example.com',
        subject: 'Test Email',
        html: '<p>Test content</p>',
      }),
    ).rejects.toThrow('SES error: Unknown AWS error');
  });
});
