import type { Role, TaskCategory, ViewTab, Urgency } from './types';

// ── All Roles ──
export const ALL_ROLES: Role[] = [
  'PM', 'Super', 'Principal', "Owner's Rep", 'Procurement', 'Ops', 'Designer',
];

// ── Role → Entity ──
export const ROLE_ENTITY: Record<Role, string> = {
  PM: 'SHB Inc.',
  Super: 'SHB Inc.',
  Principal: 'SHB Group',
  "Owner's Rep": 'SHB Group',
  Procurement: 'Builiq Inc.',
  Ops: 'Builiq Inc.',
  Designer: 'SHB Studio',
};

// ── Role → Default View ──
export const ROLE_DEFAULT_VIEW: Record<Role, ViewTab> = {
  PM: 0,
  Super: 0,
  Principal: 1,
  "Owner's Rep": 1,
  Procurement: 2,
  Ops: 2,
  Designer: 0,
};

// ── All Categories ──
export const ALL_CATEGORIES: TaskCategory[] = [
  'RFI', 'CO', 'Invoice', 'Decision', 'Submittal',
  'Lead Time', 'Warranty', 'Pay App', 'Pre-Task', 'Expense',
];

// ── Urgency Order ──
export const URGENCY_ORDER: Urgency[] = ['overdue', 'due-today', 'new', 'watching'];

// ── Restricted tabs and which roles can see them ──
export const RESTRICTED_TAB_ROLES: Record<number, Role[]> = {
  8: ['Principal', "Owner's Rep"],
  9: ['Principal', "Owner's Rep"],
  10: ['Principal', "Owner's Rep", 'Ops'],
};

// ── Project IDs ──
export const PROJECT_IDS = {
  BELMONT: 'belmont',
  WIELAND: 'wieland',
  LASALLE: 'lasalle',
  ALL: 'all',
} as const;
