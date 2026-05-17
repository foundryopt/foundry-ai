import { NextResponse } from 'next/server';
import { normalizeGhlSms } from '@/lib/hermes/normalizer';
import { runHermes } from '@/lib/hermes/orchestrator';

/**
 * POST /api/hermes/sms
 *
 * Inbound webhook from GHL when a sub/team member texts the project number.
 * Phase 0: drafts only — no outbound SMS, no Drive writes beyond bot-log.
 *
 * Signature verification (GHL webhook secret) is added once
 * GHL_WEBHOOK_SECRET is provisioned. Until then this route accepts any
 * POST and runs against simulators.
 */

export const dynamic = 'force-dynamic';

function verifyGhlSignature(_req: Request): boolean {
  const secret = process.env.GHL_WEBHOOK_SECRET;
  if (!secret) return true; // simulator mode
  // Real impl: HMAC-SHA256 over body with secret, compare to header.
  // Not implemented until Phase 0 credentials provisioned.
  throw new Error('GHL signature verification not implemented yet');
}

export async function POST(req: Request) {
  if (!verifyGhlSignature(req)) {
    return NextResponse.json({ ok: false, error: 'invalid signature' }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid json' }, { status: 400 });
  }

  let inquiry;
  try {
    inquiry = normalizeGhlSms(payload as Parameters<typeof normalizeGhlSms>[0]);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: detail }, { status: 400 });
  }

  const result = await runHermes(inquiry);
  return NextResponse.json({ ok: true, result });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: 'hermes-sms',
    mode: process.env.GHL_WEBHOOK_SECRET ? 'live' : 'simulator',
  });
}
