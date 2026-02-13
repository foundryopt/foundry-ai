/* ──────────────────────────────────────────────
   Foundry AI — Backend Types (mirrors dashboard/src/lib/types.ts)
   ────────────────────────────────────────────── */

// ── Project ──
export interface Project {
  id: string;
  name: string;
  phaseLabel: string;
}

// ── Roles & Auth ──
export type Role =
  | 'PM'
  | 'Super'
  | 'Principal'
  | "Owner's Rep"
  | 'Procurement'
  | 'Ops'
  | 'Designer';

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
  projectId: string;
  category: TaskCategory;
  subject: string;
  owner: string;
  urgency: Urgency;
  daysOverdue?: number;
  daysUntilDue?: number;
  slaDate: string;
  createdDate: string;
  source: string;
  deepLinks: DeepLink[];
  detail: TaskDetail;
  relatedTaskIds?: string[];
  costImpact?: number;
  scheduleImpactDays?: number;
  qualityAffected?: string[];
  attachments?: Attachment[];
  costCodeRef?: string;
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

// ── Attachments ──
export type AttachmentType = 'contract' | 'spec' | 'drawing' | 'photo';

export interface Attachment {
  type: AttachmentType;
  label: string;
  url: string;
}

// ── Comments ──
export type CommentSource = 'dashboard' | 'slack';

export interface BudgetComment {
  id: string;
  lineItemId: string;
  author: string;
  timestamp: string;
  text: string;
  source: CommentSource;
}

// ── Bid Leveling ──
export type BidStatus = 'completed' | 'in-progress' | 'upcoming';

export interface VendorBid {
  scopeItem: string;
  costCode: string;
  vendors: { name: string; price: number; recommended?: boolean }[];
  delta: number;
  notes: string;
}

export interface BidMilestone {
  id: string;
  bidPackage: string;
  costCode: string;
  milestones: { label: string; date: string; status: BidStatus }[];
}

// ── Budget / Cost ──
export type CostType = 'M' | 'L' | 'M&L' | 'E';
export type UnitType = 'EA' | 'SF' | 'LF' | 'BF' | 'CY' | 'LS' | 'HR';

export interface BudgetLineItem {
  id: string;
  costCode: string;
  description: string;
  costType: CostType;
  unitPrice: number;
  quantity: number;
  unitType: UnitType;
  budget: number;
  previousPaid: number;
  due: number;
  percentComplete: number;
  remaining: number;
  co: number;
  pco: number;
  actual: number;
  attachments?: Attachment[];
}

export interface BudgetCategory {
  costCode: string;
  label: string;
  original: number;
  current: number;
  spent: number;
  remaining: number;
  potential: number;
  linkedTaskIds: string[];
  lineItems?: BudgetLineItem[];
  projectId?: string;
  projectName?: string;
  attachments?: Attachment[];
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
  daysVariance: number;
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

// ── Pattern Data ──
export interface RepeatBreach {
  projectId: string;
  category: TaskCategory;
  owner: string;
  count: number;
  avgDaysOverdue: number;
  pattern: string;
}

export interface OwnerLoad {
  projectId: string;
  owner: string;
  role: Role;
  total: number;
  overdue: number;
  dueToday: number;
  newItems: number;
  watching: number;
}

export interface InvoicePattern {
  projectId: string;
  vendor: string;
  invoiceCount: number;
  issueCount: number;
  commonIssue: string;
  avgResolutionDays: number;
}

// ── Critical Path ──
export type MilestonePhase =
  | 'Entitlement'
  | 'Precon'
  | 'Superstructure'
  | 'Rough-ins'
  | 'Finishes'
  | 'Closeout';

export interface MilestoneActivity {
  id: string;
  milestonePhase: MilestonePhase;
  costCode: string;
  trade: string;
  description: string;
  owner: string;
  role: Role;
  startDate: string;
  endDate: string;
  percentComplete: number;
  status: 'completed' | 'in-progress' | 'upcoming' | 'at-risk';
  linkedTaskIds: string[];
}

export interface CriticalPathData {
  milestones: {
    phase: MilestonePhase;
    startDate: string;
    endDate: string;
    percentComplete: number;
    status: 'completed' | 'in-progress' | 'upcoming' | 'at-risk';
  }[];
  activities: MilestoneActivity[];
}

// ── Timesheet / Hours Tracking ──
export type TimesheetRole = 'PM' | 'Super' | 'Designer' | 'Procurement' | 'General Labor' | 'Ops';
export type CORecipient = 'Owner' | 'Sub' | 'Homebuyer' | 'Internal';

export interface RoleHours {
  role: TimesheetRole;
  budgeted: number;
  spent: number;
  remaining: number;
  coHours: number;
  pcoHours: number;
}

export interface TimesheetCostCode {
  costCode: string;
  description: string;
  jobName: string;
  roleBreakdown: RoleHours[];
  totalBudgeted: number;
  totalSpent: number;
  totalRemaining: number;
  totalCO: number;
  totalPCO: number;
  percentComplete: number;
  percentUsed: number;
  overspend: boolean;
  coRecommendation?: {
    recipient: CORecipient;
    reason: string;
    estimatedHours: number;
  };
}

export interface TimesheetSummary {
  totalBudgetedHours: number;
  totalSpentHours: number;
  totalRemainingHours: number;
  totalCOHours: number;
  totalPCOHours: number;
  percentUsed: number;
  overspendCount: number;
  costCodes: TimesheetCostCode[];
}

// ── QA/QC ──
export type QADocType = 'Drawing' | 'Spec' | 'Install Instruction' | 'QC Report' | 'Submittal';
export type QADocStatus = 'current' | 'pending-review' | 'revision-needed' | 'superseded';

export interface QAQCDocument {
  id: string;
  projectId: string;
  type: QADocType;
  title: string;
  costCode: string;
  trade: string;
  revision: number;
  status: QADocStatus;
  lastUpdated: string;
  linkedTaskIds: string[];
  fieldwireUrl?: string;
  fileUrl: string;
}

export type QCCheckStatus = 'pass' | 'fail' | 'na' | 'pending';

export interface QCChecklistItem {
  id: string;
  label: string;
  status: QCCheckStatus;
  inspector?: string;
  date?: string;
  notes?: string;
}

export interface QCChecklist {
  id: string;
  projectId: string;
  costCode: string;
  trade: string;
  activity: string;
  location: string;
  items: QCChecklistItem[];
  overallStatus: 'complete' | 'in-progress' | 'not-started';
  linkedTaskIds: string[];
}

export interface QAQCData {
  documents: QAQCDocument[];
  checklists: QCChecklist[];
}

// ── Warranty Tracker ──
export type WarrantySeverity = 'urgent' | 'standard' | 'monitor';
export type WarrantyStatus = 'open' | 'in-progress' | 'resolved' | 'closed';

export interface WarrantyItem {
  id: string;
  projectId: string;
  unit: string;
  issueType: string;
  description: string;
  reportedDate: string;
  severity: WarrantySeverity;
  status: WarrantyStatus;
  assignedTo: string;
  trade: string;
  costCode: string;
  warrantyEnd: string;
  resolution?: string;
  resolvedDate?: string;
  linkedTaskIds: string[];
}

// ── Development ──
export type DevPhase =
  | 'Site Acquisition'
  | 'Entitlement'
  | 'Design'
  | 'Permitting'
  | 'Pre-Construction'
  | 'Construction'
  | 'Lease-Up'
  | 'Stabilization';

export interface DevMilestone {
  id: string;
  phase: DevPhase;
  label: string;
  targetDate: string;
  status: 'completed' | 'in-progress' | 'upcoming' | 'at-risk';
  owner: string;
  notes?: string;
}

// ── Fund / Investors ──
export interface FundDraw {
  id: string;
  drawNumber: number;
  date: string;
  amount: number;
  status: 'approved' | 'pending' | 'submitted';
  description: string;
}

export interface FundSummary {
  totalCommitment: number;
  totalDrawn: number;
  totalRemaining: number;
  draws: FundDraw[];
}

// ── Sales & Showroom ──
export interface LeasingUnit {
  id: string;
  unit: string;
  sqft: number;
  status: 'available' | 'pending' | 'leased' | 'occupied';
  tenant?: string;
  monthlyRent?: number;
  leaseStart?: string;
  leaseEnd?: string;
}

export interface ShowroomEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'open-house' | 'broker-tour' | 'investor-meeting' | 'community' | 'private';
  location: string;
  attendees?: number;
  notes?: string;
}

export interface POSItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  sold: number;
}

export interface Membership {
  id: string;
  name: string;
  tier: 'basic' | 'premium' | 'vip';
  status: 'active' | 'pending' | 'expired';
  startDate: string;
  endDate: string;
  email: string;
}

// ── Design / Finish Selections ──
export type RoomType =
  | 'Kitchen'
  | 'Master Bath'
  | 'Guest Bath'
  | 'Living Room'
  | 'Bedroom'
  | 'Laundry'
  | 'Exterior'
  | 'Common Area';

export type FinishCategory =
  | 'Flooring'
  | 'Countertop'
  | 'Cabinetry'
  | 'Tile'
  | 'Paint'
  | 'Fixtures'
  | 'Hardware'
  | 'Lighting'
  | 'Appliances';

export interface UpgradeOption {
  name: string;
  priceDelta: number;
  spec: string;
}

export interface FinishSelection {
  id: string;
  projectId: string;
  room: RoomType;
  category: FinishCategory;
  item: string;
  spec: string;
  costCode: string;
  baseCost: number;
  selectedUpgrade?: string;
  upgrades: UpgradeOption[];
  imageUrl: string;
}

// ── View Tabs ──
export type ViewTab = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export const VIEW_LABELS: Record<ViewTab, string> = {
  0: 'Attention Today',
  1: "What's Repeating",
  2: 'Procurement & Delivery',
  3: 'Critical Path',
  4: 'Budget Detail',
  5: 'QA/QC',
  6: 'Warranty',
  7: 'Design',
  8: 'Development',
  9: 'Fund',
  10: 'Sales & Showroom',
};

export const COMMON_TABS: ViewTab[] = [0, 1, 2, 3, 4, 5, 6, 7];

export const RESTRICTED_TABS: { tab: ViewTab; roles: Role[] }[] = [
  { tab: 8, roles: ['Principal', "Owner's Rep"] },
  { tab: 9, roles: ['Principal', "Owner's Rep"] },
  { tab: 10, roles: ['Principal', "Owner's Rep", 'Ops'] },
];

// ── Filter State ──
export interface FilterState {
  search: string;
  categories: TaskCategory[];
  owners: string[];
  urgencies: Urgency[];
  costCodes: string[];
  projects: string[];
}

// ── Composite ProjectData (what GET /api/projects/:id/data returns) ──
export interface ProjectData {
  tasks: OpenTask[];
  budget: BudgetSummary;
  schedule: ScheduleSummary;
  quality: QualitySummary;
  criticalPath: CriticalPathData;
  timesheet: TimesheetSummary;
  qaqc: QAQCData;
  repeatBreaches: RepeatBreach[];
  ownerLoads: OwnerLoad[];
  invoicePatterns: InvoicePattern[];
  warranties: WarrantyItem[];
  devMilestones: DevMilestone[];
  fund: FundSummary;
  leasing: LeasingUnit[];
  events: ShowroomEvent[];
  pos: POSItem[];
  memberships: Membership[];
  finishes: FinishSelection[];
}

// ── Auth types ──
export interface AuthPayload {
  userId: string;
  name: string;
  role: Role;
}

export interface LoginRequest {
  name: string;
  role: Role;
}

export interface LoginResponse {
  token: string;
  user: User;
}
