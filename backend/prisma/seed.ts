/**
 * Database Seed Orchestrator
 * Populates all tables from seed-data files.
 *
 * Usage: npx prisma db seed
 * (configured via package.json prisma.seed)
 */

import { PrismaClient } from '@prisma/client';
import { SEED_PROJECTS } from './seed-data/projects';
import { seedUsers } from './seed-data/users';
import { SEED_TASKS } from './seed-data/tasks';
import { SEED_BUDGET_CATEGORIES, SEED_BUDGET_LINE_ITEMS } from './seed-data/budget';
import { SEED_SCHEDULE_PHASES } from './seed-data/schedule';
import { SEED_QUALITY_BY_TYPE } from './seed-data/quality';
import { SEED_REPEAT_BREACHES, SEED_OWNER_LOADS, SEED_INVOICE_PATTERNS } from './seed-data/patterns';
import { SEED_CP_MILESTONES, SEED_CP_ACTIVITIES } from './seed-data/critical-path';
import { SEED_TIMESHEET_COST_CODES } from './seed-data/timesheet';
import { SEED_QAQC_DOCUMENTS, SEED_QC_CHECKLISTS } from './seed-data/qaqc';
import { SEED_WARRANTIES } from './seed-data/warranty';
import {
  SEED_DEV_MILESTONES,
  SEED_FUND_DRAWS,
  SEED_LEASING_UNITS,
  SEED_SHOWROOM_EVENTS,
  SEED_POS_ITEMS,
  SEED_MEMBERSHIPS,
} from './seed-data/business';
import { SEED_FINISHES } from './seed-data/design';
import { SEED_VENDOR_BIDS, SEED_BID_MILESTONES } from './seed-data/bid-leveling';
import { SEED_COMMENTS } from './seed-data/comments';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // ── 1. Projects ──────────────────────────────────
  console.log('  Projects...');
  for (const p of SEED_PROJECTS) {
    await prisma.project.upsert({
      where: { id: p.id },
      update: { name: p.name, phaseLabel: p.phaseLabel },
      create: p,
    });
  }

  // ── 2. Users ─────────────────────────────────────
  console.log('  Users...');
  const userMap = await seedUsers(prisma);

  // ── 3. Tasks ─────────────────────────────────────
  console.log('  Tasks...');
  for (const t of SEED_TASKS) {
    await prisma.task.upsert({
      where: { id: t.id },
      update: {
        projectId: t.projectId,
        category: t.category,
        subject: t.subject,
        owner: t.owner,
        urgency: t.urgency,
        daysOverdue: t.daysOverdue ?? null,
        daysUntilDue: t.daysUntilDue ?? null,
        slaDate: t.slaDate,
        createdDate: t.createdDate,
        source: t.source,
        costImpact: t.costImpact ?? null,
        scheduleImpactDays: t.scheduleImpactDays ?? null,
        costCodeRef: t.costCodeRef ?? null,
        deepLinks: t.deepLinks ?? [],
        detail: t.detail ?? {},
        relatedTaskIds: t.relatedTaskIds ?? [],
        qualityAffected: t.qualityAffected ?? [],
        attachments: t.attachments ?? [],
      },
      create: {
        id: t.id,
        projectId: t.projectId,
        category: t.category,
        subject: t.subject,
        owner: t.owner,
        urgency: t.urgency,
        daysOverdue: t.daysOverdue ?? null,
        daysUntilDue: t.daysUntilDue ?? null,
        slaDate: t.slaDate,
        createdDate: t.createdDate,
        source: t.source,
        costImpact: t.costImpact ?? null,
        scheduleImpactDays: t.scheduleImpactDays ?? null,
        costCodeRef: t.costCodeRef ?? null,
        deepLinks: t.deepLinks ?? [],
        detail: t.detail ?? {},
        relatedTaskIds: t.relatedTaskIds ?? [],
        qualityAffected: t.qualityAffected ?? [],
        attachments: t.attachments ?? [],
      },
    });
  }

  // ── 4. Budget Categories ─────────────────────────
  console.log('  Budget Categories...');
  // Build a map of (projectId + costCode) -> generated category ID
  const categoryIdMap = new Map<string, string>();
  for (const cat of SEED_BUDGET_CATEGORIES) {
    const created = await prisma.budgetCategory.create({
      data: {
        projectId: cat.projectId,
        costCode: cat.costCode,
        label: cat.label,
        original: cat.original,
        current: cat.current,
        spent: cat.spent,
        remaining: cat.remaining,
        potential: cat.potential,
        linkedTaskIds: cat.linkedTaskIds,
        attachments: cat.attachments,
      },
    });
    categoryIdMap.set(`${cat.projectId}:${cat.costCode}`, created.id);
  }

  // ── 5. Budget Line Items ─────────────────────────
  console.log('  Budget Line Items...');
  for (const li of SEED_BUDGET_LINE_ITEMS) {
    const catKey = `${li.projectId}:${(li as any).categoryCostCode}`;
    const categoryId = categoryIdMap.get(catKey);
    if (!categoryId) {
      console.warn(`    ⚠ No category found for line item ${li.id} (key: ${catKey})`);
      continue;
    }
    await prisma.budgetLineItem.upsert({
      where: { id: li.id },
      update: {
        categoryId,
        costCode: li.costCode,
        description: li.description,
        costType: li.costType,
        unitPrice: li.unitPrice,
        quantity: li.quantity,
        unitType: li.unitType,
        budget: li.budget,
        previousPaid: li.previousPaid,
        due: li.due,
        percentComplete: li.percentComplete,
        remaining: li.remaining,
        co: li.co,
        pco: li.pco,
        actual: li.actual,
        attachments: li.attachments ?? [],
      },
      create: {
        id: li.id,
        categoryId,
        costCode: li.costCode,
        description: li.description,
        costType: li.costType,
        unitPrice: li.unitPrice,
        quantity: li.quantity,
        unitType: li.unitType,
        budget: li.budget,
        previousPaid: li.previousPaid,
        due: li.due,
        percentComplete: li.percentComplete,
        remaining: li.remaining,
        co: li.co,
        pco: li.pco,
        actual: li.actual,
        attachments: li.attachments ?? [],
      },
    });
  }

  // ── 6. Schedule Phases ───────────────────────────
  console.log('  Schedule Phases...');
  for (const sp of SEED_SCHEDULE_PHASES) {
    await prisma.schedulePhase.upsert({
      where: { id: sp.id },
      update: {
        projectId: sp.projectId,
        name: sp.name,
        startDate: sp.startDate,
        endDate: sp.endDate,
        percentComplete: sp.percentComplete,
        plannedPercent: sp.plannedPercent,
        daysVariance: sp.daysVariance,
        linkedTaskIds: sp.linkedTaskIds ?? [],
        potentialImpactDays: sp.potentialImpactDays,
      },
      create: {
        id: sp.id,
        projectId: sp.projectId,
        name: sp.name,
        startDate: sp.startDate,
        endDate: sp.endDate,
        percentComplete: sp.percentComplete,
        plannedPercent: sp.plannedPercent,
        daysVariance: sp.daysVariance,
        linkedTaskIds: sp.linkedTaskIds ?? [],
        potentialImpactDays: sp.potentialImpactDays,
      },
    });
  }

  // ── 7. Quality by Type ───────────────────────────
  console.log('  Quality...');
  for (const q of SEED_QUALITY_BY_TYPE) {
    await prisma.qualityByType.upsert({
      where: { projectId_type: { projectId: q.projectId, type: q.type } },
      update: {
        total: q.total,
        current: q.current,
        pendingReview: q.pendingReview,
        revisionNeeded: q.revisionNeeded,
        affectedByOpenTask: q.affectedByOpenTask,
      },
      create: {
        projectId: q.projectId,
        type: q.type,
        total: q.total,
        current: q.current,
        pendingReview: q.pendingReview,
        revisionNeeded: q.revisionNeeded,
        affectedByOpenTask: q.affectedByOpenTask,
      },
    });
  }

  // ── 8. Patterns ──────────────────────────────────
  console.log('  Patterns...');
  for (const rb of SEED_REPEAT_BREACHES) {
    await prisma.repeatBreach.create({ data: rb });
  }
  for (const ol of SEED_OWNER_LOADS) {
    await prisma.ownerLoad.create({ data: ol });
  }
  for (const ip of SEED_INVOICE_PATTERNS) {
    await prisma.invoicePattern.create({ data: ip });
  }

  // ── 9. Critical Path ─────────────────────────────
  console.log('  Critical Path...');
  for (const m of SEED_CP_MILESTONES) {
    await prisma.criticalPathMilestone.create({
      data: {
        projectId: m.projectId,
        phase: m.phase,
        startDate: m.startDate,
        endDate: m.endDate,
        percentComplete: m.percentComplete,
        status: m.status,
      },
    });
  }
  for (const a of SEED_CP_ACTIVITIES) {
    await prisma.milestoneActivity.upsert({
      where: { id: a.id },
      update: {
        projectId: a.projectId,
        milestonePhase: a.milestonePhase,
        costCode: a.costCode,
        trade: a.trade,
        description: a.description,
        owner: a.owner,
        role: a.role,
        startDate: a.startDate,
        endDate: a.endDate,
        percentComplete: a.percentComplete,
        status: a.status,
        linkedTaskIds: a.linkedTaskIds ?? [],
      },
      create: {
        id: a.id,
        projectId: a.projectId,
        milestonePhase: a.milestonePhase,
        costCode: a.costCode,
        trade: a.trade,
        description: a.description,
        owner: a.owner,
        role: a.role,
        startDate: a.startDate,
        endDate: a.endDate,
        percentComplete: a.percentComplete,
        status: a.status,
        linkedTaskIds: a.linkedTaskIds ?? [],
      },
    });
  }

  // ── 10. Timesheet Cost Codes ─────────────────────
  console.log('  Timesheet...');
  for (const tc of SEED_TIMESHEET_COST_CODES) {
    const created = await prisma.timesheetCostCode.create({
      data: {
        projectId: tc.projectId,
        costCode: tc.costCode,
        description: tc.description,
        jobName: tc.jobName,
        totalBudgeted: tc.totalBudgeted,
        totalSpent: tc.totalSpent,
        totalRemaining: tc.totalRemaining,
        totalCO: tc.totalCO,
        totalPCO: tc.totalPCO,
        percentComplete: tc.percentComplete,
        percentUsed: tc.percentUsed,
        overspend: tc.overspend,
        coRecommendation: tc.coRecommendation ?? undefined,
      },
    });

    // Insert role breakdown rows
    for (const rb of tc.roleBreakdown) {
      await prisma.timesheetRoleHours.create({
        data: {
          timesheetCostCodeId: created.id,
          role: rb.role,
          budgeted: rb.budgeted,
          spent: rb.spent,
          remaining: rb.remaining,
          coHours: rb.coHours,
          pcoHours: rb.pcoHours,
        },
      });
    }
  }

  // ── 11. QA/QC ────────────────────────────────────
  console.log('  QA/QC...');
  for (const doc of SEED_QAQC_DOCUMENTS) {
    await prisma.qAQCDocument.upsert({
      where: { id: doc.id },
      update: {
        projectId: doc.projectId,
        type: doc.type,
        title: doc.title,
        costCode: doc.costCode,
        trade: doc.trade,
        revision: doc.revision,
        status: doc.status,
        lastUpdated: doc.lastUpdated,
        linkedTaskIds: doc.linkedTaskIds ?? [],
        fieldwireUrl: doc.fieldwireUrl ?? null,
        fileUrl: doc.fileUrl,
      },
      create: {
        id: doc.id,
        projectId: doc.projectId,
        type: doc.type,
        title: doc.title,
        costCode: doc.costCode,
        trade: doc.trade,
        revision: doc.revision,
        status: doc.status,
        lastUpdated: doc.lastUpdated,
        linkedTaskIds: doc.linkedTaskIds ?? [],
        fieldwireUrl: doc.fieldwireUrl ?? null,
        fileUrl: doc.fileUrl,
      },
    });
  }
  for (const cl of SEED_QC_CHECKLISTS) {
    await prisma.qCChecklist.upsert({
      where: { id: cl.id },
      update: {
        projectId: cl.projectId,
        costCode: cl.costCode,
        trade: cl.trade,
        activity: cl.activity,
        location: cl.location,
        overallStatus: cl.overallStatus,
        linkedTaskIds: cl.linkedTaskIds ?? [],
        items: cl.items,
      },
      create: {
        id: cl.id,
        projectId: cl.projectId,
        costCode: cl.costCode,
        trade: cl.trade,
        activity: cl.activity,
        location: cl.location,
        overallStatus: cl.overallStatus,
        linkedTaskIds: cl.linkedTaskIds ?? [],
        items: cl.items,
      },
    });
  }

  // ── 12. Warranty ─────────────────────────────────
  console.log('  Warranty...');
  for (const w of SEED_WARRANTIES) {
    await prisma.warrantyItem.upsert({
      where: { id: w.id },
      update: {
        projectId: w.projectId,
        unit: w.unit,
        issueType: w.issueType,
        description: w.description,
        reportedDate: w.reportedDate,
        severity: w.severity,
        status: w.status,
        assignedTo: w.assignedTo,
        trade: w.trade,
        costCode: w.costCode,
        warrantyEnd: w.warrantyEnd,
        resolution: w.resolution ?? null,
        resolvedDate: w.resolvedDate ?? null,
        linkedTaskIds: w.linkedTaskIds ?? [],
      },
      create: {
        id: w.id,
        projectId: w.projectId,
        unit: w.unit,
        issueType: w.issueType,
        description: w.description,
        reportedDate: w.reportedDate,
        severity: w.severity,
        status: w.status,
        assignedTo: w.assignedTo,
        trade: w.trade,
        costCode: w.costCode,
        warrantyEnd: w.warrantyEnd,
        resolution: w.resolution ?? null,
        resolvedDate: w.resolvedDate ?? null,
        linkedTaskIds: w.linkedTaskIds ?? [],
      },
    });
  }

  // ── 13. Business (Dev, Fund, Leasing, Events, POS, Memberships) ──
  console.log('  Business...');
  for (const dm of SEED_DEV_MILESTONES) {
    await prisma.devMilestone.upsert({
      where: { id: dm.id },
      update: {
        projectId: dm.projectId,
        phase: dm.phase,
        label: dm.label,
        targetDate: dm.targetDate,
        status: dm.status,
        owner: dm.owner,
        notes: dm.notes ?? null,
      },
      create: {
        id: dm.id,
        projectId: dm.projectId,
        phase: dm.phase,
        label: dm.label,
        targetDate: dm.targetDate,
        status: dm.status,
        owner: dm.owner,
        notes: dm.notes ?? null,
      },
    });
  }
  for (const fd of SEED_FUND_DRAWS) {
    await prisma.fundDraw.upsert({
      where: { id: fd.id },
      update: {
        projectId: fd.projectId,
        drawNumber: fd.drawNumber,
        date: fd.date,
        amount: fd.amount,
        status: fd.status,
        description: fd.description,
      },
      create: {
        id: fd.id,
        projectId: fd.projectId,
        drawNumber: fd.drawNumber,
        date: fd.date,
        amount: fd.amount,
        status: fd.status,
        description: fd.description,
      },
    });
  }
  for (const lu of SEED_LEASING_UNITS) {
    await prisma.leasingUnit.upsert({
      where: { id: lu.id },
      update: {
        projectId: lu.projectId,
        unit: lu.unit,
        sqft: lu.sqft,
        status: lu.status,
        tenant: lu.tenant ?? null,
        monthlyRent: lu.monthlyRent ?? null,
        leaseStart: lu.leaseStart ?? null,
        leaseEnd: lu.leaseEnd ?? null,
      },
      create: {
        id: lu.id,
        projectId: lu.projectId,
        unit: lu.unit,
        sqft: lu.sqft,
        status: lu.status,
        tenant: lu.tenant ?? null,
        monthlyRent: lu.monthlyRent ?? null,
        leaseStart: lu.leaseStart ?? null,
        leaseEnd: lu.leaseEnd ?? null,
      },
    });
  }
  for (const ev of SEED_SHOWROOM_EVENTS) {
    await prisma.showroomEvent.upsert({
      where: { id: ev.id },
      update: {
        projectId: ev.projectId,
        title: ev.title,
        date: ev.date,
        time: ev.time,
        type: ev.type,
        location: ev.location,
        attendees: ev.attendees ?? null,
        notes: ev.notes ?? null,
      },
      create: {
        id: ev.id,
        projectId: ev.projectId,
        title: ev.title,
        date: ev.date,
        time: ev.time,
        type: ev.type,
        location: ev.location,
        attendees: ev.attendees ?? null,
        notes: ev.notes ?? null,
      },
    });
  }
  for (const pi of SEED_POS_ITEMS) {
    await prisma.pOSItem.upsert({
      where: { id: pi.id },
      update: {
        projectId: pi.projectId,
        sku: pi.sku,
        name: pi.name,
        category: pi.category,
        price: pi.price,
        stock: pi.stock,
        sold: pi.sold,
      },
      create: {
        id: pi.id,
        projectId: pi.projectId,
        sku: pi.sku,
        name: pi.name,
        category: pi.category,
        price: pi.price,
        stock: pi.stock,
        sold: pi.sold,
      },
    });
  }
  for (const mb of SEED_MEMBERSHIPS) {
    await prisma.membership.upsert({
      where: { id: mb.id },
      update: {
        projectId: mb.projectId,
        name: mb.name,
        tier: mb.tier,
        status: mb.status,
        startDate: mb.startDate,
        endDate: mb.endDate,
        email: mb.email,
      },
      create: {
        id: mb.id,
        projectId: mb.projectId,
        name: mb.name,
        tier: mb.tier,
        status: mb.status,
        startDate: mb.startDate,
        endDate: mb.endDate,
        email: mb.email,
      },
    });
  }

  // ── 14. Design / Finishes ────────────────────────
  console.log('  Design Selections...');
  for (const f of SEED_FINISHES) {
    await prisma.finishSelection.upsert({
      where: { id: f.id },
      update: {
        projectId: f.projectId,
        room: f.room,
        category: f.category,
        item: f.item,
        spec: f.spec,
        costCode: f.costCode,
        baseCost: f.baseCost,
        upgrades: f.upgrades ?? [],
        imageUrl: f.imageUrl,
      },
      create: {
        id: f.id,
        projectId: f.projectId,
        room: f.room,
        category: f.category,
        item: f.item,
        spec: f.spec,
        costCode: f.costCode,
        baseCost: f.baseCost,
        upgrades: f.upgrades ?? [],
        imageUrl: f.imageUrl,
      },
    });
  }

  // ── 15. Bid Leveling ─────────────────────────────
  console.log('  Bid Leveling...');
  for (const vb of SEED_VENDOR_BIDS) {
    await prisma.vendorBidScope.create({
      data: {
        projectId: vb.projectId,
        scopeItem: vb.scopeItem,
        costCode: vb.costCode,
        vendors: vb.vendors,
        delta: vb.delta,
        notes: vb.notes,
      },
    });
  }
  for (const bm of SEED_BID_MILESTONES) {
    await prisma.bidMilestone.upsert({
      where: { id: bm.id },
      update: {
        projectId: bm.projectId,
        bidPackage: bm.bidPackage,
        costCode: bm.costCode,
        milestones: bm.milestones,
      },
      create: {
        id: bm.id,
        projectId: bm.projectId,
        bidPackage: bm.bidPackage,
        costCode: bm.costCode,
        milestones: bm.milestones,
      },
    });
  }

  // ── 16. Comments ─────────────────────────────────
  console.log('  Comments...');
  for (const c of SEED_COMMENTS) {
    // Look up the author by name
    const authorId = userMap.get(c.authorName);
    if (!authorId) {
      console.warn(`    ⚠ Author not found: ${c.authorName}`);
      continue;
    }
    await prisma.budgetComment.create({
      data: {
        lineItemId: c.lineItemId,
        authorId,
        timestamp: new Date(c.timestamp),
        text: c.text,
        source: c.source,
      },
    });
  }

  console.log('\n✅ Seed complete!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
