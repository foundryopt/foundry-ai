/**
 * Pattern Detector
 * Analyzes task history to detect repeat breaches and systemic issues.
 */

import type { OpenTask, RepeatBreach, OwnerLoad, InvoicePattern } from '../shared/types';

export function detectPatterns(tasks: OpenTask[]): {
  breaches: RepeatBreach[];
  loads: OwnerLoad[];
  invoicePatterns: InvoicePattern[];
} {
  // ── Repeat Breaches ──
  const breachMap = new Map<string, { count: number; totalOverdue: number }>();
  for (const t of tasks) {
    if (t.urgency === 'overdue' && t.daysOverdue) {
      const key = `${t.projectId}|${t.category}|${t.owner}`;
      const existing = breachMap.get(key) || { count: 0, totalOverdue: 0 };
      existing.count++;
      existing.totalOverdue += t.daysOverdue;
      breachMap.set(key, existing);
    }
  }

  const breaches: RepeatBreach[] = [];
  for (const [key, val] of breachMap) {
    if (val.count >= 1) {
      const [projectId, category, owner] = key.split('|');
      breaches.push({
        projectId,
        category: category as RepeatBreach['category'],
        owner,
        count: val.count,
        avgDaysOverdue: Math.round(val.totalOverdue / val.count),
        pattern: `${category} tasks consistently overdue for ${owner}`,
      });
    }
  }

  // ── Owner Loads ──
  const loadMap = new Map<string, OwnerLoad>();
  for (const t of tasks) {
    const key = `${t.projectId}|${t.owner}`;
    const existing = loadMap.get(key) || {
      projectId: t.projectId,
      owner: t.owner,
      role: 'PM' as OwnerLoad['role'],
      total: 0, overdue: 0, dueToday: 0, newItems: 0, watching: 0,
    };
    existing.total++;
    if (t.urgency === 'overdue') existing.overdue++;
    if (t.urgency === 'due-today') existing.dueToday++;
    if (t.urgency === 'new') existing.newItems++;
    if (t.urgency === 'watching') existing.watching++;
    loadMap.set(key, existing);
  }
  const loads = Array.from(loadMap.values());

  // ── Invoice Patterns ──
  const invoiceTasks = tasks.filter((t) => t.category === 'Invoice');
  const vendorMap = new Map<string, { projectId: string; count: number; issues: number; issueMsgs: string[] }>();
  for (const t of invoiceTasks) {
    const detail = t.detail as any;
    if (detail.type === 'Invoice') {
      const key = `${t.projectId}|${detail.vendor}`;
      const existing = vendorMap.get(key) || { projectId: t.projectId, count: 0, issues: 0, issueMsgs: [] };
      existing.count++;
      if (detail.matchStatus !== 'matched') {
        existing.issues++;
        existing.issueMsgs.push(detail.issue);
      }
      vendorMap.set(key, existing);
    }
  }

  const invoicePatterns: InvoicePattern[] = [];
  for (const [key, val] of vendorMap) {
    const [projectId, vendor] = key.split('|');
    invoicePatterns.push({
      projectId,
      vendor,
      invoiceCount: val.count,
      issueCount: val.issues,
      commonIssue: val.issueMsgs[0] || '—',
      avgResolutionDays: val.issues > 0 ? 3 : 0,
    });
  }

  return { breaches, loads, invoicePatterns };
}
