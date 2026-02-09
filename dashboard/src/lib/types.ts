/* ──────────────────────────────────────────────
   Foundry AI — Open Task Dashboard Types
   ────────────────────────────────────────────── */

// ── Roles & Auth ──

export type Role =
  | 'PM'
  | 'Super'
  | 'Principal'
  | "Owner's Rep"
  | 'Procurement'
  | 'Ops';

export interface User {
  name: string;
  role: Role;
  avatar?: string;
}

// ── Open Task Categories ──

export type TaskCategory =
  | 'RFI'
  | 'CO'
  | 'Invoice'
  | 'Decision'
  | 'Submittal'
  | 'Lead Time'
  | 'Warranty'
  | 'Pay App'
  | 'Pre-Task'
  | 'Expense';

// ── Urgency ──

export type Urgency = 'overdue' | 'due-today' | 'new' | 'watching';

// ── Deep Links ──

export type DeepLinkTarget =
  | 'Smartsheet'
  | 'Slack'
  | 'Sheet'
  | 'Email'
  | 'Doc'
  | 'Fieldwire'
  | 'Adaptive'
  | 'CompanyCam';

export interface DeepLink {
  target: DeepLinkTarget;
  label: string;
  url: string;
}

// ── Open Task ──

export interface OpenTask {
  id: string;
  category: TaskCategory;
  subject: string;
  owner: string;
  urgency: Urgency;
  daysOverdue?: number;
  daysUntilDue?: number;
  slaDate: string; // ISO date
  createdDate: string; // ISO date
  source: string;
  deepLinks: DeepLink[];
  detail: TaskDetail;
  relatedTaskIds?: string[];
  costImpact?: number;
  scheduleImpactDays?: number;
  qualityAffected?: string[];
}

// ── Category-Specific Detail (Discriminated Union) ──

export type TaskDetail =
  | RFIDetail
  | CODetail
  | InvoiceDetail
  | DecisionDetail
  | SubmittalDetail
  | LeadTimeDetail
  | WarrantyDetail
  | PayAppDetail
  | PreTaskDetail
  | ExpenseDetail;

export interface RFIDetail {
  type: 'RFI';
  rfiNumber: string;
  discipline: string;
  questionSummary: string;
  designContact: string;
  submittedDate: string;
  responseDeadline: string;
  impactedAreas: string[];
  linkedSubmittals?: string[];
}

export interface CODetail {
  type: 'CO';
  pcoNumber: string;
  estimatedCost: number;
  costCode: string;
  reason: string;
  submittedBy: string;
  approvalChain: string[];
  linkedRfis?: string[];
}

export interface InvoiceDetail {
  type: 'Invoice';
  invoiceNumber: string;
  vendor: string;
  amount: number;
  costCode: string;
  submittedDate: string;
  issue: string;
  matchStatus: 'matched' | 'partial' | 'unmatched';
}

export interface DecisionDetail {
  type: 'Decision';
  decisionNumber: string;
  requestedBy: string;
  options: string[];
  deadline: string;
  impact: string;
  stakeholders: string[];
}

export interface SubmittalDetail {
  type: 'Submittal';
  submittalNumber: string;
  specSection: string;
  vendor: string;
  submittedDate: string;
  reviewDeadline: string;
  revisionNumber: number;
  reviewers: string[];
}

export interface LeadTimeDetail {
  type: 'Lead Time';
  itemDescription: string;
  vendor: string;
  orderDate: string;
  expectedDelivery: string;
  requiredOnSite: string;
  floatDays: number;
  riskLevel: 'critical' | 'at-risk' | 'on-track';
}

export interface WarrantyDetail {
  type: 'Warranty';
  claimNumber: string;
  unit: string;
  issueType: string;
  reportedDate: string;
  severity: 'urgent' | 'standard' | 'monitor';
  assignedTo: string;
}

export interface PayAppDetail {
  type: 'Pay App';
  payAppNumber: string;
  contractor: string;
  periodEnd: string;
  amount: number;
  retainage: number;
  status: string;
}

export interface PreTaskDetail {
  type: 'Pre-Task';
  activity: string;
  scheduledDate: string;
  crew: string;
  prerequisites: string[];
  checklistItems: string[];
}

export interface ExpenseDetail {
  type: 'Expense';
  expenseNumber: string;
  submittedBy: string;
  amount: number;
  costCode: string;
  description: string;
  receiptAttached: boolean;
}

// ── Team Member ──

export interface TeamMember {
  name: string;
  role: Role;
  entity: string;
  email: string;
  openTaskCount: number;
}

// ── Budget / Cost ──

export interface BudgetCategory {
  costCode: string;
  label: string;
  original: number;
  current: number;
  spent: number;
  remaining: number;
  potential: number;
  linkedTaskIds: string[];
}

export interface BudgetSummary {
  originalBudget: number;
  currentBudget: number;
  totalSpent: number;
  totalRemaining: number;
  totalPotential: number;
  percentSpent: number;
  categories: BudgetCategory[];
}

// ── Schedule / Time ──

export interface SchedulePhase {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  percentComplete: number;
  plannedPercent: number;
  daysVariance: number; // negative = behind
  linkedTaskIds: string[];
  potentialImpactDays: number;
}

export interface ScheduleSummary {
  totalPhases: number;
  overallStatus: 'on-track' | 'at-risk' | 'behind';
  phases: SchedulePhase[];
}

// ── Quality / Documents ──

export type DocumentType = 'Drawing' | 'Spec' | 'Submittal' | 'QC';

export type DocumentStatus =
  | 'current'
  | 'pending-review'
  | 'revision-needed'
  | 'affected-by-open-task';

export interface TrackedDocument {
  id: string;
  type: DocumentType;
  title: string;
  status: DocumentStatus;
  linkedTaskIds: string[];
}

export interface QualitySummary {
  totalDocuments: number;
  percentCurrent: number;
  affectedByOpenTasks: number;
  byType: {
    type: DocumentType;
    total: number;
    current: number;
    pendingReview: number;
    revisionNeeded: number;
    affectedByOpenTask: number;
  }[];
}

// ── Pattern Data (View 2) ──

export interface RepeatBreach {
  category: TaskCategory;
  owner: string;
  count: number;
  avgDaysOverdue: number;
  pattern: string;
}

export interface OwnerLoad {
  owner: string;
  role: Role;
  total: number;
  overdue: number;
  dueToday: number;
  newItems: number;
  watching: number;
}

// ── View Tabs ──

export type ViewTab = 0 | 1 | 2 | 3;

export const VIEW_LABELS: Record<ViewTab, string> = {
  0: 'Attention Today',
  1: "What's Repeating",
  2: 'Procurement & Delivery',
  3: 'Cost · Time · Quality',
};

// ── Filter State ──

export interface FilterState {
  search: string;
  categories: TaskCategory[];
  owners: string[];
  urgencies: Urgency[];
}
