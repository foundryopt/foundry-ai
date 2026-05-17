import type { Intent, IntentClassification } from './types';

/**
 * Intent classifier.
 *
 * Default implementation is a keyword + regex heuristic — fast, deterministic,
 * good enough for Phase 0 evaluation and works without an LLM key.
 *
 * When ANTHROPIC_API_KEY is set, the LLM classifier replaces it. Same
 * IntentClassification shape; orchestrator does not change.
 */

interface IntentAdapter {
  classify(body: string): Promise<IntentClassification>;
}

const SHEET_ID = /\b[ASEMP]-?\d{2,4}(?:\.\d+)?\b/i; // e.g. A-101, S2.1, M-200
const DATE_HINT = /\b(when|today|tomorrow|monday|tuesday|wednesday|thursday|friday|next week|start|finish|schedule|eta)\b/i;
const CO_HINT = /\b(co|change order|extra|add(?:itional)? work|approved\??|t&m|time & materials)\b/i;
const CONTRACT_HINT = /\b(scope|contract|included|in scope|out of scope|exclusion|spec(s|ification)?)\b/i;
const DRAW_HINT = /\b(drawing|sheet|detail|plan|elevation|section|rcp)\b/i;

class HeuristicIntent implements IntentAdapter {
  async classify(body: string): Promise<IntentClassification> {
    const matches: Array<[Intent, number]> = [];

    if (CO_HINT.test(body)) matches.push(['co_status', 0.85]);
    if (CONTRACT_HINT.test(body)) matches.push(['contract_scope', 0.8]);
    if (DATE_HINT.test(body)) matches.push(['schedule', 0.8]);
    if (SHEET_ID.test(body) || DRAW_HINT.test(body)) matches.push(['drawings_specs', 0.85]);

    if (matches.length === 0) return { intent: 'unknown', confidence: 0.0 };

    matches.sort((a, b) => b[1] - a[1]);
    const [intent, conf] = matches[0];
    // Multi-hit penalty: ambiguity reduces confidence.
    const adjusted = matches.length > 1 ? Math.max(0.5, conf - 0.15) : conf;
    return { intent, confidence: adjusted };
  }
}

class LlmIntent implements IntentAdapter {
  async classify(_body: string): Promise<IntentClassification> {
    // Real implementation: Anthropic Messages API with a system prompt
    // listing the 4 intents and confidence-band rubric. Returns parsed JSON.
    // Not implemented until Phase 0 credentials provisioned.
    throw new Error('LlmIntent not implemented — unset ANTHROPIC_API_KEY to use heuristic');
  }
}

export function intentAdapter(): IntentAdapter {
  if (process.env.ANTHROPIC_API_KEY) return new LlmIntent();
  return new HeuristicIntent();
}
