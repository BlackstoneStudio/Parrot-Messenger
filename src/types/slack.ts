import { Defaults } from './index';

export interface SlackConfig extends Defaults {
  auth: {
    token?: string; // Bot token (xoxb-...)
    webhook?: string; // Webhook URL for simpler integration
  };
  defaultChannel?: string; // Default channel if not specified in message
}

export interface SlackAttachment {
  fallback?: string;
  color?: string;
  pretext?: string;
  author_name?: string;
  author_link?: string;
  author_icon?: string;
  title?: string;
  title_link?: string;
  text?: string;
  fields?: Array<{
    title: string;
    value: string;
    short?: boolean;
  }>;
  image_url?: string;
  thumb_url?: string;
  footer?: string;
  footer_icon?: string;
  ts?: number;
}

export interface SlackBlock {
  type: string;
  text?: {
    type: 'plain_text' | 'mrkdwn';
    text: string;
  };
  [key: string]: any;
}
