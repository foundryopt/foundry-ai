import type { NormalizedInquiry } from './types';

/**
 * Normalizers — convert raw webhook payloads into a NormalizedInquiry.
 *
 * GHL inbound SMS webhook payload shape is documented at
 * https://highlevel.stoplight.io/docs/integrations/. Real shape is
 * verified during Phase 0; this normalizer accepts a tolerant subset.
 */

interface GhlInboundSms {
  type?: string;
  contactId?: string;
  phone?: string;
  message?: string;
  body?: string;
  dateAdded?: string;
}

function threadKey(phone: string, receivedAt: string): string {
  // Bucket follow-ups within the same 30-min window to one thread.
  const minutes = Math.floor(new Date(receivedAt).getTime() / (30 * 60 * 1000));
  return `sms:${phone}:${minutes}`;
}

export function normalizeGhlSms(payload: GhlInboundSms): NormalizedInquiry {
  const phone = payload.phone ?? '';
  const body = (payload.message ?? payload.body ?? '').trim();
  const received_at = payload.dateAdded ?? new Date().toISOString();

  if (!phone) {
    throw new Error('normalizeGhlSms: missing phone');
  }
  if (!body) {
    throw new Error('normalizeGhlSms: empty body');
  }

  return {
    source: 'sms',
    body,
    from: { phone },
    received_at,
    thread_key: threadKey(phone, received_at),
    raw: payload,
  };
}
