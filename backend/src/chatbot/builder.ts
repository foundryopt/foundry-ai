/**
 * Response Card Builder
 * Builds structured response cards for chatbot output.
 */

export interface ResponseCard {
  type: 'summary' | 'list' | 'alert' | 'detail';
  title: string;
  content: string;
  data?: Record<string, any>;
  actions?: { label: string; url: string }[];
}

export function buildSummaryCard(title: string, metrics: Record<string, string | number>): ResponseCard {
  const content = Object.entries(metrics)
    .map(([key, val]) => `**${key}**: ${val}`)
    .join('\n');
  return { type: 'summary', title, content, data: metrics };
}

export function buildListCard(title: string, items: string[]): ResponseCard {
  const content = items.map((item, i) => `${i + 1}. ${item}`).join('\n');
  return { type: 'list', title, content };
}

export function buildAlertCard(title: string, message: string, severity: 'info' | 'warning' | 'critical'): ResponseCard {
  return {
    type: 'alert',
    title,
    content: message,
    data: { severity },
  };
}

export function buildDetailCard(title: string, content: string, actions?: { label: string; url: string }[]): ResponseCard {
  return { type: 'detail', title, content, actions };
}
