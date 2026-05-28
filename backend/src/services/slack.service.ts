import { config } from '../config';

interface SlackMessage {
  channel: string;
  text: string;
  blocks?: SlackBlock[];
  thread_ts?: string;
}

interface SlackBlock {
  type: string;
  text?: { type: string; text: string; emoji?: boolean };
  elements?: Array<{ type: string; text?: string; emoji?: boolean }>;
  fields?: Array<{ type: string; text: string }>;
}

interface SlackResponse {
  ok: boolean;
  channel?: string;
  ts?: string;
  error?: string;
}

export class SlackService {
  private static webhookUrl = config.slack?.webhookUrl;
  private static botToken = config.slack?.botToken;

  static async postMessage(message: SlackMessage): Promise<SlackResponse> {
    if (!this.botToken) {
      console.warn('[SlackService] SLACK_BOT_TOKEN not configured, skipping message');
      return { ok: false, error: 'SLACK_BOT_TOKEN not configured' };
    }

    try {
      const response = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.botToken}`,
        },
        body: JSON.stringify(message),
      });

      const data = (await response.json()) as SlackResponse;

      if (!data.ok) {
        console.error('[SlackService] Failed to post message:', data.error);
      }

      return data;
    } catch (error) {
      console.error('[SlackService] Error posting message:', error);
      return { ok: false, error: String(error) };
    }
  }

  static async postWebhook(text: string, blocks?: SlackBlock[]): Promise<boolean> {
    if (!this.webhookUrl) {
      console.warn('[SlackService] SLACK_WEBHOOK_URL not configured, skipping message');
      return false;
    }

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, blocks }),
      });

      return response.ok;
    } catch (error) {
      console.error('[SlackService] Error posting webhook:', error);
      return false;
    }
  }

  static formatSmsNotification(sms: {
    from: string;
    to: string;
    body: string;
    contactName?: string;
    contactId?: string;
    direction: 'inbound' | 'outbound';
    timestamp: string;
  }): SlackMessage {
    const isInbound = sms.direction === 'inbound';
    const icon = isInbound ? ':inbox_tray:' : ':outbox_tray:';
    const directionLabel = isInbound ? 'Inbound SMS' : 'Outbound SMS';
    const contactDisplay = sms.contactName || sms.from;

    return {
      channel: config.slack?.smsChannel || '#ghl-sms',
      text: `${directionLabel} ${isInbound ? 'from' : 'to'} ${contactDisplay}: ${sms.body}`,
      blocks: [
        {
          type: 'header',
          text: { type: 'plain_text', text: `${icon} ${directionLabel}`, emoji: true },
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*${isInbound ? 'From' : 'To'}:*\n${contactDisplay}` },
            { type: 'mrkdwn', text: `*Phone:*\n${sms.from}` },
          ],
        },
        {
          type: 'section',
          text: { type: 'mrkdwn', text: `*Message:*\n${sms.body}` },
        },
        {
          type: 'context',
          elements: [
            { type: 'mrkdwn', text: `📅 ${new Date(sms.timestamp).toLocaleString()}` },
            ...(sms.contactId
              ? [{ type: 'mrkdwn', text: `🔗 Contact ID: ${sms.contactId}` }]
              : []),
          ],
        },
      ],
    };
  }
}
