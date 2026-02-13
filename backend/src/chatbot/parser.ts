/**
 * Query Parser
 * Parses natural language queries into structured intents.
 */

export type QueryIntent =
  | 'budget_status'
  | 'schedule_status'
  | 'task_list'
  | 'overdue_tasks'
  | 'vendor_status'
  | 'cost_code_detail'
  | 'project_summary'
  | 'warranty_status'
  | 'risk_assessment'
  | 'unknown';

export interface ParsedQuery {
  intent: QueryIntent;
  projectId?: string;
  costCode?: string;
  vendor?: string;
  category?: string;
  owner?: string;
  confidence: number;
}

const INTENT_PATTERNS: [RegExp, QueryIntent][] = [
  [/budget|cost|spend|remaining|financial/i, 'budget_status'],
  [/schedule|timeline|delay|behind|on.?track|variance/i, 'schedule_status'],
  [/task|open.?item|action/i, 'task_list'],
  [/overdue|late|sla|breach/i, 'overdue_tasks'],
  [/vendor|contractor|sub/i, 'vendor_status'],
  [/cost.?code|line.?item/i, 'cost_code_detail'],
  [/summary|overview|status|how.?is/i, 'project_summary'],
  [/warranty|defect|claim|repair/i, 'warranty_status'],
  [/risk|concern|flag|issue/i, 'risk_assessment'],
];

const PROJECT_PATTERNS: [RegExp, string][] = [
  [/belmont/i, 'belmont'],
  [/wieland/i, 'wieland'],
  [/lasalle/i, 'lasalle'],
  [/all.?project/i, 'all'],
];

export function parseQuery(query: string): ParsedQuery {
  let intent: QueryIntent = 'unknown';
  let confidence = 0;

  for (const [pattern, intentType] of INTENT_PATTERNS) {
    if (pattern.test(query)) {
      intent = intentType;
      confidence = 0.8;
      break;
    }
  }

  // Extract project
  let projectId: string | undefined;
  for (const [pattern, id] of PROJECT_PATTERNS) {
    if (pattern.test(query)) { projectId = id; break; }
  }

  // Extract cost code
  const costCodeMatch = query.match(/(\d{2}-\d{2}|GEN-\d{2})/);
  const costCode = costCodeMatch ? costCodeMatch[1] : undefined;

  // Extract vendor
  const vendorKeywords = ['spark', 'crown', 'pacific', 'mediterranean', 'heritage', 'valley', 'ironworks'];
  const vendor = vendorKeywords.find((v) => query.toLowerCase().includes(v));

  return {
    intent,
    projectId,
    costCode,
    vendor,
    confidence: intent === 'unknown' ? 0.2 : confidence,
  };
}
