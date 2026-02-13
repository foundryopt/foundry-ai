/* ══════════════════════════════════════════════════
   Seed Data — Timesheet Cost Codes
   Ported from dashboard mock-timesheet.ts
   sandbox-001 -> belmont, greenfield-002 -> wieland
   ══════════════════════════════════════════════════ */

export const SEED_TIMESHEET_COST_CODES = [
  // ─────────────────────────────────────────────
  //  Belmont — Mixed-Use Development (12 codes)
  // ─────────────────────────────────────────────

  // GEN-01: Project Management Staff
  {
    projectId: 'belmont',
    costCode: 'GEN-01',
    description: 'Project management staff',
    jobName: 'General Conditions',
    totalBudgeted: 4200,
    totalSpent: 3590,
    totalRemaining: 610,
    totalCO: 0,
    totalPCO: 0,
    percentComplete: 82,
    percentUsed: 85,
    overspend: false,
    coRecommendation: null,
    roleBreakdown: [
      { role: 'PM', budgeted: 2400, spent: 2100, remaining: 300, coHours: 0, pcoHours: 0 },
      { role: 'Super', budgeted: 1200, spent: 980, remaining: 220, coHours: 0, pcoHours: 0 },
      { role: 'Ops', budgeted: 400, spent: 320, remaining: 80, coHours: 0, pcoHours: 0 },
      { role: 'Procurement', budgeted: 200, spent: 190, remaining: 10, coHours: 0, pcoHours: 0 },
    ],
  },

  // 03-10: Foundations
  {
    projectId: 'belmont',
    costCode: '03-10',
    description: 'Foundations — footings & grade beams',
    jobName: 'Concrete',
    totalBudgeted: 680,
    totalSpent: 682,
    totalRemaining: 0,
    totalCO: 0,
    totalPCO: 0,
    percentComplete: 100,
    percentUsed: 100,
    overspend: true,
    coRecommendation: {
      recipient: 'Internal',
      reason: 'Minor 2hr overage on PM coordination due to rebar RFI resolution — absorb internally.',
      estimatedHours: 2,
    },
    roleBreakdown: [
      { role: 'Super', budgeted: 240, spent: 240, remaining: 0, coHours: 0, pcoHours: 0 },
      { role: 'General Labor', budgeted: 400, spent: 400, remaining: 0, coHours: 0, pcoHours: 0 },
      { role: 'PM', budgeted: 40, spent: 42, remaining: 0, coHours: 0, pcoHours: 0 },
    ],
  },

  // 03-30: Elevated Slabs
  {
    projectId: 'belmont',
    costCode: '03-30',
    description: 'Elevated slabs — post-tension',
    jobName: 'Concrete',
    totalBudgeted: 566,
    totalSpent: 340,
    totalRemaining: 226,
    totalCO: 0,
    totalPCO: 0,
    percentComplete: 55,
    percentUsed: 60,
    overspend: false,
    coRecommendation: null,
    roleBreakdown: [
      { role: 'Super', budgeted: 200, spent: 130, remaining: 70, coHours: 0, pcoHours: 0 },
      { role: 'General Labor', budgeted: 320, spent: 180, remaining: 140, coHours: 0, pcoHours: 0 },
      { role: 'PM', budgeted: 30, spent: 18, remaining: 12, coHours: 0, pcoHours: 0 },
      { role: 'Designer', budgeted: 16, spent: 12, remaining: 4, coHours: 0, pcoHours: 0 },
    ],
  },

  // 23-05: HVAC Ductwork
  {
    projectId: 'belmont',
    costCode: '23-05',
    description: 'HVAC ductwork — supply & return',
    jobName: 'HVAC',
    totalBudgeted: 880,
    totalSpent: 846,
    totalRemaining: 50,
    totalCO: 112,
    totalPCO: 0,
    percentComplete: 88,
    percentUsed: 96,
    overspend: true,
    coRecommendation: {
      recipient: 'Owner',
      reason: 'Exhaust reroute at L3 added 112 CO hours — owner-directed scope change. PM absorbed 12hr overage coordinating.',
      estimatedHours: 16,
    },
    roleBreakdown: [
      { role: 'Super', budgeted: 320, spent: 310, remaining: 10, coHours: 40, pcoHours: 0 },
      { role: 'General Labor', budgeted: 480, spent: 440, remaining: 40, coHours: 60, pcoHours: 0 },
      { role: 'PM', budgeted: 60, spent: 72, remaining: 0, coHours: 12, pcoHours: 0 },
      { role: 'Designer', budgeted: 20, spent: 24, remaining: 0, coHours: 0, pcoHours: 0 },
    ],
  },

  // 23-09: Controls & TAB
  {
    projectId: 'belmont',
    costCode: '23-09',
    description: 'Controls & TAB',
    jobName: 'HVAC',
    totalBudgeted: 400,
    totalSpent: 128,
    totalRemaining: 272,
    totalCO: 0,
    totalPCO: 0,
    percentComplete: 25,
    percentUsed: 32,
    overspend: false,
    coRecommendation: null,
    roleBreakdown: [
      { role: 'PM', budgeted: 80, spent: 28, remaining: 52, coHours: 0, pcoHours: 0 },
      { role: 'Super', budgeted: 120, spent: 40, remaining: 80, coHours: 0, pcoHours: 0 },
      { role: 'General Labor', budgeted: 200, spent: 60, remaining: 140, coHours: 0, pcoHours: 0 },
    ],
  },

  // 26-05: Electrical Rough-in
  {
    projectId: 'belmont',
    costCode: '26-05',
    description: 'Electrical rough-in — conduit & wire',
    jobName: 'Electrical',
    totalBudgeted: 750,
    totalSpent: 696,
    totalRemaining: 60,
    totalCO: 88,
    totalPCO: 0,
    percentComplete: 85,
    percentUsed: 93,
    overspend: true,
    coRecommendation: {
      recipient: 'Sub',
      reason: 'Electrical sub underestimated conduit runs for added panels — 88 CO hours on sub. PM coordination 6hr overage pending PCO.',
      estimatedHours: 8,
    },
    roleBreakdown: [
      { role: 'Super', budgeted: 280, spent: 260, remaining: 20, coHours: 30, pcoHours: 0 },
      { role: 'General Labor', budgeted: 420, spent: 380, remaining: 40, coHours: 50, pcoHours: 0 },
      { role: 'PM', budgeted: 50, spent: 56, remaining: 0, coHours: 8, pcoHours: 0 },
    ],
  },

  // 09-21: Drywall & Framing
  {
    projectId: 'belmont',
    costCode: '09-21',
    description: 'Drywall & framing — units',
    jobName: 'Finishes',
    totalBudgeted: 574,
    totalSpent: 495,
    totalRemaining: 79,
    totalCO: 0,
    totalPCO: 0,
    percentComplete: 82,
    percentUsed: 86,
    overspend: false,
    coRecommendation: null,
    roleBreakdown: [
      { role: 'Super', budgeted: 200, spent: 175, remaining: 25, coHours: 0, pcoHours: 0 },
      { role: 'General Labor', budgeted: 350, spent: 300, remaining: 50, coHours: 0, pcoHours: 0 },
      { role: 'PM', budgeted: 24, spent: 20, remaining: 4, coHours: 0, pcoHours: 0 },
    ],
  },

  // 09-65: Resilient Flooring
  {
    projectId: 'belmont',
    costCode: '09-65',
    description: 'Resilient flooring — LVP common areas',
    jobName: 'Finishes',
    totalBudgeted: 256,
    totalSpent: 162,
    totalRemaining: 94,
    totalCO: 0,
    totalPCO: 60,
    percentComplete: 45,
    percentUsed: 63,
    overspend: false,
    coRecommendation: null,
    roleBreakdown: [
      { role: 'Super', budgeted: 80, spent: 52, remaining: 28, coHours: 0, pcoHours: 20 },
      { role: 'General Labor', budgeted: 160, spent: 100, remaining: 60, coHours: 0, pcoHours: 40 },
      { role: 'PM', budgeted: 16, spent: 10, remaining: 6, coHours: 0, pcoHours: 0 },
    ],
  },

  // 14-21: Passenger Elevators
  {
    projectId: 'belmont',
    costCode: '14-21',
    description: 'Passenger elevators (2) — supply & install',
    jobName: 'Elevators',
    totalBudgeted: 240,
    totalSpent: 192,
    totalRemaining: 48,
    totalCO: 0,
    totalPCO: 0,
    percentComplete: 70,
    percentUsed: 80,
    overspend: false,
    coRecommendation: null,
    roleBreakdown: [
      { role: 'PM', budgeted: 40, spent: 32, remaining: 8, coHours: 0, pcoHours: 0 },
      { role: 'Super', budgeted: 80, spent: 64, remaining: 16, coHours: 0, pcoHours: 0 },
      { role: 'General Labor', budgeted: 120, spent: 96, remaining: 24, coHours: 0, pcoHours: 0 },
    ],
  },

  // 09-31: Porcelain Tile
  {
    projectId: 'belmont',
    costCode: '09-31',
    description: 'Porcelain tile — bathrooms',
    jobName: 'Tile & Stone',
    totalBudgeted: 260,
    totalSpent: 49,
    totalRemaining: 211,
    totalCO: 0,
    totalPCO: 0,
    percentComplete: 12,
    percentUsed: 19,
    overspend: false,
    coRecommendation: null,
    roleBreakdown: [
      { role: 'Super', budgeted: 60, spent: 10, remaining: 50, coHours: 0, pcoHours: 0 },
      { role: 'General Labor', budgeted: 180, spent: 30, remaining: 150, coHours: 0, pcoHours: 0 },
      { role: 'PM', budgeted: 12, spent: 3, remaining: 9, coHours: 0, pcoHours: 0 },
      { role: 'Designer', budgeted: 8, spent: 6, remaining: 2, coHours: 0, pcoHours: 0 },
    ],
  },

  // 07-11: Waterproofing
  {
    projectId: 'belmont',
    costCode: '07-11',
    description: 'Below-grade waterproofing membrane',
    jobName: 'Waterproofing',
    totalBudgeted: 128,
    totalSpent: 96,
    totalRemaining: 32,
    totalCO: 0,
    totalPCO: 0,
    percentComplete: 90,
    percentUsed: 75,
    overspend: false,
    coRecommendation: null,
    roleBreakdown: [
      { role: 'Super', budgeted: 40, spent: 32, remaining: 8, coHours: 0, pcoHours: 0 },
      { role: 'General Labor', budgeted: 80, spent: 60, remaining: 20, coHours: 0, pcoHours: 0 },
      { role: 'PM', budgeted: 8, spent: 4, remaining: 4, coHours: 0, pcoHours: 0 },
    ],
  },

  // 32-12: Hardscape
  {
    projectId: 'belmont',
    costCode: '32-12',
    description: 'Hardscape — pavers & curbing',
    jobName: 'Exterior / Landscape',
    totalBudgeted: 216,
    totalSpent: 108,
    totalRemaining: 108,
    totalCO: 0,
    totalPCO: 120,
    percentComplete: 35,
    percentUsed: 50,
    overspend: false,
    coRecommendation: null,
    roleBreakdown: [
      { role: 'PM', budgeted: 16, spent: 8, remaining: 8, coHours: 0, pcoHours: 20 },
      { role: 'Super', budgeted: 40, spent: 30, remaining: 10, coHours: 0, pcoHours: 40 },
      { role: 'General Labor', budgeted: 160, spent: 70, remaining: 90, coHours: 0, pcoHours: 60 },
    ],
  },

  // ─────────────────────────────────────────────
  //  Wieland — Retail Center (6 codes)
  // ─────────────────────────────────────────────

  // GEN-01: Site Superintendent
  {
    projectId: 'wieland',
    costCode: 'GEN-01',
    description: 'Site superintendent',
    jobName: 'General Conditions',
    totalBudgeted: 2800,
    totalSpent: 640,
    totalRemaining: 2160,
    totalCO: 0,
    totalPCO: 0,
    percentComplete: 20,
    percentUsed: 23,
    overspend: false,
    coRecommendation: null,
    roleBreakdown: [
      { role: 'Super', budgeted: 1400, spent: 280, remaining: 1120, coHours: 0, pcoHours: 0 },
      { role: 'PM', budgeted: 800, spent: 200, remaining: 600, coHours: 0, pcoHours: 0 },
      { role: 'Procurement', budgeted: 400, spent: 120, remaining: 280, coHours: 0, pcoHours: 0 },
      { role: 'Ops', budgeted: 200, spent: 40, remaining: 160, coHours: 0, pcoHours: 0 },
    ],
  },

  // 31-23: Mass Grading
  {
    projectId: 'wieland',
    costCode: '31-23',
    description: 'Mass grading & export',
    jobName: 'Earthwork & Grading',
    totalBudgeted: 350,
    totalSpent: 285,
    totalRemaining: 70,
    totalCO: 60,
    totalPCO: 0,
    percentComplete: 75,
    percentUsed: 81,
    overspend: true,
    coRecommendation: {
      recipient: 'Owner',
      reason: 'Unsuitable fill in NW quadrant required 60 additional hours for export/import. Geotech-driven scope change — owner responsibility.',
      estimatedHours: 60,
    },
    roleBreakdown: [
      { role: 'Super', budgeted: 120, spent: 90, remaining: 30, coHours: 20, pcoHours: 0 },
      { role: 'General Labor', budgeted: 200, spent: 160, remaining: 40, coHours: 40, pcoHours: 0 },
      { role: 'PM', budgeted: 30, spent: 35, remaining: 0, coHours: 0, pcoHours: 0 },
    ],
  },

  // 31-25: Structural Fill
  {
    projectId: 'wieland',
    costCode: '31-25',
    description: 'Structural fill import & compact',
    jobName: 'Earthwork & Grading',
    totalBudgeted: 170,
    totalSpent: 85,
    totalRemaining: 85,
    totalCO: 0,
    totalPCO: 0,
    percentComplete: 40,
    percentUsed: 50,
    overspend: false,
    coRecommendation: null,
    roleBreakdown: [
      { role: 'Super', budgeted: 60, spent: 30, remaining: 30, coHours: 0, pcoHours: 0 },
      { role: 'General Labor', budgeted: 100, spent: 50, remaining: 50, coHours: 0, pcoHours: 0 },
      { role: 'PM', budgeted: 10, spent: 5, remaining: 5, coHours: 0, pcoHours: 0 },
    ],
  },

  // 03-10: Spread Footings
  {
    projectId: 'wieland',
    costCode: '03-10',
    description: 'Spread footings & piers',
    jobName: 'Concrete (Foundations)',
    totalBudgeted: 156,
    totalSpent: 0,
    totalRemaining: 156,
    totalCO: 0,
    totalPCO: 0,
    percentComplete: 0,
    percentUsed: 0,
    overspend: false,
    coRecommendation: null,
    roleBreakdown: [
      { role: 'Super', budgeted: 40, spent: 0, remaining: 40, coHours: 0, pcoHours: 0 },
      { role: 'General Labor', budgeted: 100, spent: 0, remaining: 100, coHours: 0, pcoHours: 0 },
      { role: 'PM', budgeted: 16, spent: 0, remaining: 16, coHours: 0, pcoHours: 0 },
    ],
  },

  // 05-12: Structural Steel
  {
    projectId: 'wieland',
    costCode: '05-12',
    description: 'Structural steel — fabrication & erection',
    jobName: 'Structural Steel',
    totalBudgeted: 64,
    totalSpent: 10,
    totalRemaining: 54,
    totalCO: 0,
    totalPCO: 0,
    percentComplete: 5,
    percentUsed: 16,
    overspend: false,
    coRecommendation: null,
    roleBreakdown: [
      { role: 'PM', budgeted: 40, spent: 0, remaining: 40, coHours: 0, pcoHours: 0 },
      { role: 'Procurement', budgeted: 24, spent: 10, remaining: 14, coHours: 0, pcoHours: 0 },
    ],
  },

  // 08-44: Storefront
  {
    projectId: 'wieland',
    costCode: '08-44',
    description: 'Storefront curtain wall system',
    jobName: 'Storefront & Glazing',
    totalBudgeted: 36,
    totalSpent: 0,
    totalRemaining: 36,
    totalCO: 0,
    totalPCO: 0,
    percentComplete: 0,
    percentUsed: 0,
    overspend: false,
    coRecommendation: null,
    roleBreakdown: [
      { role: 'PM', budgeted: 20, spent: 0, remaining: 20, coHours: 0, pcoHours: 0 },
      { role: 'Designer', budgeted: 16, spent: 0, remaining: 16, coHours: 0, pcoHours: 0 },
    ],
  },

  // ─────────────────────────────────────────────
  //  LaSalle — Office Renovation (3 codes)
  // ─────────────────────────────────────────────

  // GEN-01: Project Management
  {
    projectId: 'lasalle',
    costCode: 'GEN-01',
    description: 'Project management',
    jobName: 'General Conditions',
    totalBudgeted: 1200,
    totalSpent: 480,
    totalRemaining: 720,
    totalCO: 0,
    totalPCO: 0,
    percentComplete: 35,
    percentUsed: 40,
    overspend: false,
    coRecommendation: null,
    roleBreakdown: [
      { role: 'PM', budgeted: 800, spent: 320, remaining: 480, coHours: 0, pcoHours: 0 },
      { role: 'Ops', budgeted: 400, spent: 160, remaining: 240, coHours: 0, pcoHours: 0 },
    ],
  },

  // 09-21: Demo & Framing
  {
    projectId: 'lasalle',
    costCode: '09-21',
    description: 'Demo & framing',
    jobName: 'Interior Demo',
    totalBudgeted: 800,
    totalSpent: 200,
    totalRemaining: 600,
    totalCO: 0,
    totalPCO: 0,
    percentComplete: 20,
    percentUsed: 25,
    overspend: false,
    coRecommendation: null,
    roleBreakdown: [
      { role: 'Super', budgeted: 300, spent: 80, remaining: 220, coHours: 0, pcoHours: 0 },
      { role: 'General Labor', budgeted: 400, spent: 100, remaining: 300, coHours: 0, pcoHours: 0 },
      { role: 'PM', budgeted: 100, spent: 20, remaining: 80, coHours: 0, pcoHours: 0 },
    ],
  },

  // 09-91: Painting
  {
    projectId: 'lasalle',
    costCode: '09-91',
    description: 'Painting',
    jobName: 'Finishes',
    totalBudgeted: 400,
    totalSpent: 0,
    totalRemaining: 400,
    totalCO: 0,
    totalPCO: 0,
    percentComplete: 0,
    percentUsed: 0,
    overspend: false,
    coRecommendation: null,
    roleBreakdown: [
      { role: 'General Labor', budgeted: 300, spent: 0, remaining: 300, coHours: 0, pcoHours: 0 },
      { role: 'Super', budgeted: 60, spent: 0, remaining: 60, coHours: 0, pcoHours: 0 },
      { role: 'PM', budgeted: 40, spent: 0, remaining: 40, coHours: 0, pcoHours: 0 },
    ],
  },
];
