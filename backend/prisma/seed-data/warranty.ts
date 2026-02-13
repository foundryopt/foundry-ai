/* ══════════════════════════════════════════════════
   Seed Data — Warranty Items
   Ported from dashboard mock-warranty.ts
   sandbox-001 -> belmont, greenfield-002 -> wieland
   ══════════════════════════════════════════════════ */

export const SEED_WARRANTIES = [
  // ─────────────────────────────────────────────
  //  Belmont — Warranty Items
  // ─────────────────────────────────────────────
  {
    id: 'WC-001',
    projectId: 'belmont',
    unit: 'Unit 204',
    issueType: 'HVAC noise',
    description:
      'Persistent rattling noise from supply diffuser in master bedroom. Tenant reports intermittent vibration at night, likely loose duct connection or fan-coil imbalance.',
    reportedDate: '2026-01-20',
    severity: 'urgent',
    status: 'in-progress',
    assignedTo: 'Crown Mechanical',
    trade: 'Mechanical',
    costCode: '23-00',
    warrantyEnd: '2027-01-15',
    linkedTaskIds: [],
  },
  {
    id: 'WC-002',
    projectId: 'belmont',
    unit: 'Unit 112',
    issueType: 'Window seal leak',
    description:
      'Water infiltration at lower left corner of living room window during heavy rain. Sealant joint appears degraded or improperly applied at factory.',
    reportedDate: '2026-01-28',
    severity: 'standard',
    status: 'open',
    assignedTo: 'TBD \u2014 Glazing',
    trade: 'Glazing',
    costCode: '08-00',
    warrantyEnd: '2027-02-01',
    linkedTaskIds: [],
  },
  {
    id: 'WC-003',
    projectId: 'belmont',
    unit: 'Unit 308',
    issueType: 'Water stain ceiling',
    description:
      'Brown water stain appearing on bedroom ceiling directly below Unit 408 bathroom. No active drip observed yet; likely slow waste-line seep or condensation.',
    reportedDate: '2026-02-02',
    severity: 'standard',
    status: 'open',
    assignedTo: 'TBD \u2014 Plumbing',
    trade: 'Plumbing',
    costCode: '22-00',
    warrantyEnd: '2027-01-15',
    linkedTaskIds: [],
  },
  {
    id: 'WC-004',
    projectId: 'belmont',
    unit: 'Common Area L1',
    issueType: 'Elevator door alignment',
    description:
      'Elevator car door on Level 1 intermittently fails to close flush, triggering door-open alarm. Adjusted once; issue recurred after two weeks. Monitoring confirms alignment drift.',
    reportedDate: '2026-01-10',
    severity: 'monitor',
    status: 'resolved',
    assignedTo: 'Pacific Elevator',
    trade: 'Elevator',
    costCode: '14-00',
    warrantyEnd: '2027-06-01',
    resolution:
      'Door guide shoes replaced and car-door operator recalibrated. Two-week monitoring confirmed stable operation.',
    resolvedDate: '2026-01-30',
    linkedTaskIds: [],
  },
  {
    id: 'WC-005',
    projectId: 'belmont',
    unit: 'Unit 401',
    issueType: 'Flooring bubbling',
    description:
      'LVP flooring in kitchen showing bubbling and edge lift along two seams. Moisture testing recommended to rule out slab vapor emission before re-install.',
    reportedDate: '2026-02-05',
    severity: 'standard',
    status: 'in-progress',
    assignedTo: 'Heritage Flooring',
    trade: 'Flooring',
    costCode: '09-65',
    warrantyEnd: '2027-03-01',
    linkedTaskIds: [],
  },
  {
    id: 'WC-006',
    projectId: 'belmont',
    unit: 'Roof Terrace',
    issueType: 'Waterproofing seepage',
    description:
      'Active seepage observed at roof terrace drain tie-in during sustained rain events. Water tracking along parapet base into Level 4 corridor ceiling. Membrane lap joint suspected.',
    reportedDate: '2026-02-07',
    severity: 'urgent',
    status: 'open',
    assignedTo: 'Waterproofing Sub',
    trade: 'Waterproofing',
    costCode: '07-00',
    warrantyEnd: '2028-01-15',
    linkedTaskIds: [],
  },

  // ─────────────────────────────────────────────
  //  Wieland — Warranty Items
  // ─────────────────────────────────────────────
  {
    id: 'GF-WC-001',
    projectId: 'wieland',
    unit: 'Parking NW',
    issueType: 'Settlement crack',
    description:
      'Longitudinal crack (approx. 12 ft) along NW parking lot slab section. Crack width ~3 mm with minor differential settlement. Likely caused by inadequate compaction of underlying fill.',
    reportedDate: '2026-02-03',
    severity: 'standard',
    status: 'open',
    assignedTo: 'Valley Grading',
    trade: 'Earthwork',
    costCode: '31-00',
    warrantyEnd: '2027-08-01',
    linkedTaskIds: [],
  },
  {
    id: 'GF-WC-002',
    projectId: 'wieland',
    unit: 'Entry Canopy',
    issueType: 'Steel connection rust',
    description:
      'Surface rust forming at base plate connection of entry canopy steel column. Galvanizing appears compromised at weld location. Monitoring for progression before remediation scope is defined.',
    reportedDate: '2026-02-06',
    severity: 'monitor',
    status: 'open',
    assignedTo: 'Ironworks Fabrication',
    trade: 'Structural Steel',
    costCode: '05-00',
    warrantyEnd: '2028-02-01',
    linkedTaskIds: [],
  },

  // ─────────────────────────────────────────────
  //  LaSalle — Warranty Items
  // ─────────────────────────────────────────────
  {
    id: 'LS-WC-001',
    projectId: 'lasalle',
    unit: 'Suite 200',
    issueType: 'Paint peeling',
    description:
      'Paint peeling along north wall of Suite 200 conference room. Appears to be adhesion failure over skim coat. Likely insufficient primer coat or high humidity during application.',
    reportedDate: '2026-02-10',
    severity: 'standard',
    status: 'open',
    assignedTo: 'TBD \u2014 Painter',
    trade: 'Painting',
    costCode: '09-91',
    warrantyEnd: '2027-06-01',
    linkedTaskIds: [],
  },
];
