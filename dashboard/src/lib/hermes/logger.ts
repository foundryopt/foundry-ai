import type { HermesDraft } from './types';

/**
 * Bot-log writer — every Hermes draft (approved, suppressed, or unsure)
 * is logged to #foundry-bot-log for audit. Approved Q&A also lands in
 * Inquiries_Log Drive Sheet, but that write happens on reaction handler,
 * not here.
 *
 * Phase 0: simulator writes to stdout.
 */

export interface BotLogEntry {
  at: string;
  event: 'draft_posted' | 'identity_block' | 'no_sources' | 'error';
  draft?: HermesDraft;
  detail?: string;
}

export async function logBotEvent(entry: BotLogEntry): Promise<void> {
  // Real implementation: POST to Slack #foundry-bot-log via chat.postMessage
  // when SLACK_BOT_TOKEN + SLACK_BOTLOG_CHANNEL are set.
  console.log(`[hermes.botlog] ${JSON.stringify({ at: entry.at, event: entry.event, detail: entry.detail })}`);
}
