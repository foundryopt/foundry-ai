import { composeDraft } from './drafter';
import { identityAdapter } from './identity';
import { intentAdapter } from './intent';
import { logBotEvent } from './logger';
import { retrieverFor } from './retrievers';
import { slackAdapter, type SlackPostResult } from './slack';
import type { HermesDraft, NormalizedInquiry } from './types';

/**
 * Hermes pipeline — single entry point.
 *
 *   Inquiry → Identity gate → Intent classify → Retrieve → Draft → Slack post → Bot-log
 *
 * Phase 0: every path ends with a Slack post (sim or real). NO outbound SMS.
 * Outbound is added behind a reaction handler in Phase 1.
 */

export type HermesResult =
  | { kind: 'drafted'; draft: HermesDraft; slack: SlackPostResult }
  | { kind: 'identity_block'; reason: string; slack: SlackPostResult }
  | { kind: 'error'; detail: string };

export async function runHermes(inquiry: NormalizedInquiry): Promise<HermesResult> {
  const now = () => new Date().toISOString();
  const slack = slackAdapter();

  try {
    const identity = await identityAdapter().resolve(inquiry);

    if (!identity.known) {
      await logBotEvent({
        at: now(),
        event: 'identity_block',
        detail: `unknown sender ${inquiry.from.phone ?? inquiry.from.email ?? inquiry.from.slack_user_id}`,
      });
      // Phase 0: still post a holding draft to #foundry-ask so PM can route.
      const holdingDraft: HermesDraft = {
        inquiry,
        identity,
        intent: { intent: 'unknown', confidence: 0 },
        answer: 'Unknown sender — no retrieval performed. Route to PM per RACI.',
        sources: [{ label: 'identity gate: unknown sender' }],
        suggested_reply: 'Thanks for reaching out — a PM will respond shortly.',
        confidence_band: 'low',
      };
      const post = await slack.postDraft(holdingDraft);
      return { kind: 'identity_block', reason: 'unknown_sender', slack: post };
    }

    const intent = await intentAdapter().classify(inquiry.body);
    const retrieval = await retrieverFor(intent.intent).retrieve({
      project: identity.project ?? 'SANDBOX',
      body: inquiry.body,
    });

    if (retrieval.sources.length === 0) {
      await logBotEvent({ at: now(), event: 'no_sources', detail: `intent=${intent.intent}` });
      return { kind: 'error', detail: 'retrieval returned no sources' };
    }

    const draft = composeDraft({ inquiry, identity, intent, retrieval });
    const post = await slack.postDraft(draft);
    await logBotEvent({ at: now(), event: 'draft_posted', draft });

    return { kind: 'drafted', draft, slack: post };
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    await logBotEvent({ at: now(), event: 'error', detail });
    return { kind: 'error', detail };
  }
}
