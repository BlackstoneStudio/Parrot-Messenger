import send from '../src/send';
import SMTP from '../src/transports/smtp';
import SES from '../src/transports/aws/ses';
import { validateEnvelope } from '../src/validation';
import TransportRegistry from '../src/registry/TransportRegistry';

jest.mock('../src/transports/smtp');
jest.mock('../src/transports/aws/ses');
jest.mock('../src/validation');
jest.mock('../src/registry/TransportRegistry');

describe('send', () => {
  let mockSend: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSend = jest.fn().mockResolvedValue(undefined);
    (SMTP as unknown as jest.Mock).mockImplementation(() => ({ send: mockSend }));
    (SES as unknown as jest.Mock).mockImplementation(() => ({ send: mockSend }));
    (validateEnvelope as jest.Mock).mockImplementation(() => {});

    // Mock TransportRegistry
    const mockRegistry = {
      has: jest.fn().mockReturnValue(true),
      get: jest.fn().mockImplementation((name: string) => {
        if (name === 'smtp') return SMTP;
        if (name === 'ses') return SES;
        return null;
      }),
    };
    (TransportRegistry.getInstance as jest.Mock).mockReturnValue(mockRegistry);
  });

  it('should send message through matching transport', async () => {
    const message = {
      to: 'test@example.com',
      from: 'sender@example.com',
      subject: 'Test',
      html: '<p>Content</p>',
    };

    const transports = [
      {
        name: 'smtp' as const,
        class: 'email' as const,
        settings: {
          auth: {
            host: 'localhost',
            port: 587,
            secure: false,
            auth: { user: 'test', pass: 'test' },
          },
          defaults: { from: 'default@example.com' },
        },
      },
    ];

    await send(message, transports);

    expect(validateEnvelope).toHaveBeenCalledWith(expect.objectContaining(message), 'email');
    expect(mockSend).toHaveBeenCalledWith(expect.objectContaining(message));
  });

  it('should filter transports by name', async () => {
    const message = {
      to: 'test@example.com',
      from: 'sender@example.com',
      subject: 'Test',
      html: 'Content',
    };

    const transports = [
      {
        name: 'smtp' as const,
        class: 'email' as const,
        settings: {
          auth: {
            host: 'localhost',
            port: 587,
            secure: false,
            auth: { user: 'test', pass: 'test' },
          },
          defaults: {},
        },
      },
      {
        name: 'ses' as const,
        class: 'email' as const,
        settings: {
          auth: { accessKeyId: 'test', secretAccessKey: 'test', region: 'us-east-1' },
          defaults: {},
        },
      },
    ];

    await send(message, transports, { class: 'email', name: 'smtp' });

    expect(SMTP).toHaveBeenCalledTimes(1);
  });

  it('should filter transports by class', async () => {
    const message = { to: '+15551234567', from: '+15559876543', text: 'SMS' };

    const transports = [
      {
        name: 'smtp' as const,
        class: 'email' as const,
        settings: {
          auth: {
            host: 'localhost',
            port: 587,
            secure: false,
            auth: { user: 'test', pass: 'test' },
          },
          defaults: {},
        },
      },
      {
        name: 'twilioSMS' as const,
        class: 'sms' as const,
        settings: {
          auth: { sid: 'test', token: 'test' },
          defaults: {},
        },
      },
    ];

    await send(message, transports, { class: 'email', name: 'smtp' });

    expect(SMTP).toHaveBeenCalledTimes(1);
  });

  it('should handle array of transport filters', async () => {
    const message = {
      to: 'test@example.com',
      from: 'sender@example.com',
      subject: 'Test',
      html: 'Content',
    };

    const transports = [
      {
        name: 'smtp' as const,
        class: 'email' as const,
        settings: {
          auth: {
            host: 'localhost',
            port: 587,
            secure: false,
            auth: { user: 'test', pass: 'test' },
          },
          defaults: {},
        },
      },
      {
        name: 'ses' as const,
        class: 'email' as const,
        settings: {
          auth: { accessKeyId: 'test', secretAccessKey: 'test', region: 'us-east-1' },
          defaults: {},
        },
      },
      {
        name: 'twilioSMS' as const,
        class: 'sms' as const,
        settings: {
          auth: { sid: 'test', token: 'test' },
          defaults: {},
        },
      },
    ];

    await send(message, transports, [
      { class: 'email', name: 'smtp' },
      { class: 'email', name: 'ses' },
    ]);

    expect(SMTP).toHaveBeenCalledTimes(1);
    expect(SES).toHaveBeenCalledTimes(1);
  });

  it('should throw when transport not found', async () => {
    const message = {
      to: 'test@example.com',
      from: 'sender@example.com',
      subject: 'Test',
      html: 'Content',
    };
    const transports = [
      {
        name: 'smtp' as const,
        class: 'email' as const,
        settings: {
          auth: {
            host: 'localhost',
            port: 587,
            secure: false,
            auth: { user: 'test', pass: 'test' },
          },
          defaults: {},
        },
      },
    ];

    await expect(
      send(message, transports, { class: 'email', name: 'nonexistent' } as unknown as Parameters<
        typeof send
      >[2]),
    ).rejects.toThrow('Transport nonexistent not found');
  });

  it('should throw when transport handler not available', async () => {
    const message = {
      to: 'test@example.com',
      from: 'sender@example.com',
      subject: 'Test',
      html: 'Content',
    };
    const transports = [
      {
        name: 'unknown',
        class: 'email',
        settings: {
          auth: {
            host: 'localhost',
            port: 587,
            secure: false,
            auth: { user: 'test', pass: 'test' },
          },
          defaults: {},
        },
      },
    ] as unknown as Parameters<typeof send>[1];

    // Mock TransportRegistry to not have the 'unknown' transport
    const mockRegistry = {
      has: jest.fn().mockImplementation((name: string) => name !== 'unknown'),
      get: jest.fn().mockImplementation((name: string) => {
        if (name === 'smtp') return SMTP;
        if (name === 'ses') return SES;
        return null;
      }),
    };
    (TransportRegistry.getInstance as jest.Mock).mockReturnValue(mockRegistry);

    await expect(send(message, transports)).rejects.toThrow(
      'Transport unknown not found & no mailer function available',
    );
  });

  it('should throw validation errors with context', async () => {
    (validateEnvelope as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid email');
    });

    const message = { to: 'invalid', from: 'sender@example.com', subject: 'Test', html: 'Content' };
    const transports = [
      {
        name: 'smtp' as const,
        class: 'email' as const,
        settings: {
          auth: {
            host: 'localhost',
            port: 587,
            secure: false,
            auth: { user: 'test', pass: 'test' },
          },
          defaults: {},
        },
      },
    ];

    await expect(send(message, transports)).rejects.toThrow('Validation Error: Invalid email');
  });

  it('should re-throw ValidationError instances without wrapping', async () => {
    const { ValidationError } = await import('../src/errors');
    const validationError = new ValidationError('Email is invalid', { field: 'email' });

    (validateEnvelope as jest.Mock).mockImplementation(() => {
      throw validationError;
    });

    const message = { to: 'invalid', from: 'sender@example.com', subject: 'Test', html: 'Content' };
    const transports = [
      {
        name: 'smtp' as const,
        class: 'email' as const,
        settings: {
          auth: {
            host: 'localhost',
            port: 587,
            secure: false,
            auth: { user: 'test', pass: 'test' },
          },
          defaults: {},
        },
      },
    ];

    await expect(send(message, transports)).rejects.toThrow(validationError);
  });

  it('should merge defaults with message data', async () => {
    const message = { to: 'test@example.com', subject: 'Test', html: 'Content' };
    const transports = [
      {
        name: 'smtp' as const,
        class: 'email' as const,
        settings: {
          auth: {
            host: 'localhost',
            port: 587,
            secure: false,
            auth: { user: 'test', pass: 'test' },
          },
          defaults: { from: 'default@example.com' },
        },
      },
    ];

    await send(message, transports);

    expect(mockSend).toHaveBeenCalledWith({
      from: 'default@example.com',
      to: 'test@example.com',
      subject: 'Test',
      html: 'Content',
    });
  });

  it('should send through all transports when no filter', async () => {
    const message = {
      to: 'test@example.com',
      from: 'sender@example.com',
      subject: 'Test',
      html: 'Content',
    };
    const transports = [
      {
        name: 'smtp' as const,
        class: 'email' as const,
        settings: {
          auth: {
            host: 'localhost',
            port: 587,
            secure: false,
            auth: { user: 'test', pass: 'test' },
          },
          defaults: {},
        },
      },
      {
        name: 'smtp' as const,
        class: 'email' as const,
        settings: {
          auth: {
            host: 'localhost',
            port: 587,
            secure: false,
            auth: { user: 'test', pass: 'test' },
          },
          defaults: {},
        },
      },
    ];

    await send(message, transports);

    expect(SMTP).toHaveBeenCalledTimes(2);
  });

  it('should filter by name only in array filter', async () => {
    const message = {
      to: 'test@example.com',
      from: 'sender@example.com',
      subject: 'Test',
      html: 'Content',
    };
    const transports = [
      {
        name: 'smtp' as const,
        class: 'email' as const,
        settings: {
          auth: {
            host: 'localhost',
            port: 587,
            secure: false,
            auth: { user: 'test', pass: 'test' },
          },
          defaults: {},
        },
      },
      {
        name: 'ses' as const,
        class: 'email' as const,
        settings: {
          auth: { accessKeyId: 'test', secretAccessKey: 'test', region: 'us-east-1' },
          defaults: {},
        },
      },
    ];

    await send(message, transports, [{ name: 'smtp' } as any]);

    expect(SMTP).toHaveBeenCalledTimes(1);
    expect(SES).not.toHaveBeenCalled();
  });

  it('should filter by class only in array filter', async () => {
    const message = {
      to: 'test@example.com',
      from: 'sender@example.com',
      subject: 'Test',
      html: 'Content',
    };
    const transports = [
      {
        name: 'smtp' as const,
        class: 'email' as const,
        settings: {
          auth: {
            host: 'localhost',
            port: 587,
            secure: false,
            auth: { user: 'test', pass: 'test' },
          },
          defaults: {},
        },
      },
      {
        name: 'ses' as const,
        class: 'email' as const,
        settings: {
          auth: { accessKeyId: 'test', secretAccessKey: 'test', region: 'us-east-1' },
          defaults: {},
        },
      },
    ];

    await send(message, transports, [{ class: 'email' } as any]);

    expect(SMTP).toHaveBeenCalledTimes(1);
    expect(SES).toHaveBeenCalledTimes(1);
  });

  it('should filter by name only in single filter', async () => {
    const message = {
      to: 'test@example.com',
      from: 'sender@example.com',
      subject: 'Test',
      html: 'Content',
    };
    const transports = [
      {
        name: 'smtp' as const,
        class: 'email' as const,
        settings: {
          auth: {
            host: 'localhost',
            port: 587,
            secure: false,
            auth: { user: 'test', pass: 'test' },
          },
          defaults: {},
        },
      },
      {
        name: 'ses' as const,
        class: 'email' as const,
        settings: {
          auth: { accessKeyId: 'test', secretAccessKey: 'test', region: 'us-east-1' },
          defaults: {},
        },
      },
    ];

    await send(message, transports, { name: 'smtp' } as any);

    expect(SMTP).toHaveBeenCalledTimes(1);
    expect(SES).not.toHaveBeenCalled();
  });

  it('should filter by class only in single filter', async () => {
    const message = {
      to: 'test@example.com',
      from: 'sender@example.com',
      subject: 'Test',
      html: 'Content',
    };
    const transports = [
      {
        name: 'smtp' as const,
        class: 'email' as const,
        settings: {
          auth: {
            host: 'localhost',
            port: 587,
            secure: false,
            auth: { user: 'test', pass: 'test' },
          },
          defaults: {},
        },
      },
      {
        name: 'ses' as const,
        class: 'email' as const,
        settings: {
          auth: { accessKeyId: 'test', secretAccessKey: 'test', region: 'us-east-1' },
          defaults: {},
        },
      },
    ];

    await send(message, transports, { class: 'email' } as any);

    expect(SMTP).toHaveBeenCalledTimes(1);
    expect(SES).toHaveBeenCalledTimes(1);
  });

  it('should handle empty filter object in array', async () => {
    const message = {
      to: 'test@example.com',
      from: 'sender@example.com',
      subject: 'Test',
      html: 'Content',
    };
    const transports = [
      {
        name: 'smtp' as const,
        class: 'email' as const,
        settings: {
          auth: {
            host: 'localhost',
            port: 587,
            secure: false,
            auth: { user: 'test', pass: 'test' },
          },
          defaults: {},
        },
      },
    ];

    await expect(send(message, transports, [{} as any])).rejects.toThrow('Transport  not found');
  });

  it('should handle empty filter object', async () => {
    const message = {
      to: 'test@example.com',
      from: 'sender@example.com',
      subject: 'Test',
      html: 'Content',
    };
    const transports = [
      {
        name: 'smtp' as const,
        class: 'email' as const,
        settings: {
          auth: {
            host: 'localhost',
            port: 587,
            secure: false,
            auth: { user: 'test', pass: 'test' },
          },
          defaults: {},
        },
      },
    ];

    await expect(send(message, transports, {} as any)).rejects.toThrow(
      'Transport undefined not found',
    );
  });

  it('should show multiple transport names in error for array filter', async () => {
    const message = {
      to: 'test@example.com',
      from: 'sender@example.com',
      subject: 'Test',
      html: 'Content',
    };
    const transports = [
      {
        name: 'smtp' as const,
        class: 'email' as const,
        settings: {
          auth: {
            host: 'localhost',
            port: 587,
            secure: false,
            auth: { user: 'test', pass: 'test' },
          },
          defaults: {},
        },
      },
    ];

    await expect(
      send(message, transports, [
        { name: 'nonexistent1' },
        { name: 'nonexistent2' },
      ] as unknown as Parameters<typeof send>[2]),
    ).rejects.toThrow('Transport nonexistent1, nonexistent2 not found');
  });
});
