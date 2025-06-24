import SNSTransport from '../../../src/transports/aws/sns';
import { Envelope, AWSSNS } from '../../../src/types';
import { SNS } from '@aws-sdk/client-sns';

jest.mock('@aws-sdk/client-sns', () => {
  const mockPublish = jest.fn().mockResolvedValue({ MessageId: 'test-message-id' });

  return {
    SNS: jest.fn().mockImplementation(() => ({
      publish: mockPublish,
    })),
  };
});

describe('SNSTransport', () => {
  let snsTransport: SNSTransport;
  let mockSettings: AWSSNS;
  let mockSNS: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockSettings = {
      auth: {
        region: 'us-east-1',
        accessKeyId: 'test-access-key',
        secretAccessKey: 'test-secret-key',
      },
      defaults: {
        from: 'DefaultSender',
      },
      smsType: 'Transactional',
    };

    snsTransport = new SNSTransport(mockSettings);
    mockSNS = snsTransport.transport;
  });

  describe('constructor', () => {
    it('should initialize with correct settings', () => {
      expect(snsTransport).toBeDefined();
      expect(snsTransport.transport).toBeDefined();
    });

    it('should create SNS client with auth settings', () => {
      expect(SNS).toHaveBeenCalledWith({
        region: 'us-east-1',
        credentials: {
          accessKeyId: 'test-access-key',
          secretAccessKey: 'test-secret-key',
        },
      });
    });
  });

  describe('send', () => {
    it('should send SMS with text content', async () => {
      const message: Envelope = {
        from: 'TestSender',
        to: '+1234567890',
        text: 'Test SMS message',
      };

      await snsTransport.send(message);

      expect(mockSNS.publish).toHaveBeenCalledWith({
        Message: 'Test SMS message',
        PhoneNumber: '+1234567890',
        MessageAttributes: {
          'AWS.SNS.SMS.SenderID': {
            DataType: 'String',
            StringValue: 'TestSender',
          },
          'AWS.SNS.SMS.SMSType': {
            DataType: 'String',
            StringValue: 'Transactional',
          },
        },
      });
    });

    it('should use HTML content when text is not provided', async () => {
      const message: Envelope = {
        to: '+1234567890',
        html: '<p>Test HTML message</p>',
      };

      await snsTransport.send(message);

      expect(mockSNS.publish).toHaveBeenCalledWith({
        Message: '<p>Test HTML message</p>',
        PhoneNumber: '+1234567890',
        MessageAttributes: {
          'AWS.SNS.SMS.SenderID': {
            DataType: 'String',
            StringValue: 'DefaultSender',
          },
          'AWS.SNS.SMS.SMSType': {
            DataType: 'String',
            StringValue: 'Transactional',
          },
        },
      });
    });

    it('should use default sender ID when from is not provided', async () => {
      const message: Envelope = {
        to: '+1234567890',
        text: 'Test message',
      };

      await snsTransport.send(message);

      expect(mockSNS.publish).toHaveBeenCalledWith({
        Message: 'Test message',
        PhoneNumber: '+1234567890',
        MessageAttributes: {
          'AWS.SNS.SMS.SenderID': {
            DataType: 'String',
            StringValue: 'DefaultSender',
          },
          'AWS.SNS.SMS.SMSType': {
            DataType: 'String',
            StringValue: 'Transactional',
          },
        },
      });
    });

    it('should use default ParrotSMS when no from is provided', async () => {
      const settingsNoDefaults: AWSSNS = {
        auth: {
          region: 'us-east-1',
          accessKeyId: 'test-access-key',
          secretAccessKey: 'test-secret-key',
        },
      };

      const transport = new SNSTransport(settingsNoDefaults);
      const message: Envelope = {
        to: '+1234567890',
        text: 'Test message',
      };

      await transport.send(message);

      expect(mockSNS.publish).toHaveBeenCalledWith({
        Message: 'Test message',
        PhoneNumber: '+1234567890',
        MessageAttributes: {
          'AWS.SNS.SMS.SenderID': {
            DataType: 'String',
            StringValue: 'ParrotSMS',
          },
          'AWS.SNS.SMS.SMSType': {
            DataType: 'String',
            StringValue: 'Transactional',
          },
        },
      });
    });

    it('should use promotional SMS type when specified', async () => {
      const promotionalSettings: AWSSNS = {
        auth: {
          region: 'us-east-1',
          accessKeyId: 'test-access-key',
          secretAccessKey: 'test-secret-key',
        },
        smsType: 'Promotional',
      };

      const transport = new SNSTransport(promotionalSettings);
      const message: Envelope = {
        to: '+1234567890',
        text: 'Promotional message',
      };

      await transport.send(message);

      expect(mockSNS.publish).toHaveBeenCalledWith({
        Message: 'Promotional message',
        PhoneNumber: '+1234567890',
        MessageAttributes: {
          'AWS.SNS.SMS.SenderID': {
            DataType: 'String',
            StringValue: 'ParrotSMS',
          },
          'AWS.SNS.SMS.SMSType': {
            DataType: 'String',
            StringValue: 'Promotional',
          },
        },
      });
    });

    it('should handle send errors', async () => {
      const error = new Error('SNS publish failed');
      mockSNS.publish.mockRejectedValueOnce(error);

      const message: Envelope = {
        to: '+1234567890',
        text: 'Test message',
      };

      await expect(snsTransport.send(message)).rejects.toThrow('SNS publish failed');
    });

    it('should handle empty message content', async () => {
      const message: Envelope = {
        to: '+1234567890',
      };

      await snsTransport.send(message);

      expect(mockSNS.publish).toHaveBeenCalledWith({
        Message: '',
        PhoneNumber: '+1234567890',
        MessageAttributes: {
          'AWS.SNS.SMS.SenderID': {
            DataType: 'String',
            StringValue: 'DefaultSender',
          },
          'AWS.SNS.SMS.SMSType': {
            DataType: 'String',
            StringValue: 'Transactional',
          },
        },
      });
    });
  });
});