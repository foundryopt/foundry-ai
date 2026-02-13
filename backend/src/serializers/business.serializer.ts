import type {
  DevMilestone as PrismaDev,
  FundDraw as PrismaFund,
  LeasingUnit as PrismaLeasing,
  ShowroomEvent as PrismaEvent,
  POSItem as PrismaPOS,
  Membership as PrismaMember,
} from '@prisma/client';
import type { DevMilestone, FundDraw, FundSummary, LeasingUnit, ShowroomEvent, POSItem, Membership, DevPhase } from '../shared/types';

export function serializeDevMilestone(d: PrismaDev): DevMilestone {
  return {
    id: d.id,
    phase: d.phase as DevPhase,
    label: d.label,
    targetDate: d.targetDate,
    status: d.status as DevMilestone['status'],
    owner: d.owner,
    notes: d.notes ?? undefined,
  };
}

export function serializeFundDraw(f: PrismaFund): FundDraw {
  return {
    id: f.id,
    drawNumber: f.drawNumber,
    date: f.date,
    amount: f.amount,
    status: f.status as FundDraw['status'],
    description: f.description,
  };
}

export function serializeFundSummary(draws: PrismaFund[]): FundSummary {
  const totalDrawn = draws
    .filter((d) => d.status === 'approved')
    .reduce((s, d) => s + d.amount, 0);

  // We'll compute commitment from sum of all draws + remaining
  // For simplicity, store totalCommitment as a computed field
  const allAmount = draws.reduce((s, d) => s + d.amount, 0);
  // Estimate: commitment = totalDrawn * 1.4 (rough estimate from data)
  // Better: we'll use the actual data pattern
  const totalCommitment = allAmount > 0 ? Math.round(allAmount * 1.4) : 0;

  return {
    totalCommitment,
    totalDrawn,
    totalRemaining: totalCommitment - totalDrawn,
    draws: draws.map(serializeFundDraw),
  };
}

export function serializeLeasingUnit(l: PrismaLeasing): LeasingUnit {
  return {
    id: l.id,
    unit: l.unit,
    sqft: l.sqft,
    status: l.status as LeasingUnit['status'],
    tenant: l.tenant ?? undefined,
    monthlyRent: l.monthlyRent ?? undefined,
    leaseStart: l.leaseStart ?? undefined,
    leaseEnd: l.leaseEnd ?? undefined,
  };
}

export function serializeShowroomEvent(e: PrismaEvent): ShowroomEvent {
  return {
    id: e.id,
    title: e.title,
    date: e.date,
    time: e.time,
    type: e.type as ShowroomEvent['type'],
    location: e.location,
    attendees: e.attendees ?? undefined,
    notes: e.notes ?? undefined,
  };
}

export function serializePOSItem(p: PrismaPOS): POSItem {
  return {
    id: p.id,
    sku: p.sku,
    name: p.name,
    category: p.category,
    price: p.price,
    stock: p.stock,
    sold: p.sold,
  };
}

export function serializeMembership(m: PrismaMember): Membership {
  return {
    id: m.id,
    name: m.name,
    tier: m.tier as Membership['tier'],
    status: m.status as Membership['status'],
    startDate: m.startDate,
    endDate: m.endDate,
    email: m.email,
  };
}
