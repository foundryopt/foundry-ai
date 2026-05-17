import type { Intent, RetrievalResult } from './types';

/**
 * Retrievers — one per intent. Each returns an answer string + sources.
 *
 * Simulator implementations return fixture data tied to the SANDBOX project.
 * Real implementations call Drive / Smartsheet APIs when credentials present.
 *
 * Hard rule: every RetrievalResult must include at least one Source.
 * Drafter refuses to produce a draft otherwise.
 */

export interface RetrievalContext {
  project: string;
  body: string;
}

interface Retriever {
  retrieve(ctx: RetrievalContext): Promise<RetrievalResult>;
}

const driveStub = (label: string) => ({
  label,
  url: `https://drive.google.com/__sim__/${encodeURIComponent(label)}`,
});

const smartsheetStub = (label: string) => ({
  label,
  url: `https://app.smartsheet.com/__sim__/${encodeURIComponent(label)}`,
});

class CoStatusRetrieverSim implements Retriever {
  async retrieve({ body }: RetrievalContext): Promise<RetrievalResult> {
    const match = body.match(/CO[-\s]?(\d{1,4})/i);
    const coNum = match ? `CO-${match[1].padStart(3, '0')}` : 'CO-014';
    return {
      answer: `${coNum}: APPROVED — $4,820. Approver: Owner's Rep. Issued 2026-05-12. Tied to RFI-072 (tile substrate).`,
      sources: [driveStub(`SANDBOX_co-log row ${coNum}`)],
    };
  }
}

class ContractScopeRetrieverSim implements Retriever {
  async retrieve(_: RetrievalContext): Promise<RetrievalResult> {
    return {
      answer:
        'Tile install scope includes substrate prep, waterproofing membrane, thinset, grout, and sealing per Spec 09 30 00. Excludes underlying mud bed and floor leveling — those are by GC.',
      sources: [driveStub('SANDBOX_contract_tile_clause_09-30-00')],
    };
  }
}

class ScheduleRetrieverSim implements Retriever {
  async retrieve(_: RetrievalContext): Promise<RetrievalResult> {
    return {
      answer:
        'Tile install: planned start Mon 2026-05-19, finish Fri 2026-05-23. Predecessor: waterproofing inspection (completes Fri 2026-05-16). 2-day float.',
      sources: [smartsheetStub('SANDBOX_master_schedule row 142')],
    };
  }
}

class DrawingsRetrieverSim implements Retriever {
  async retrieve({ body }: RetrievalContext): Promise<RetrievalResult> {
    const m = body.match(/\b([ASEMP]-?\d{2,4}(?:\.\d+)?)\b/i);
    const sheet = (m ? m[1] : 'A-301').toUpperCase().replace(/^([ASEMP])(\d)/, '$1-$2');
    return {
      answer: `${sheet} — current revision: Rev 3, issued 2026-05-09. No open RFIs on this sheet.`,
      sources: [driveStub(`SANDBOX_Drawings/Current/${sheet}_Rev3.pdf`)],
    };
  }
}

class UnknownRetriever implements Retriever {
  async retrieve(_: RetrievalContext): Promise<RetrievalResult> {
    return {
      answer:
        "I'm not sure what you're asking — routing this to the PM. You'll hear back shortly.",
      sources: [{ label: 'no retrieval — routed to RACI owner' }],
    };
  }
}

const SIM_RETRIEVERS: Record<Intent, Retriever> = {
  co_status: new CoStatusRetrieverSim(),
  contract_scope: new ContractScopeRetrieverSim(),
  schedule: new ScheduleRetrieverSim(),
  drawings_specs: new DrawingsRetrieverSim(),
  unknown: new UnknownRetriever(),
};

export function retrieverFor(intent: Intent): Retriever {
  // Real retrievers swap in here when DRIVE_SERVICE_ACCOUNT_JSON /
  // SMARTSHEET_API_TOKEN env vars are configured. Phase 0 = simulator.
  return SIM_RETRIEVERS[intent];
}
