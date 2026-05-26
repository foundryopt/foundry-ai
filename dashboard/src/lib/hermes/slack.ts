import type { HermesDraft } from './types';

/**
 * Slack adapter — posts threaded drafts to #foundry-ask.
 *
 * Simulator: returns the formatted message string + a fake ts.
 * Real: posts via chat.postMessage when SLACK_BOT_TOKEN + SLACK_HERMES_CHANNEL are set.
 */

export interface SlackPostResult {
  channel: string;
  ts: string;
  text: string;
}

export function formatDraftMessage(draft: HermesDraft): string {
  const { inquiry, identity, intent, answer, sources, suggested_reply, confidence_band } = draft;
  const senderLine = identity.known
    ? `${identity.display_name ?? '(known sender)'} · ${identity.role ?? 'unknown role'}`
    : `Unknown sender (${inquiry.from.phone ?? inquiry.from.email ?? inquiry.from.slack_user_id ?? 'no id'})`;

  const sourceLines = sources.map((s) => `• ${s.url ? `<${s.url}|${s.label}>` : s.label}`).join('\n');

  return [
    `:robot_face: *Hermes draft* — \`${intent.intent}\` — confidence: *${confidence_band}* (${intent.confidence.toFixed(2)})`,
    '',
    `*From:* ${senderLine} · *Project:* ${identity.project ?? '—'}`,
    `> ${inquiry.body}`,
    '',
    `*Answer:*\n${answer}`,
    '',
    `*Sources:*\n${sourceLines}`,
    '',
    `*Suggested reply (GHL → ${inquiry.from.phone ?? '—'}):*\n> ${suggested_reply}`,
    '',
    `_React: :white_check_mark: approve  :pencil2: edit  :grey_question: unsure  :no_entry_sign: suppress_`,
  ].join('\n');
}

interface SlackAdapter {
  postDraft(draft: HermesDraft): Promise<SlackPostResult>;
}

class SimulatorSlack implements SlackAdapter {
  async postDraft(draft: HermesDraft): Promise<SlackPostResult> {
    const text = formatDraftMessage(draft);
    const ts = `${Math.floor(Date.now() / 1000)}.000000`;
    // Visible in server logs during local dev; real Slack post replaces this.
    console.log(`[hermes.slack.sim] would post to #foundry-ask:\n${text}`);
    return { channel: '#foundry-ask (sim)', ts, text };
  }
}

class RealSlack implements SlackAdapter {
  async postDraft(_draft: HermesDraft): Promise<SlackPostResult> {
    // Real implementation: POST https://slack.com/api/chat.postMessage
    // with Bearer ${SLACK_BOT_TOKEN}, channel=${SLACK_HERMES_CHANNEL}.
    // Not implemented until Phase 0 credentials provisioned.
    throw new Error('RealSlack not implemented — unset SLACK_BOT_TOKEN to use simulator');
  }
}

export function slackAdapter(): SlackAdapter {
  if (process.env.SLACK_BOT_TOKEN && process.env.SLACK_HERMES_CHANNEL) return new RealSlack();
  return new SimulatorSlack();
}
