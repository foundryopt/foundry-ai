import type { VendorBid, BidMilestone } from '@/lib/types';

export const VENDOR_BIDS: VendorBid[] = [
  {
    scopeItem: 'HVAC Ductwork — Supply & Return',
    costCode: '23-05',
    vendors: [
      { name: 'AirFlow Mechanical', price: 388000 },
      { name: 'Summit HVAC', price: 396000, recommended: true },
      { name: 'Metro Duct Co.', price: 421000 },
    ],
    delta: 33000,
    notes: 'Summit includes TAB allowance; AirFlow excludes insulation on return.',
  },
  {
    scopeItem: 'Electrical Rough-in — Conduit & Wire',
    costCode: '26-05',
    vendors: [
      { name: 'Volt Electric', price: 310000, recommended: true },
      { name: 'Sparks & Co.', price: 324000 },
      { name: 'City Power Systems', price: 338000 },
    ],
    delta: 28000,
    notes: 'Volt includes permit fees; Sparks excludes fire alarm tie-in.',
  },
  {
    scopeItem: 'Porcelain Tile — Bathrooms',
    costCode: '09-31',
    vendors: [
      { name: 'Premier Tile', price: 158000, recommended: true },
      { name: 'Stone & Surface', price: 165000 },
      { name: 'Artisan Floors', price: 172000 },
    ],
    delta: 14000,
    notes: 'Premier includes waterproofing at wet areas; all quotes include grout.',
  },
  {
    scopeItem: 'Passenger Elevators (2) — Supply & Install',
    costCode: '14-21',
    vendors: [
      { name: 'Otis Elevator', price: 385000 },
      { name: 'ThyssenKrupp', price: 390000, recommended: true },
      { name: 'KONE', price: 398000 },
    ],
    delta: 13000,
    notes: 'ThyssenKrupp best lead time (14 wks); Otis lowest but 18-wk lead.',
  },
];

export const BID_MILESTONES: BidMilestone[] = [
  {
    id: 'bid-001',
    bidPackage: 'HVAC — Mechanical',
    costCode: '23-00',
    milestones: [
      { label: 'Bid Issued', date: '2025-11-01', status: 'completed' },
      { label: 'Bids Due', date: '2025-11-22', status: 'completed' },
      { label: 'Leveling Complete', date: '2025-12-10', status: 'completed' },
      { label: 'Award', date: '2025-12-18', status: 'completed' },
    ],
  },
  {
    id: 'bid-002',
    bidPackage: 'Electrical',
    costCode: '26-00',
    milestones: [
      { label: 'Bid Issued', date: '2025-11-15', status: 'completed' },
      { label: 'Bids Due', date: '2025-12-06', status: 'completed' },
      { label: 'Leveling Complete', date: '2025-12-20', status: 'completed' },
      { label: 'Award', date: '2026-01-05', status: 'completed' },
    ],
  },
  {
    id: 'bid-003',
    bidPackage: 'Tile & Stone',
    costCode: '09-30',
    milestones: [
      { label: 'Bid Issued', date: '2026-01-10', status: 'completed' },
      { label: 'Bids Due', date: '2026-01-31', status: 'completed' },
      { label: 'Leveling Complete', date: '2026-02-08', status: 'in-progress' },
      { label: 'Award', date: '2026-02-20', status: 'upcoming' },
    ],
  },
  {
    id: 'bid-004',
    bidPackage: 'Elevators',
    costCode: '14-00',
    milestones: [
      { label: 'Bid Issued', date: '2026-02-01', status: 'completed' },
      { label: 'Bids Due', date: '2026-02-22', status: 'in-progress' },
      { label: 'Leveling Complete', date: '2026-03-08', status: 'upcoming' },
      { label: 'Award', date: '2026-03-15', status: 'upcoming' },
    ],
  },
];
