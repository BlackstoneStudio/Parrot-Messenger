import Axios from 'axios';
import DOMPurify from 'isomorphic-dompurify';
import { Envelope, GenericTransport } from '../types';
import { TelegramConfig, TelegramMessage, TelegramResponse } from '../types/telegram';
import { TransportError } from '../errors';

interface TelegramInternalMessage extends TelegramMessage {
  reply_markup?: any;
}

class Telegram implements GenericTransport<typeof Axios> {
  transport: typeof Axios;

  private baseURL: string;

  constructor(private settings: TelegramConfig) {
    this.transport = Axios;

    // Validate configuration
    if (!settings.auth.botToken) {
      throw new TransportError('Telegram transport requires a bot token', 'telegram');
    }

    // Validate bot token format
    if (!/^\d+:[A-Za-z0-9_-]+$/.test(settings.auth.botToken)) {
      throw new TransportError('Invalid Telegram bot token format', 'telegram');
    }

    this.baseURL = `https://api.telegram.org/bot${settings.auth.botToken}`;
  }

  async send(message: Envelope): Promise<void> {
    const request = {
      ...this.settings.defaults,
      ...message,
    };

    try {
      const telegramMessage = this.formatMessage(request);
      await this.sendMessage(telegramMessage);
    } catch (error) {
      throw new TransportError(
        `Telegram send failed: ${error instanceof Error ? error.message : String(error)}`,
        'telegram',
        { originalError: error },
      );
    }
  }

  private async sendMessage(message: TelegramInternalMessage): Promise<void> {
    const response = await this.transport.post<TelegramResponse>(
      `${this.baseURL}/sendMessage`,
      message,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response || !response.data) {
      throw new Error('Invalid response from Telegram API');
    }

    if (!response.data.ok) {
      throw new Error(
        response.data.description || `Telegram API error ${response.data.error_code || 'unknown'}`,
      );
    }
  }

  private formatMessage(message: Envelope): TelegramInternalMessage {
    const telegramMessage: TelegramInternalMessage = {
      chat_id: this.getChatId(message),
      text: '',
      parse_mode: this.settings.parseMode || 'HTML',
      disable_web_page_preview: this.settings.disableWebPagePreview || false,
      disable_notification: this.settings.disableNotification || false,
    };

    // Convert content to text
    if (message.html) {
      // Convert HTML to Telegram-compatible format
      telegramMessage.text = Telegram.htmlToTelegram(message.html);
    } else if (message.text) {
      telegramMessage.text = message.text;
    }

    // Add subject as bold header if provided
    if (message.subject) {
      const boldSubject =
        this.settings.parseMode === 'Markdown'
          ? `*${Telegram.escapeMarkdown(message.subject)}*\n\n`
          : `<b>${Telegram.escapeHtml(message.subject)}</b>\n\n`;
      telegramMessage.text = boldSubject + telegramMessage.text;
    }

    // Handle Telegram-specific attachments (like inline keyboards)
    if (message.attachments && Telegram.isTelegramReplyMarkup(message.attachments)) {
      [telegramMessage.reply_markup] = message.attachments;
    }

    return telegramMessage;
  }

  private getChatId(message: Envelope): string | number {
    if (message.to) {
      // Support @username format or numeric chat IDs
      return /^@[a-zA-Z0-9_]+$/.test(message.to) || /^-?\d+$/.test(message.to)
        ? message.to
        : message.to;
    }

    if (this.settings.defaultChatId) {
      return this.settings.defaultChatId;
    }

    throw new Error('No recipient specified and no default chat ID configured');
  }

  private static htmlToTelegram(html: string): string {
    // Sanitize HTML but allow Telegram-supported tags
    const clean = DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        'a',
        'b',
        'strong',
        'i',
        'em',
        'u',
        's',
        'strike',
        'del',
        'code',
        'pre',
        'p',
        'br',
        'hr',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'div',
        'span',
      ],
      ALLOWED_ATTR: ['href'],
      ALLOW_DATA_ATTR: false,
      ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i,
    });

    // Telegram supports a subset of HTML tags
    // https://core.telegram.org/bots/api#html-style
    return (
      clean
        // Keep supported tags
        .replace(/<b>/g, '<b>')
        .replace(/<\/b>/g, '</b>')
        .replace(/<strong>/g, '<b>')
        .replace(/<\/strong>/g, '</b>')
        .replace(/<i>/g, '<i>')
        .replace(/<\/i>/g, '</i>')
        .replace(/<em>/g, '<i>')
        .replace(/<\/em>/g, '</i>')
        .replace(/<u>/g, '<u>')
        .replace(/<\/u>/g, '</u>')
        .replace(/<s>/g, '<s>')
        .replace(/<\/s>/g, '</s>')
        .replace(/<strike>/g, '<s>')
        .replace(/<\/strike>/g, '</s>')
        .replace(/<del>/g, '<s>')
        .replace(/<\/del>/g, '</s>')
        .replace(/<code>/g, '<code>')
        .replace(/<\/code>/g, '</code>')
        .replace(/<pre>/g, '<pre>')
        .replace(/<\/pre>/g, '</pre>')
        // Convert links
        .replace(/<a\s+href="([^"]+)"[^>]*>([^<]+)<\/a>/g, '<a href="$1">$2</a>')
        // Remove unsupported tags
        .replace(/<p>/g, '')
        .replace(/<\/p>/g, '\n\n')
        .replace(/<br\s*\/?>/g, '\n')
        .replace(/<hr\s*\/?>/g, '\n———\n')
        .replace(/<h[1-6]>/g, '<b>')
        .replace(/<\/h[1-6]>/g, '</b>\n\n')
        // Remove all other tags
        .replace(/<(?!\/?(b|i|u|s|a|code|pre)(\s|>))[^>]+>/g, '')
        // Clean up extra whitespace
        .replace(/\n{3,}/g, '\n\n')
        .trim()
    );
  }

  private static escapeHtml(text: string): string {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  private static escapeMarkdown(text: string): string {
    // Escape special Markdown characters
    return text
      .replace(/\*/g, '\\*')
      .replace(/_/g, '\\_')
      .replace(/\[/g, '\\[')
      .replace(/\]/g, '\\]')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)')
      .replace(/~/g, '\\~')
      .replace(/`/g, '\\`')
      .replace(/>/g, '\\>')
      .replace(/#/g, '\\#')
      .replace(/\+/g, '\\+')
      .replace(/-/g, '\\-')
      .replace(/=/g, '\\=')
      .replace(/\|/g, '\\|')
      .replace(/\{/g, '\\{')
      .replace(/\}/g, '\\}')
      .replace(/\./g, '\\.')
      .replace(/!/g, '\\!');
  }

  private static isTelegramReplyMarkup(attachments: any[]): boolean {
    // Check if attachments look like Telegram reply markup
    return attachments.some(
      (att) =>
        'inline_keyboard' in att ||
        'keyboard' in att ||
        ('text' in att && ('url' in att || 'callback_data' in att)),
    );
  }
}

export default Telegram;
