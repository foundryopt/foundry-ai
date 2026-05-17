import type { IdentityResult, NormalizedInquiry } from './types';

/**
 * Identity gate — phone/email/slack id → known contact.
 *
 * Simulator returns a small fixture set. Real implementation calls
 * GHL Contacts API when GHL_API_KEY is present.
 */

interface IdentityAdapter {
  resolve(inquiry: NormalizedInquiry): Promise<IdentityResult>;
}

const SIM_CONTACTS: Record<string, IdentityResult> = {
  '+15551110001': {
    known: true,
    ghl_contact_id: 'sim-pm-001',
    display_name: 'Maya Chen (PM)',
    role: 'pm',
    project: 'SANDBOX',
    reason: 'ok',
  },
  '+15551110002': {
    known: true,
    ghl_contact_id: 'sim-sub-tile-001',
    display_name: 'Rico Alvarez — Tile',
    role: 'sub',
    project: 'SANDBOX',
    reason: 'ok',
  },
};

class SimulatorIdentity implements IdentityAdapter {
  async resolve(inquiry: NormalizedInquiry): Promise<IdentityResult> {
    const phone = inquiry.from.phone;
    if (phone && SIM_CONTACTS[phone]) {
      return SIM_CONTACTS[phone];
    }
    return { known: false, role: 'unknown', reason: 'unknown_sender' };
  }
}

class GhlIdentity implements IdentityAdapter {
  async resolve(_inquiry: NormalizedInquiry): Promise<IdentityResult> {
    // Real implementation: GET /contacts/lookup?phone=...
    // Returns identity + project tag + entitlement set.
    // Not implemented until Phase 0 credentials provisioned.
    throw new Error('GhlIdentity not implemented — set GHL_API_KEY=sim to use simulator');
  }
}

export function identityAdapter(): IdentityAdapter {
  const key = process.env.GHL_API_KEY;
  if (!key || key === 'sim') return new SimulatorIdentity();
  return new GhlIdentity();
}
