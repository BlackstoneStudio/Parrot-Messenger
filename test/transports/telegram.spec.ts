import Axios from 'axios';
import Telegram from '../../src/transports/telegram';
import { TelegramConfig } from '../../src/types/telegram';
import { Envelope } from '../../src/types';
import { TransportError } from '../../src/errors';

jest.mock('axios');
const mockedAxios = Axios as jest.Mocked<typeof Axios>;

describe('Telegram Transport', () => {
  let telegramTransport: Telegram;
  let mockSettings: TelegramConfig;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSettings = {
      auth: {
        botToken: '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11',
      },
      defaults: {},
    };

    telegramTransport = new Telegram(mockSettings);
  });

  describe('constructor', () => {
    it('should throw error when bot token is not provided', () => {
      expect(() => {
        // eslint-disable-next-line no-new
        new Telegram({
          auth: {} as any,
          defaults: {},
        });
      }).toThrow(TransportError);
      expect(() => {
        // eslint-disable-next-line no-new
        new Telegram({
          auth: {} as any,
          defaults: {},
        });
      }).toThrow('Telegram transport requires a bot token');
    });

    it('should throw error for invalid bot token format', () => {
      expect(() => {
        // eslint-disable-next-line no-new
        new Telegram({
          auth: {
            botToken: 'invalid-token-format',
          },
          defaults: {},
        });
      }).toThrow('Invalid Telegram bot token format');
    });

    it('should initialize with valid bot token', () => {
      const transport = new Telegram({
        auth: { botToken: '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11' },
        defaults: {},
      });
      expect(transport).toBeInstanceOf(Telegram);
    });
  });

  describe('send', () => {
    it('should send message via Telegram API', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          ok: true,
          result: {
            message_id: 1,
            date: 1234567890,
            chat: { id: 123456, type: 'private' },
            text: 'Hello Telegram!',
          },
        },
      });

      const message: Envelope = {
        to: '123456789',
        text: 'Hello Telegram!',
      };

      await telegramTransport.send(message);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://api.telegram.org/bot123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11/sendMessage',
        {
          chat_id: '123456789',
          text: 'Hello Telegram!',
          parse_mode: 'HTML',
          disable_web_page_preview: false,
          disable_notification: false,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    });

    it('should format chat IDs correctly', async () => {
      // Test various chat ID formats
      const testCases = [
        { input: '123456789', expected: '123456789' },
        { input: '-123456789', expected: '-123456789' },
        { input: '@channelname', expected: '@channelname' },
        { input: 'username', expected: 'username' },
      ];

      // Mock response for each test case
      testCases.forEach(() => {
        mockedAxios.post.mockResolvedValueOnce({
          data: { ok: true, result: {} },
        });
      });

      await Promise.all(
        testCases.map(async ({ input, expected }, index) => {
          await telegramTransport.send({ to: input, text: 'test' });

          const call = mockedAxios.post.mock.calls[index];
          expect(call[1]).toMatchObject({ chat_id: expected });
        }),
      );
    });

    it('should convert HTML to Telegram-compatible format', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: { ok: true, result: {} },
      });

      const message: Envelope = {
        to: '123456',
        html: '<p>Hello <b>world</b>! Visit <a href="https://example.com">our site</a></p>',
      };

      await telegramTransport.send(message);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          text: 'Hello <b>world</b>! Visit <a href="https://example.com">our site</a>',
        }),
        expect.any(Object),
      );
    });

    it('should add subject as bold header', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: { ok: true, result: {} },
      });

      const message: Envelope = {
        to: '123456',
        subject: 'Important Update',
        text: 'This is the message content',
      };

      await telegramTransport.send(message);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          text: '<b>Important Update</b>\n\nThis is the message content',
        }),
        expect.any(Object),
      );
    });

    it('should handle API errors', async () => {
      mockedAxios.post.mockResolvedValue({
        data: {
          ok: false,
          error_code: 400,
          description: 'Bad Request: chat not found',
        },
      });

      const message: Envelope = {
        to: 'invalid_chat',
        text: 'Hello',
      };

      await expect(telegramTransport.send(message)).rejects.toThrow(TransportError);
      await expect(telegramTransport.send(message)).rejects.toThrow(
        'Telegram send failed: Bad Request: chat not found',
      );
    });

    it('should use default chat ID when no recipient specified', async () => {
      const transportWithDefault = new Telegram({
        auth: { botToken: '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11' },
        defaultChatId: '@defaultchannel',
        defaults: {},
      });

      mockedAxios.post.mockResolvedValueOnce({
        data: { ok: true, result: {} },
      });

      await transportWithDefault.send({ text: 'No recipient message' });

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          chat_id: '@defaultchannel',
        }),
        expect.any(Object),
      );
    });

    it('should throw error when no recipient and no default chat ID', async () => {
      await expect(telegramTransport.send({ text: 'test' })).rejects.toThrow(
        'No recipient specified and no default chat ID configured',
      );
    });

    it('should respect custom parse mode', async () => {
      const transportWithMarkdown = new Telegram({
        auth: { botToken: '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11' },
        parseMode: 'Markdown',
        defaults: {},
      });

      mockedAxios.post.mockResolvedValueOnce({
        data: { ok: true, result: {} },
      });

      await transportWithMarkdown.send({
        to: '123456',
        subject: 'Test',
        text: 'Message',
      });

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          parse_mode: 'Markdown',
          text: '*Test*\n\nMessage',
        }),
        expect.any(Object),
      );
    });

    it('should respect disable options', async () => {
      const transportWithOptions = new Telegram({
        auth: { botToken: '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11' },
        disableWebPagePreview: true,
        disableNotification: true,
        defaults: {},
      });

      mockedAxios.post.mockResolvedValueOnce({
        data: { ok: true, result: {} },
      });

      await transportWithOptions.send({
        to: '123456',
        text: 'Message with link: https://example.com',
      });

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          disable_web_page_preview: true,
          disable_notification: true,
        }),
        expect.any(Object),
      );
    });
  });

  describe('HTML to Telegram conversion', () => {
    it('should convert various HTML tags', async () => {
      const htmlTests = [
        {
          html: '<b>bold</b> <strong>strong</strong>',
          expected: '<b>bold</b> <b>strong</b>',
        },
        {
          html: '<i>italic</i> <em>emphasis</em>',
          expected: '<i>italic</i> <i>emphasis</i>',
        },
        {
          html: '<u>underline</u>',
          expected: '<u>underline</u>',
        },
        {
          html: '<s>strikethrough</s> <strike>strike</strike> <del>deleted</del>',
          expected: '<s>strikethrough</s> <s>strike</s> <s>deleted</s>',
        },
        {
          html: '<code>inline code</code>',
          expected: '<code>inline code</code>',
        },
        {
          html: '<pre>code block</pre>',
          expected: '<pre>code block</pre>',
        },
        {
          html: '<p>Paragraph 1</p><p>Paragraph 2</p>',
          expected: 'Paragraph 1\n\nParagraph 2',
        },
        {
          html: '<h1>Heading</h1>Content',
          expected: '<b>Heading</b>\n\nContent',
        },
        {
          html: 'Line 1<br>Line 2',
          expected: 'Line 1\nLine 2',
        },
        {
          html: 'Before<hr>After',
          expected: 'Before\n———\nAfter',
        },
      ];

      // Mock response for each test case
      htmlTests.forEach(() => {
        mockedAxios.post.mockResolvedValueOnce({
          data: { ok: true, result: {} },
        });
      });

      await Promise.all(
        htmlTests.map(async ({ html, expected }, index) => {
          await telegramTransport.send({ to: '123456', html });

          const call = mockedAxios.post.mock.calls[index];
          expect(call[1]).toMatchObject({ text: expected });
        }),
      );
    });
  });

  describe('Telegram attachments', () => {
    it('should recognize and use inline keyboard markup', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: { ok: true, result: {} },
      });

      const message: Envelope = {
        to: '123456',
        text: 'Choose an option:',
        attachments: [
          {
            inline_keyboard: [
              [
                { text: 'Option 1', callback_data: 'option1' },
                { text: 'Option 2', callback_data: 'option2' },
              ],
              [{ text: 'Visit Site', url: 'https://example.com' }],
            ],
          } as any,
        ],
      };

      await telegramTransport.send(message);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          reply_markup: message.attachments![0],
        }),
        expect.any(Object),
      );
    });
  });

  describe('error handling', () => {
    it('should wrap network errors', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Network error'));

      await expect(telegramTransport.send({ to: '123456', text: 'test' })).rejects.toThrow(
        TransportError,
      );
      await expect(telegramTransport.send({ to: '123456', text: 'test' })).rejects.toThrow(
        'Telegram send failed: Network error',
      );
    });

    it('should handle non-Error exceptions', async () => {
      mockedAxios.post.mockRejectedValueOnce('String error');

      await expect(telegramTransport.send({ to: '123456', text: 'test' })).rejects.toThrow(
        'Telegram send failed: String error',
      );
    });

    it('should handle invalid response', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: null,
      });

      await expect(telegramTransport.send({ to: '123456', text: 'test' })).rejects.toThrow(
        'Invalid response from Telegram API',
      );
    });
  });
});
