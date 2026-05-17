/**
 * Hermes — shared types.
 *
 * NormalizedInquiry is the contract between intake adapters
 * (SMS/email/Slack) and the orchestrator. Every inbound becomes one.
 */

export type IntakeSource = 'sms' | 'email' | 'slack';

export type Intent =
  | 'co_status'
  | 'contract_scope'
  | 'schedule'
  | 'drawings_specs'
  | 'unknown';

export interface NormalizedInquiry {
  source: IntakeSource;
  body: string;
  from: {
    phone?: string;
    email?: string;
    slack_user_id?: string;
  };
  received_at: string; // ISO
  thread_key: string;  // groups follow-ups within 30 min
  raw: unknown;        // original payload, kept for audit
}

export interface IdentityResult {
  known: boolean;
  ghl_contact_id?: string;
  display_name?: string;
  role?: 'sub' | 'pm' | 'super' | 'owner_rep' | 'principal' | 'unknown';
  project?: string;
  reason?: 'unknown_sender' | 'wrong_project' | 'blocked' | 'ok';
}

export interface Source {
  label: string;
  url?: string;
}

export interface IntentClassification {
  intent: Intent;
  confidence: number; // 0..1
}

export interface RetrievalResult {
  answer: string;
  sources: Source[];
}

export interface HermesDraft {
  inquiry: NormalizedInquiry;
  identity: IdentityResult;
  intent: IntentClassification;
  answer: string;
  sources: Source[];
  suggested_reply: string;
  confidence_band: 'high' | 'med' | 'low';
}
