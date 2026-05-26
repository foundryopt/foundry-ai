import type {
  HermesDraft,
  IdentityResult,
  IntentClassification,
  NormalizedInquiry,
  RetrievalResult,
} from './types';

const MAX_SMS_CHARS = 320;

function bandFor(conf: number): HermesDraft['confidence_band'] {
  if (conf >= 0.85) return 'high';
  if (conf >= 0.7) return 'med';
  return 'low';
}

function truncate(s: string, n: number): string {
  if (s.length <= n) return s;
  return s.slice(0, n - 1).trimEnd() + '…';
}

function composeSuggestedReply(answer: string, identity: IdentityResult): string {
  const name = identity.display_name?.split(' ')[0] ?? 'there';
  return truncate(`Hi ${name} — ${answer}`, MAX_SMS_CHARS);
}

export function composeDraft(args: {
  inquiry: NormalizedInquiry;
  identity: IdentityResult;
  intent: IntentClassification;
  retrieval: RetrievalResult;
}): HermesDraft {
  const { inquiry, identity, intent, retrieval } = args;

  if (retrieval.sources.length === 0) {
    throw new Error('composeDraft: retrieval returned no sources — refusing to draft');
  }

  return {
    inquiry,
    identity,
    intent,
    answer: retrieval.answer,
    sources: retrieval.sources,
    suggested_reply: composeSuggestedReply(retrieval.answer, identity),
    confidence_band: bandFor(intent.confidence),
  };
}
