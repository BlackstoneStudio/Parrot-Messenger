import { Parrot } from '../src/index';
import send from '../src/send';
import Templates from '../src/templates';

jest.mock('../src/send');
jest.mock('../src/templates');

describe('Parrot', () => {
  let parrot: Parrot;

  beforeEach(() => {
    jest.clearAllMocks();
    (send as jest.Mock).mockResolvedValue(undefined);
  });

  it('should initialize with default settings', () => {
    parrot = new Parrot();
    expect(parrot).toBeDefined();
    expect(parrot.templates).toBeDefined();
  });

  it('should initialize with custom settings', () => {
    const settings = {
      defaultClass: 'sms',
      transports: [
        {
          name: 'twilioSMS' as const,
          settings: {
            auth: { sid: 'test', token: 'test' },
            defaults: { from: '+15551234567' },
          },
        },
      ],
    };

    parrot = new Parrot(settings);
    expect(parrot).toBeDefined();
  });

  it('should send message through configured transports', async () => {
    parrot = new Parrot({
      transports: [
        {
          name: 'smtp' as const,
          settings: {
            auth: {},
            defaults: { from: 'default@example.com' },
          },
        },
      ],
    });

    const message = {
      to: 'test@example.com',
      subject: 'Test',
      html: '<p>Content</p>',
    };

    await parrot.send(message);

    expect(send).toHaveBeenCalledWith(
      message,
      expect.arrayContaining([
        expect.objectContaining({
          name: 'smtp',
          class: 'email',
          settings: expect.any(Object),
        }),
      ]),
      undefined,
    );
  });

  it('should send with transport filter', async () => {
    parrot = new Parrot({
      transports: [
        { name: 'smtp', settings: { auth: {}, defaults: {} } },
        { name: 'ses', settings: { auth: {}, defaults: {} } },
      ],
    });

    const message = {
      to: 'test@example.com',
      from: 'sender@example.com',
      subject: 'Test',
      html: 'Content',
    };

    await parrot.send(message, { class: 'email', name: 'smtp' });

    expect(send).toHaveBeenCalledWith(message, expect.any(Array), { class: 'email', name: 'smtp' });
  });

  it('should handle send errors', async () => {
    (send as jest.Mock).mockRejectedValue(new Error('Transport error'));

    parrot = new Parrot({
      transports: [{ name: 'smtp' as const, settings: { auth: {}, defaults: {} } }],
    });

    await expect(
      parrot.send({
        to: 'test@example.com',
        from: 'sender@example.com',
        subject: 'Test',
        html: 'Content',
      }),
    ).rejects.toThrow('Error sending message: Transport error');
  });

  it('should create templates instance', () => {
    parrot = new Parrot();
    expect(parrot.templates).toBeInstanceOf(Templates);
  });

  it('should pass correct transport class based on name', async () => {
    parrot = new Parrot({
      transports: [
        { name: 'smtp', settings: { auth: {}, defaults: {} } },
        { name: 'twilioSMS', settings: { auth: {}, defaults: {} } },
        { name: 'twilioCall', settings: { auth: {}, defaults: {} } },
      ],
    });

    await parrot.send({
      to: 'test@example.com',
      from: 'sender@example.com',
      subject: 'Test',
      html: 'Content',
    });

    const callArgs = (send as jest.Mock).mock.calls[0];
    const transports = callArgs[1];

    expect(transports).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'smtp', class: 'email' }),
        expect.objectContaining({ name: 'twilioSMS', class: 'sms' }),
        expect.objectContaining({ name: 'twilioCall', class: 'call' }),
      ]),
    );
  });
});
