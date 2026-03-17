import { BaseAWSTransport } from '../../../src/transports/aws/base';
import { TransportError } from '../../../src/errors';

// Create a concrete implementation for testing
class TestAWSTransport extends BaseAWSTransport<any> {
  transport: any = {
    // Mock AWS client
  };

  // eslint-disable-next-line class-methods-use-this
  async send(): Promise<void> {
    // Not used in these tests
  }

  // Expose protected method for testing
  // eslint-disable-next-line class-methods-use-this
  public testWrapError(error: any): void {
    (BaseAWSTransport as any).wrapError(error, 'TestService');
  }
}

describe('BaseAWSTransport', () => {
  describe('wrapError', () => {
    let transport: TestAWSTransport;

    beforeEach(() => {
      transport = new TestAWSTransport({
        auth: {
          region: 'us-east-1',
          accessKeyId: 'test-key',
          secretAccessKey: 'test-secret',
        },
        defaults: {},
      });
    });

    it('should handle AWS error with message', () => {
      const error = {
        message: 'Invalid credentials',
        code: 'InvalidCredentials',
        $metadata: {
          httpStatusCode: 401,
          requestId: 'req-123',
        },
      };

      expect(() => {
        transport.testWrapError(error);
      }).toThrow(TransportError);

      expect(() => {
        transport.testWrapError(error);
      }).toThrow('AWS TestService error: Invalid credentials');
    });

    it('should handle AWS error without message', () => {
      const error = {
        code: 'UnknownError',
        $metadata: {
          httpStatusCode: 500,
        },
      };

      expect(() => {
        transport.testWrapError(error);
      }).toThrow(TransportError);

      expect(() => {
        transport.testWrapError(error);
      }).toThrow('AWS TestService error: Unknown AWS error');
    });

    it('should handle error without $metadata', () => {
      const error = {
        message: 'Some error',
        code: 'SOME_ERROR',
      };

      expect(() => {
        transport.testWrapError(error);
      }).toThrow(TransportError);

      expect(() => {
        transport.testWrapError(error);
      }).toThrow('AWS TestService error: Some error');
    });

    it('should handle plain Error object', () => {
      const error = new Error('Network timeout');

      expect(() => {
        transport.testWrapError(error);
      }).toThrow(TransportError);

      expect(() => {
        transport.testWrapError(error);
      }).toThrow('AWS TestService error: Network timeout');
    });

    it('should handle error with only $metadata', () => {
      const error = {
        $metadata: {
          httpStatusCode: 503,
          requestId: 'req-456',
        },
      };

      expect(() => {
        transport.testWrapError(error);
      }).toThrow(TransportError);

      expect(() => {
        transport.testWrapError(error);
      }).toThrow('AWS TestService error: Unknown AWS error');
    });
  });

  describe('constructor', () => {
    it('should properly initialize with valid config', () => {
      const transport = new TestAWSTransport({
        auth: {
          region: 'us-west-2',
          accessKeyId: 'my-key',
          secretAccessKey: 'my-secret',
        },
        defaults: {},
      });

      expect((transport as any).region).toBe('us-west-2');
      expect((transport as any).credentials).toEqual({
        accessKeyId: 'my-key',
        secretAccessKey: 'my-secret',
      });
    });
  });
});
