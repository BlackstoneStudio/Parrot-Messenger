import { Defaults } from './index';

/**
 * Telegram Bot API configuration
 * @see https://core.telegram.org/bots/api
 */
export interface TelegramConfig extends Defaults {
  auth: {
    /**
     * Bot token from @BotFather
     * Format: 123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
     */
    botToken: string;
  };
  /**
   * Default chat ID when 'to' is not specified
   * Can be a user ID, group ID, or channel username (@channelname)
   */
  defaultChatId?: string | number;
  /**
   * Parse mode for text formatting
   * @default 'HTML'
   */
  parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2';
  /**
   * Disable link previews in messages
   * @default false
   */
  disableWebPagePreview?: boolean;
  /**
   * Disable notification sound
   * @default false
   */
  disableNotification?: boolean;
}

/**
 * Telegram inline keyboard button
 */
export interface TelegramInlineKeyboardButton {
  text: string;
  url?: string;
  callback_data?: string;
  switch_inline_query?: string;
  switch_inline_query_current_chat?: string;
}

/**
 * Telegram keyboard button
 */
export interface TelegramKeyboardButton {
  text: string;
  request_contact?: boolean;
  request_location?: boolean;
}

/**
 * Telegram inline keyboard markup
 */
export interface TelegramReplyMarkup {
  inline_keyboard?: TelegramInlineKeyboardButton[][];
  keyboard?: TelegramKeyboardButton[][];
  resize_keyboard?: boolean;
  one_time_keyboard?: boolean;
  selective?: boolean;
}

/**
 * Telegram message options
 * @see https://core.telegram.org/bots/api#sendmessage
 */
export interface TelegramMessage {
  chat_id: string | number;
  text: string;
  parse_mode?: 'HTML' | 'Markdown' | 'MarkdownV2';
  disable_web_page_preview?: boolean;
  disable_notification?: boolean;
  reply_to_message_id?: number;
  reply_markup?: TelegramReplyMarkup;
}

/**
 * Telegram API response
 */
export interface TelegramResponse {
  ok: boolean;
  result?: any;
  error_code?: number;
  description?: string;
}
