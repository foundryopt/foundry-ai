import type { Role, TaskCategory, ViewTab, Urgency } from './types';

/* ── Urgency Colors ── */

export const URGENCY_COLORS: Record<Urgency, { bg: string; border: string; text: string }> = {
  overdue: { bg: 'bg-red-50', border: 'border-urgency-overdue', text: 'text-red-700' },
  'due-today': { bg: 'bg-yellow-50', border: 'border-urgency-due-today', text: 'text-yellow-700' },
  new: { bg: 'bg-blue-50', border: 'border-urgency-new', text: 'text-blue-700' },
  watching: { bg: 'bg-gray-50', border: 'border-urgency-watching', text: 'text-gray-600' },
};

export const URGENCY_ORDER: Urgency[] = ['overdue', 'due-today', 'new', 'watching'];

export const URGENCY_LABELS: Record<Urgency, string> = {
  overdue: 'Overdue',
  'due-today': 'Due Today',
  new: 'New',
  watching: 'Watching',
};

/* ── Category Colors ── */

export const CATEGORY_COLORS: Record<TaskCategory, string> = {
  RFI: 'bg-indigo-100 text-indigo-800',
  CO: 'bg-orange-100 text-orange-800',
  Invoice: 'bg-emerald-100 text-emerald-800',
  Decision: 'bg-purple-100 text-purple-800',
  Submittal: 'bg-cyan-100 text-cyan-800',
  'Lead Time': 'bg-rose-100 text-rose-800',
  Warranty: 'bg-amber-100 text-amber-800',
  'Pay App': 'bg-lime-100 text-lime-800',
  'Pre-Task': 'bg-sky-100 text-sky-800',
  Expense: 'bg-pink-100 text-pink-800',
};

/* ── All Categories ── */

export const ALL_CATEGORIES: TaskCategory[] = [
  'RFI',
  'CO',
  'Invoice',
  'Decision',
  'Submittal',
  'Lead Time',
  'Warranty',
  'Pay App',
  'Pre-Task',
  'Expense',
];

/* ── Role → Default View ── */

export const ROLE_DEFAULT_VIEW: Record<Role, ViewTab> = {
  PM: 0,
  Super: 0,
  Principal: 1,
  "Owner's Rep": 1,
  Procurement: 2,
  Ops: 2,
};

/* ── Role → Entity ── */

export const ROLE_ENTITY: Record<Role, string> = {
  PM: 'SHB Inc.',
  Super: 'SHB Inc.',
  Principal: 'SHB Group',
  "Owner's Rep": 'SHB Group',
  Procurement: 'Builiq Inc.',
  Ops: 'Builiq Inc.',
};

/* ── Role Descriptions (for login page) ── */

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  PM: 'Project Manager — daily task triage, cost control, team coordination',
  Super: 'Superintendent — field operations, pre-task planning, quality checks',
  Principal: 'Principal — escalation decisions, risk acceptance, budget sign-off',
  "Owner's Rep": "Owner's Representative — oversight, approval authority, milestone tracking",
  Procurement: 'Procurement — vendor coordination, lead times, submittals',
  Ops: 'Operations — invoice processing, expense tracking, compliance',
};

/* ── Chart Colors ── */

export const CHART_COLORS = {
  actual: '#3B82F6',
  remaining: '#E5E7EB',
  potential: '#F59E0B',
  onTrack: '#22C55E',
  atRisk: '#EAB308',
  behind: '#EF4444',
};

