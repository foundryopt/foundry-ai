/**
 * Chat Query Handler
 * Main entry point for chatbot queries. Parses intent, fetches data, builds response.
 */

import type { AuthPayload } from '../shared/types';
import { parseQuery } from './parser';
import { buildSummaryCard, buildListCard, buildAlertCard, type ResponseCard } from './builder';
import { getProjectData } from '../services/project.service';
import { generateIntelligence } from '../ai/intelligence';

interface ChatResponse {
  response: string;
  cards: ResponseCard[];
  intent: string;
  confidence: number;
}

export async function handleChatQuery(
  query: string,
  projectId: string | undefined,
  user: AuthPayload,
): Promise<ChatResponse> {
  const parsed = parseQuery(query);
  const pid = parsed.projectId || projectId || 'belmont';

  try {
    const data = await getProjectData(pid);
    const cards: ResponseCard[] = [];
    let response = '';

    switch (parsed.intent) {
      case 'budget_status': {
        response = `Budget for ${pid}: $${data.budget.currentBudget.toLocaleString()} total, ${data.budget.percentSpent}% spent.`;
        cards.push(buildSummaryCard('Budget Summary', {
          'Current Budget': `$${data.budget.currentBudget.toLocaleString()}`,
          'Total Spent': `$${data.budget.totalSpent.toLocaleString()}`,
          'Remaining': `$${data.budget.totalRemaining.toLocaleString()}`,
          'Pending COs': `$${data.budget.totalPotential.toLocaleString()}`,
          '% Spent': `${data.budget.percentSpent}%`,
        }));
        break;
      }

      case 'schedule_status': {
        response = `Schedule status: ${data.schedule.overallStatus.toUpperCase()}. ${data.schedule.totalPhases} phases tracked.`;
        const behindPhases = data.schedule.phases.filter((p) => p.daysVariance < 0);
        if (behindPhases.length > 0) {
          cards.push(buildListCard('Phases Behind Schedule', behindPhases.map(
            (p) => `${p.name}: ${p.daysVariance}d variance (${p.percentComplete}% vs ${p.plannedPercent}% planned)`,
          )));
        }
        break;
      }

      case 'overdue_tasks': {
        const overdue = data.tasks.filter((t) => t.urgency === 'overdue');
        response = `${overdue.length} overdue items across ${pid}.`;
        if (overdue.length > 0) {
          cards.push(buildListCard('Overdue Items', overdue.map(
            (t) => `[${t.category}] ${t.subject} — ${t.daysOverdue}d (${t.owner})`,
          )));
        }
        break;
      }

      case 'task_list': {
        response = `${data.tasks.length} open tasks for ${pid}.`;
        const byCategory = new Map<string, number>();
        for (const t of data.tasks) {
          byCategory.set(t.category, (byCategory.get(t.category) || 0) + 1);
        }
        cards.push(buildSummaryCard('Tasks by Category',
          Object.fromEntries(byCategory),
        ));
        break;
      }

      case 'project_summary':
      case 'risk_assessment': {
        const intel = generateIntelligence(data, pid);
        response = intel.summary;
        cards.push(buildSummaryCard('Project Intelligence', {
          'Risk Score': `${intel.riskScore}/100`,
          'Open Tasks': data.tasks.length,
          'Overdue': data.tasks.filter((t) => t.urgency === 'overdue').length,
          'Budget Spent': `${data.budget.percentSpent}%`,
          'Schedule': data.schedule.overallStatus,
        }));
        if (intel.topRisks.length > 0) {
          cards.push(buildListCard('Top Risks', intel.topRisks));
        }
        if (intel.recommendations.length > 0) {
          cards.push(buildListCard('Recommendations', intel.recommendations));
        }
        break;
      }

      case 'warranty_status': {
        const open = data.warranties.filter((w) => w.status !== 'resolved' && w.status !== 'closed');
        response = `${open.length} active warranty items for ${pid}.`;
        if (open.length > 0) {
          cards.push(buildListCard('Active Warranty Items', open.map(
            (w) => `[${w.severity}] ${w.unit}: ${w.issueType} — ${w.status} (${w.assignedTo})`,
          )));
        }
        break;
      }

      default: {
        response = `I can help with budget, schedule, tasks, warranties, and risk assessment. Try asking about a specific project like "What's the budget status for Belmont?"`;
        cards.push(buildAlertCard('Tip', 'Try asking about budget, schedule, overdue tasks, or project risk.', 'info'));
      }
    }

    return {
      response,
      cards,
      intent: parsed.intent,
      confidence: parsed.confidence,
    };
  } catch (err) {
    return {
      response: `Error processing query for project ${pid}.`,
      cards: [buildAlertCard('Error', 'Could not fetch project data. Please try again.', 'warning')],
      intent: parsed.intent,
      confidence: 0,
    };
  }
}
