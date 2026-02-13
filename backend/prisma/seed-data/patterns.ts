export const SEED_REPEAT_BREACHES = [
  // ── Belmont — Mixed-Use Development ──
  {
    projectId: 'belmont',
    category: 'RFI',
    owner: 'Taylor R.',
    count: 3,
    avgDaysOverdue: 4,
    pattern: 'Architectural/MEP RFIs consistently late — design coordination gap',
  },
  {
    projectId: 'belmont',
    category: 'Submittal',
    owner: 'Taylor R.',
    count: 2,
    avgDaysOverdue: 6,
    pattern: 'Submittal reviews delayed — vendor late submissions + review queue',
  },
  {
    projectId: 'belmont',
    category: 'Invoice',
    owner: 'Jordan M.',
    count: 2,
    avgDaysOverdue: 0,
    pattern: 'Invoices arriving without proper backup documentation',
  },
  {
    projectId: 'belmont',
    category: 'Decision',
    owner: 'Rachel K.',
    count: 1,
    avgDaysOverdue: 4,
    pattern: 'Material decisions delayed — owner preference review time',
  },

  // ── Wieland — Retail Center ──
  {
    projectId: 'wieland',
    category: 'RFI',
    owner: 'Chris L.',
    count: 1,
    avgDaysOverdue: 3,
    pattern: 'Storefront details incomplete in design package',
  },
  {
    projectId: 'wieland',
    category: 'Invoice',
    owner: 'Dana W.',
    count: 1,
    avgDaysOverdue: 0,
    pattern: 'Quantity overruns on earthwork — field verification needed',
  },

  // ── LaSalle — Office Renovation ──
  {
    projectId: 'lasalle',
    category: 'RFI',
    owner: 'Jordan M.',
    count: 1,
    avgDaysOverdue: 2,
    pattern: 'Existing conditions survey incomplete — field conflicts during design',
  },
];

export const SEED_OWNER_LOADS = [
  // ── Belmont — Mixed-Use Development ──
  {
    projectId: 'belmont',
    owner: 'Jordan M.',
    role: 'PM',
    total: 6,
    overdue: 1,
    dueToday: 2,
    newItems: 1,
    watching: 2,
  },
  {
    projectId: 'belmont',
    owner: 'Taylor R.',
    role: 'Ops',
    total: 5,
    overdue: 3,
    dueToday: 0,
    newItems: 2,
    watching: 0,
  },
  {
    projectId: 'belmont',
    owner: 'Alex P.',
    role: 'Procurement',
    total: 3,
    overdue: 1,
    dueToday: 0,
    newItems: 0,
    watching: 2,
  },
  {
    projectId: 'belmont',
    owner: 'Mike S.',
    role: 'Super',
    total: 1,
    overdue: 0,
    dueToday: 0,
    newItems: 1,
    watching: 0,
  },
  {
    projectId: 'belmont',
    owner: 'Rachel K.',
    role: "Owner's Rep",
    total: 1,
    overdue: 1,
    dueToday: 0,
    newItems: 0,
    watching: 0,
  },
  {
    projectId: 'belmont',
    owner: 'Sam W.',
    role: 'Principal',
    total: 1,
    overdue: 0,
    dueToday: 0,
    newItems: 1,
    watching: 0,
  },

  // ── Wieland — Retail Center ──
  {
    projectId: 'wieland',
    owner: 'Chris L.',
    role: 'PM',
    total: 3,
    overdue: 1,
    dueToday: 0,
    newItems: 1,
    watching: 1,
  },
  {
    projectId: 'wieland',
    owner: 'Dana W.',
    role: 'Procurement',
    total: 3,
    overdue: 0,
    dueToday: 1,
    newItems: 1,
    watching: 1,
  },

  // ── LaSalle — Office Renovation ──
  {
    projectId: 'lasalle',
    owner: 'Jordan M.',
    role: 'PM',
    total: 2,
    overdue: 0,
    dueToday: 1,
    newItems: 1,
    watching: 0,
  },
  {
    projectId: 'lasalle',
    owner: 'Taylor R.',
    role: 'Ops',
    total: 1,
    overdue: 0,
    dueToday: 0,
    newItems: 1,
    watching: 0,
  },
];

export const SEED_INVOICE_PATTERNS = [
  // ── Belmont — Mixed-Use Development ──
  {
    projectId: 'belmont',
    vendor: 'Spark Electric',
    invoiceCount: 5,
    issueCount: 2,
    commonIssue: 'Exceeds approved SOV line items',
    avgResolutionDays: 3,
  },
  {
    projectId: 'belmont',
    vendor: 'Crown Mechanical',
    invoiceCount: 4,
    issueCount: 2,
    commonIssue: 'Missing job numbers and CO references',
    avgResolutionDays: 5,
  },
  {
    projectId: 'belmont',
    vendor: 'ABC Concrete',
    invoiceCount: 8,
    issueCount: 0,
    commonIssue: '\u2014',
    avgResolutionDays: 0,
  },

  // ── Wieland — Retail Center ──
  {
    projectId: 'wieland',
    vendor: 'Valley Grading Co.',
    invoiceCount: 3,
    issueCount: 1,
    commonIssue: 'Quantity exceeds contracted amount',
    avgResolutionDays: 4,
  },
  {
    projectId: 'wieland',
    vendor: 'Ironworks Fabrication',
    invoiceCount: 1,
    issueCount: 0,
    commonIssue: '\u2014',
    avgResolutionDays: 0,
  },

  // ── LaSalle — Office Renovation ──
  {
    projectId: 'lasalle',
    vendor: 'Metro Demo Co.',
    invoiceCount: 1,
    issueCount: 0,
    commonIssue: '\u2014',
    avgResolutionDays: 0,
  },
];
