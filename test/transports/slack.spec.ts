import Axios from 'axios';
import Slack from '../../src/transports/slack';
import { SlackConfig } from '../../src/types/slack';
import { Envelope } from '../../src/types';
import { TransportError } from '../../src/errors';

jest.mock('axios');
const mockedAxios = Axios as jest.Mocked<typeof Axios>;

describe('Slack Transport', () => {
  let slackTransport: Slack;
  let mockSettings: SlackConfig;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSettings = {
      auth: {
        token: 'xoxb-test-token',
      },
      defaults: {},
    };

    slackTransport = new Slack(mockSettings);
  });

  describe('constructor', () => {
    it('should throw error when neither token nor webhook is provided', () => {
      expect(() => {
        // eslint-disable-next-line no-new
        new Slack({
          auth: {},
          defaults: {},
        });
      }).toThrow(TransportError);
      expect(() => {
        // eslint-disable-next-line no-new
        new Slack({
          auth: {},
          defaults: {},
        });
      }).toThrow('Slack transport requires either a bot token or webhook URL');
    });

    it('should initialize with token', () => {
      const transport = new Slack({
        auth: { token: 'xoxb-123' },
        defaults: {},
      });
      expect(transport).toBeInstanceOf(Slack);
    });

    it('should initialize with webhook', () => {
      const transport = new Slack({
        auth: { webhook: 'https://hooks.slack.com/services/T00/B00/xxx' },
        defaults: {},
      });
      expect(transport).toBeInstanceOf(Slack);
    });
  });

  describe('send with token', () => {
    it('should send message via API', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: { ok: true, ts: '1234567890.123456' },
      });

      const message: Envelope = {
        to: '#general',
        text: 'Hello Slack!',
      };

      await slackTransport.send(message);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://slack.com/api/chat.postMessage',
        {
          channel: '#general',
          text: 'Hello Slack!',
        },
        {
          headers: {
            Authorization: 'Bearer xoxb-test-token',
            'Content-Type': 'application/json',
          },
        },
      );
    });

    it('should format channel names correctly', async () => {
      // Test various channel formats
      const testCases = [
        { input: 'general', expected: '#general' },
        { input: '#general', expected: '#general' },
        { input: '@user', expected: '@user' },
        { input: 'C1234567890', expected: 'C1234567890' }, // Channel ID
        { input: 'D1234567890', expected: 'D1234567890' }, // DM ID
      ];

      // Mock response for each test case
      testCases.forEach(() => {
        mockedAxios.post.mockResolvedValueOnce({
          data: { ok: true },
        });
      });

      await Promise.all(
        testCases.map(async ({ input, expected }, index) => {
          await slackTransport.send({ to: input, text: 'test' });

          const call = mockedAxios.post.mock.calls[index];
          expect(call[1]).toMatchObject({ channel: expected });
        }),
      );
    });

    it('should convert HTML to Slack markdown', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: { ok: true },
      });

      const message: Envelope = {
        to: '#general',
        html: '<p>Hello <b>world</b>! Visit <a href="https://example.com">our site</a></p>',
      };

      await slackTransport.send(message);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          text: 'Hello *world*! Visit <https://example.com|our site>',
        }),
        expect.any(Object),
      );
    });

    it('should use subject as attachment pretext', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: { ok: true },
      });

      const message: Envelope = {
        to: '#general',
        subject: 'Important Update',
        text: 'This is the message content',
      };

      await slackTransport.send(message);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          attachments: [
            {
              pretext: 'Important Update',
              text: 'This is the message content',
              color: 'good',
            },
          ],
        }),
        expect.any(Object),
      );
    });

    it('should handle API errors', async () => {
      mockedAxios.post.mockResolvedValue({
        data: { ok: false, error: 'channel_not_found' },
      });

      const message: Envelope = {
        to: '#nonexistent',
        text: 'Hello',
      };

      await expect(slackTransport.send(message)).rejects.toThrow(TransportError);
      await expect(slackTransport.send(message)).rejects.toThrow(
        'Slack send failed: channel_not_found',
      );
    });

    it('should use default channel when no recipient specified', async () => {
      const transportWithDefault = new Slack({
        auth: { token: 'xoxb-123' },
        defaultChannel: '#notifications',
        defaults: {},
      });

      mockedAxios.post.mockResolvedValueOnce({
        data: { ok: true },
      });

      await transportWithDefault.send({ text: 'No recipient message' });

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          channel: '#notifications',
        }),
        expect.any(Object),
      );
    });
  });

  describe('send with webhook', () => {
    let webhookTransport: Slack;

    beforeEach(() => {
      webhookTransport = new Slack({
        auth: {
          webhook: 'https://hooks.slack.com/services/T00/B00/xxx',
        },
        defaults: {},
      });
    });

    it('should send message via webhook', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: 'ok',
      });

      const message: Envelope = {
        from: 'Notification Bot',
        text: 'Hello from webhook!',
      };

      await webhookTransport.send(message);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://hooks.slack.com/services/T00/B00/xxx',
        {
          text: 'Hello from webhook!',
          username: 'Notification Bot',
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    });

    it('should handle webhook errors', async () => {
      mockedAxios.post.mockResolvedValue({
        data: 'invalid_payload',
      });

      await expect(webhookTransport.send({ text: 'test' })).rejects.toThrow(TransportError);
      await expect(webhookTransport.send({ text: 'test' })).rejects.toThrow(
        'Webhook returned: invalid_payload',
      );
    });
  });

  describe('HTML to Slack markdown conversion', () => {
    it('should convert various HTML tags', async () => {
      const htmlTests = [
        {
          html: '<b>bold</b> <strong>strong</strong>',
          expected: '*bold* *strong*',
        },
        {
          html: '<i>italic</i> <em>emphasis</em>',
          expected: '_italic_ _emphasis_',
        },
        {
          html: '<code>inline code</code>',
          expected: '`inline code`',
        },
        {
          html: '<pre>code block</pre>',
          expected: '```\ncode block\n```',
        },
        {
          html: '<p>Paragraph 1</p><p>Paragraph 2</p>',
          expected: 'Paragraph 1\n\nParagraph 2',
        },
      ];

      // Mock response for each test case
      htmlTests.forEach(() => {
        mockedAxios.post.mockResolvedValueOnce({
          data: { ok: true },
        });
      });

      await Promise.all(
        htmlTests.map(async ({ html, expected }, index) => {
          await slackTransport.send({ to: '#test', html });

          const call = mockedAxios.post.mock.calls[index];
          expect(call[1]).toMatchObject({ text: expected });
        }),
      );
    });
  });

  describe('Slack attachments', () => {
    it('should recognize and use Slack-formatted attachments', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: { ok: true },
      });

      const message: Envelope = {
        to: '#general',
        text: 'Message with attachments',
        attachments: [
          {
            fallback: "New ticket from Andrea Lee - Ticket #1943: Can't rest my password",
            color: '#36a64f',
            pretext: 'New ticket from Andrea Lee',
            title: "Ticket #1943: Can't reset my password",
            title_link: 'https://example.com/tickets/1943',
            fields: [
              {
                title: 'Priority',
                value: 'High',
                short: true,
              },
            ],
          } as any,
        ],
      };

      await slackTransport.send(message);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          attachments: message.attachments,
        }),
        expect.any(Object),
      );
    });
  });

  describe('error handling', () => {
    it('should wrap network errors', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Network error'));

      await expect(slackTransport.send({ to: '#general', text: 'test' })).rejects.toThrow(
        TransportError,
      );
      await expect(slackTransport.send({ to: '#general', text: 'test' })).rejects.toThrow(
        'Slack send failed: Network error',
      );
    });

    it('should handle non-Error exceptions', async () => {
      mockedAxios.post.mockRejectedValueOnce('String error');

      await expect(slackTransport.send({ to: '#general', text: 'test' })).rejects.toThrow(
        'Slack send failed: String error',
      );
    });
  });
});
