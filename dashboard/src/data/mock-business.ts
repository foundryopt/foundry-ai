import type {
  DevMilestone,
  FundDraw,
  FundSummary,
  LeasingUnit,
  ShowroomEvent,
  POSItem,
  Membership,
} from '@/lib/types';

/* ──────────────────────────────────────────────
   Development Milestones
   ────────────────────────────────────────────── */

export const SB_DEV_MILESTONES: DevMilestone[] = [
  {
    id: 'sb-dev-001',
    phase: 'Site Acquisition',
    label: 'Site Acquisition — Escrow Close & Title Transfer',
    targetDate: '2025-03-15',
    status: 'completed',
    owner: 'Kuan C.',
    notes: 'Closed on 2.3-acre parcel at 1200 Innovation Blvd.',
  },
  {
    id: 'sb-dev-002',
    phase: 'Entitlement',
    label: 'Entitlement — CUP & Zoning Approval',
    targetDate: '2025-06-01',
    status: 'completed',
    owner: 'Kuan C.',
    notes: 'Conditional use permit approved by City Council 5/28.',
  },
  {
    id: 'sb-dev-003',
    phase: 'Design',
    label: 'Design — Schematic & Design Development',
    targetDate: '2025-09-15',
    status: 'completed',
    owner: 'SHB Studio',
    notes: 'DD package delivered. Owner sign-off received 9/12.',
  },
  {
    id: 'sb-dev-004',
    phase: 'Permitting',
    label: 'Permitting — Building Permit Issuance',
    targetDate: '2025-11-01',
    status: 'completed',
    owner: 'SHB Studio',
    notes: 'Permit B-2025-04821 issued by City of SandBox.',
  },
  {
    id: 'sb-dev-005',
    phase: 'Pre-Construction',
    label: 'Pre-Construction — Buyout & Mobilization',
    targetDate: '2025-12-15',
    status: 'completed',
    owner: 'Sam W.',
    notes: 'Major trades bought out. Site mobilization complete.',
  },
  {
    id: 'sb-dev-006',
    phase: 'Construction',
    label: 'Construction — Vertical Build & Tenant Improvements',
    targetDate: '2026-08-01',
    status: 'in-progress',
    owner: 'Sam W.',
    notes: 'Superstructure 70% complete. MEP rough-ins underway.',
  },
  {
    id: 'sb-dev-007',
    phase: 'Lease-Up',
    label: 'Lease-Up — Pre-Leasing & Tenant Onboarding',
    targetDate: '2026-06-01',
    status: 'upcoming',
    owner: 'Rachel K.',
    notes: 'Pre-leasing campaign scheduled to launch Q1 2026.',
  },
  {
    id: 'sb-dev-008',
    phase: 'Stabilization',
    label: 'Stabilization — 90% Occupancy Target',
    targetDate: '2027-02-01',
    status: 'upcoming',
    owner: 'Rachel K.',
    notes: 'Target 90% occupancy within 6 months of CO.',
  },
];

export const GF_DEV_MILESTONES: DevMilestone[] = [
  {
    id: 'gf-dev-001',
    phase: 'Site Acquisition',
    label: 'Site Acquisition — Land Purchase & Due Diligence',
    targetDate: '2025-10-01',
    status: 'completed',
    owner: 'Kuan C.',
    notes: 'Phase I ESA clear. 4.1-acre site acquired.',
  },
  {
    id: 'gf-dev-002',
    phase: 'Entitlement',
    label: 'Entitlement — Rezoning & Site Plan Approval',
    targetDate: '2026-01-15',
    status: 'completed',
    owner: 'Kuan C.',
    notes: 'Rezoning from C-2 to MU-3 approved. Site plan conditionally approved.',
  },
  {
    id: 'gf-dev-003',
    phase: 'Design',
    label: 'Design — Schematic Design & CD Production',
    targetDate: '2026-04-01',
    status: 'in-progress',
    owner: 'SHB Studio',
    notes: 'Schematic design approved. Construction documents 40% complete.',
  },
  {
    id: 'gf-dev-004',
    phase: 'Permitting',
    label: 'Permitting — Plan Check & Permit Application',
    targetDate: '2026-06-15',
    status: 'upcoming',
    owner: 'SHB Studio',
    notes: 'Submittal planned once CDs reach 90%.',
  },
  {
    id: 'gf-dev-005',
    phase: 'Pre-Construction',
    label: 'Pre-Construction — Bidding & Early Procurement',
    targetDate: '2026-03-15',
    status: 'in-progress',
    owner: 'Sam W.',
    notes: 'Structural steel and curtain wall packages out to bid.',
  },
  {
    id: 'gf-dev-006',
    phase: 'Construction',
    label: 'Construction — Site Work & Vertical Build',
    targetDate: '2027-01-15',
    status: 'upcoming',
    owner: 'Sam W.',
    notes: 'Pending permit issuance. Grading plan ready.',
  },
];

/* ──────────────────────────────────────────────
   Fund / Investors
   ────────────────────────────────────────────── */

const SB_DRAWS: FundDraw[] = [
  {
    id: 'sb-draw-001',
    drawNumber: 1,
    date: '2025-04-01',
    amount: 2500000,
    status: 'approved',
    description: 'Land acquisition and closing costs',
  },
  {
    id: 'sb-draw-002',
    drawNumber: 2,
    date: '2025-07-15',
    amount: 1750000,
    status: 'approved',
    description: 'Entitlement, design fees, and soft costs',
  },
  {
    id: 'sb-draw-003',
    drawNumber: 3,
    date: '2025-11-01',
    amount: 1500000,
    status: 'approved',
    description: 'Permitting, insurance, and pre-construction services',
  },
  {
    id: 'sb-draw-004',
    drawNumber: 4,
    date: '2026-01-15',
    amount: 1500000,
    status: 'approved',
    description: 'Construction mobilization and initial trade payments',
  },
  {
    id: 'sb-draw-005',
    drawNumber: 5,
    date: '2026-02-10',
    amount: 1500000,
    status: 'pending',
    description: 'Structural steel, concrete, and MEP rough-in progress payment',
  },
];

export const SB_FUND: FundSummary = {
  totalCommitment: 12500000,
  totalDrawn: 8750000,
  totalRemaining: 3750000,
  draws: SB_DRAWS,
};

const GF_DRAWS: FundDraw[] = [
  {
    id: 'gf-draw-001',
    drawNumber: 1,
    date: '2025-10-15',
    amount: 1000000,
    status: 'approved',
    description: 'Land acquisition, due diligence, and Phase I ESA',
  },
  {
    id: 'gf-draw-002',
    drawNumber: 2,
    date: '2026-01-20',
    amount: 600000,
    status: 'submitted',
    description: 'Entitlement fees, design retainer, and early procurement deposits',
  },
];

export const GF_FUND: FundSummary = {
  totalCommitment: 8000000,
  totalDrawn: 1600000,
  totalRemaining: 6400000,
  draws: GF_DRAWS,
};

/* ──────────────────────────────────────────────
   Sales & Showroom — Leasing
   ────────────────────────────────────────────── */

export const SB_LEASING: LeasingUnit[] = [
  {
    id: 'sb-unit-101',
    unit: '101',
    sqft: 1200,
    status: 'leased',
    tenant: 'Groundwork Coffee Co.',
    monthlyRent: 4500,
    leaseStart: '2026-09-01',
    leaseEnd: '2031-08-31',
  },
  {
    id: 'sb-unit-102',
    unit: '102',
    sqft: 950,
    status: 'pending',
    tenant: 'Forma Pilates Studio',
    monthlyRent: 3800,
    leaseStart: '2026-10-01',
    leaseEnd: '2031-09-30',
  },
  {
    id: 'sb-unit-103',
    unit: '103',
    sqft: 600,
    status: 'available',
    monthlyRent: 2500,
  },
  {
    id: 'sb-unit-104',
    unit: '104',
    sqft: 800,
    status: 'available',
    monthlyRent: 3200,
  },
  {
    id: 'sb-unit-105',
    unit: '105',
    sqft: 1100,
    status: 'leased',
    tenant: 'Vanguard Wealth Advisors',
    monthlyRent: 4200,
    leaseStart: '2026-09-01',
    leaseEnd: '2031-08-31',
  },
  {
    id: 'sb-unit-106',
    unit: '106',
    sqft: 750,
    status: 'pending',
    tenant: 'Borough Barbershop',
    monthlyRent: 2800,
    leaseStart: '2026-11-01',
    leaseEnd: '2029-10-31',
  },
  {
    id: 'sb-unit-107',
    unit: '107',
    sqft: 1000,
    status: 'occupied',
    tenant: 'SHB Group — Leasing Office',
    monthlyRent: 0,
    leaseStart: '2026-01-15',
    leaseEnd: '2026-12-31',
  },
  {
    id: 'sb-unit-108',
    unit: '108',
    sqft: 650,
    status: 'available',
    monthlyRent: 2700,
  },
];

/* ──────────────────────────────────────────────
   Sales & Showroom — Events
   ────────────────────────────────────────────── */

export const SB_EVENTS: ShowroomEvent[] = [
  {
    id: 'sb-evt-001',
    title: 'SandBox Grand Preview — Broker Open House',
    date: '2026-02-22',
    time: '10:00 AM – 1:00 PM',
    type: 'broker-tour',
    location: 'SandBox Showroom, Unit 107',
    attendees: 35,
    notes: 'Catered lunch. Floor plans, finish boards, and VR walkthrough on display.',
  },
  {
    id: 'sb-evt-002',
    title: 'Investor Quarterly Update — Q1 2026',
    date: '2026-03-05',
    time: '4:00 PM – 5:30 PM',
    type: 'investor-meeting',
    location: 'SHB Group Conference Room',
    attendees: 12,
    notes: 'Construction progress, draw schedule review, lease-up projections.',
  },
  {
    id: 'sb-evt-003',
    title: 'Public Open House — Community Preview',
    date: '2026-03-15',
    time: '11:00 AM – 3:00 PM',
    type: 'open-house',
    location: 'SandBox Showroom, Unit 107',
    attendees: 80,
    notes: 'First public event. Live music, food truck, and hard hat tours.',
  },
  {
    id: 'sb-evt-004',
    title: 'Tenant Meet & Greet — Signed Lessees',
    date: '2026-03-28',
    time: '6:00 PM – 8:00 PM',
    type: 'private',
    location: 'SandBox Showroom, Unit 107',
    attendees: 20,
    notes: 'Welcome event for signed tenants. TI review and move-in timeline.',
  },
  {
    id: 'sb-evt-005',
    title: 'Neighborhood Association Presentation',
    date: '2026-04-10',
    time: '7:00 PM – 8:30 PM',
    type: 'community',
    location: 'SandBox Community Room (Temporary)',
    attendees: 45,
    notes: 'Traffic study results, landscaping plan, and construction timeline Q&A.',
  },
];

/* ──────────────────────────────────────────────
   Sales & Showroom — POS (Showroom Materials)
   ────────────────────────────────────────────── */

export const SB_POS: POSItem[] = [
  {
    id: 'sb-pos-001',
    sku: 'FLR-OAK-001',
    name: 'White Oak Engineered Flooring Sample',
    category: 'Flooring',
    price: 45,
    stock: 30,
    sold: 12,
  },
  {
    id: 'sb-pos-002',
    sku: 'PNT-SW7015',
    name: 'Sherwin-Williams Repose Gray — Quart Sample',
    category: 'Paint',
    price: 22,
    stock: 50,
    sold: 34,
  },
  {
    id: 'sb-pos-003',
    sku: 'HDW-BRS-010',
    name: 'Brushed Brass Cabinet Pull — 5 in.',
    category: 'Hardware',
    price: 15,
    stock: 48,
    sold: 27,
  },
  {
    id: 'sb-pos-004',
    sku: 'FIX-PLB-020',
    name: 'Kohler Composed Single-Handle Faucet — Matte Black',
    category: 'Fixtures',
    price: 485,
    stock: 8,
    sold: 3,
  },
  {
    id: 'sb-pos-005',
    sku: 'TLE-PRC-005',
    name: 'Porcelain Subway Tile — 3x12 Warm White',
    category: 'Tile',
    price: 18,
    stock: 40,
    sold: 22,
  },
  {
    id: 'sb-pos-006',
    sku: 'LTG-PND-015',
    name: 'Schoolhouse Electric Pendant — Brass Dome',
    category: 'Lighting',
    price: 320,
    stock: 5,
    sold: 2,
  },
];

/* ──────────────────────────────────────────────
   Sales & Showroom — Memberships
   ────────────────────────────────────────────── */

export const SB_MEMBERSHIPS: Membership[] = [
  {
    id: 'sb-mem-001',
    name: 'David Harrington',
    tier: 'vip',
    status: 'active',
    startDate: '2026-01-15',
    endDate: '2027-01-14',
    email: 'dharrington@vanguardwealth.com',
  },
  {
    id: 'sb-mem-002',
    name: 'Sarah Matsuda',
    tier: 'premium',
    status: 'active',
    startDate: '2026-01-20',
    endDate: '2027-01-19',
    email: 'smatsuda@formapilates.com',
  },
  {
    id: 'sb-mem-003',
    name: 'James Ortega',
    tier: 'basic',
    status: 'active',
    startDate: '2026-02-01',
    endDate: '2027-01-31',
    email: 'jortega@boroughbarber.com',
  },
  {
    id: 'sb-mem-004',
    name: 'Linda Chen',
    tier: 'premium',
    status: 'pending',
    startDate: '2026-03-01',
    endDate: '2027-02-28',
    email: 'lchen@groundworkcoffee.com',
  },
  {
    id: 'sb-mem-005',
    name: 'Robert Stein',
    tier: 'vip',
    status: 'pending',
    startDate: '2026-03-01',
    endDate: '2027-02-28',
    email: 'rstein@steinventures.com',
  },
];
