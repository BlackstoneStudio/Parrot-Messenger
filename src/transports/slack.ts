import Axios from 'axios';
import { Envelope, GenericTransport } from '../types';
import { SlackConfig, SlackAttachment, SlackBlock } from '../types/slack';
import { TransportError } from '../errors';
import { sanitizeHtml } from '../validation';

interface SlackMessage {
  channel?: string;
  text?: string;
  blocks?: SlackBlock[];
  attachments?: SlackAttachment[];
  username?: string;
  icon_emoji?: string;
  icon_url?: string;
  thread_ts?: string;
}

class Slack implements GenericTransport<typeof Axios> {
  transport: typeof Axios;

  private baseURL = 'https://slack.com/api';

  constructor(private settings: SlackConfig) {
    this.transport = Axios;

    // Validate configuration
    if (!settings.auth.token && !settings.auth.webhook) {
      throw new TransportError(
        'Slack transport requires either a bot token or webhook URL',
        'slack',
      );
    }
  }

  async send(message: Envelope): Promise<void> {
    const request = {
      ...this.settings.defaults,
      ...message,
    };

    try {
      if (this.settings.auth.webhook) {
        // Webhook mode - simpler but limited
        await this.sendViaWebhook(request);
      } else if (this.settings.auth.token) {
        // API mode - full features
        await this.sendViaAPI(request);
      }
    } catch (error) {
      throw new TransportError(
        `Slack send failed: ${error instanceof Error ? error.message : String(error)}`,
        'slack',
        { originalError: error },
      );
    }
  }

  private async sendViaWebhook(message: Envelope): Promise<void> {
    const slackMessage = this.formatMessage(message);

    const response = await this.transport.post(this.settings.auth.webhook!, slackMessage, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response || response.data === undefined) {
      throw new Error('Invalid response from Slack webhook');
    }

    if (response.data !== 'ok') {
      throw new Error(`Webhook returned: ${response.data}`);
    }
  }

  private async sendViaAPI(message: Envelope): Promise<void> {
    const slackMessage = this.formatMessage(message);

    const response = await this.transport.post(`${this.baseURL}/chat.postMessage`, slackMessage, {
      headers: {
        Authorization: `Bearer ${this.settings.auth.token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response || !response.data) {
      throw new Error('Invalid response from Slack API');
    }

    if (!response.data.ok) {
      throw new Error(response.data.error || 'Unknown Slack API error');
    }
  }

  private formatMessage(message: Envelope): SlackMessage {
    const slackMessage: SlackMessage = {};

    // Channel/recipient
    if (message.to) {
      // Support various formats: #channel, @user, channel, user, CXXXXXX (channel ID)
      slackMessage.channel =
        message.to.startsWith('#') ||
        message.to.startsWith('@') ||
        /^[CD][A-Z0-9]+$/.test(message.to)
          ? message.to
          : `#${message.to}`;
    } else if (this.settings.defaultChannel) {
      slackMessage.channel = this.settings.defaultChannel;
    }

    // Convert HTML to Slack's mrkdwn format
    if (message.html) {
      slackMessage.text = Slack.htmlToSlackMarkdown(message.html);
    } else if (message.text) {
      slackMessage.text = message.text;
    }

    // Use subject as pretext if provided
    if (message.subject) {
      slackMessage.attachments = [
        {
          pretext: message.subject,
          text: slackMessage.text,
          color: 'good',
        },
      ];
      delete slackMessage.text;
    }

    // Handle attachments if they look like Slack attachments
    if (message.attachments && Slack.isSlackAttachments(message.attachments)) {
      slackMessage.attachments = message.attachments as any;
    }

    // Set sender name if provided (webhook only)
    if (message.from && this.settings.auth.webhook) {
      slackMessage.username = message.from;
    }

    return slackMessage;
  }

  private static htmlToSlackMarkdown(html: string): string {
    // First sanitize the HTML
    const clean = sanitizeHtml(html);

    // Basic HTML to Slack markdown conversion
    return (
      clean
        // Links first (before we remove tags)
        .replace(/<a\s+href="([^"]+)"[^>]*>([^<]+)<\/a>/g, '<$1|$2>')
        // Bold
        .replace(/<b>|<strong>/g, '*')
        .replace(/<\/b>|<\/strong>/g, '*')
        // Italic
        .replace(/<i>|<em>/g, '_')
        .replace(/<\/i>|<\/em>/g, '_')
        // Code
        .replace(/<code>/g, '`')
        .replace(/<\/code>/g, '`')
        // Pre/code blocks
        .replace(/<pre>/g, '```\n')
        .replace(/<\/pre>/g, '\n```')
        // Line breaks
        .replace(/<br\s*\/?>/g, '\n')
        // Paragraphs
        .replace(/<p>/g, '')
        .replace(/<\/p>/g, '\n\n')
        // Remove remaining HTML tags (but not Slack links which use <url|text> format)
        .replace(/<(?!https?:\/\/[^|]+\|[^>]+>)[^>]+>/g, '')
        // Clean up extra whitespace
        .replace(/\n{3,}/g, '\n\n')
        .trim()
    );
  }

  private static isSlackAttachments(attachments: any[]): boolean {
    // Check if attachments look like Slack attachments
    return attachments.some(
      (att) => 'fallback' in att || 'color' in att || 'pretext' in att || 'fields' in att,
    );
  }
}

export default Slack;
