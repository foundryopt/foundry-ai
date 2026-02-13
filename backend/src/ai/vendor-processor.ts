/**
 * Vendor Performance Processor
 * Analyzes vendor invoice and delivery patterns to flag issues.
 */

interface VendorInvoice {
  vendor: string;
  invoiceNumber: string;
  amount: number;
  hasIssue: boolean;
  issueType?: string;
  resolutionDays?: number;
}

interface VendorScorecard {
  vendor: string;
  totalInvoices: number;
  issueRate: number;
  avgResolutionDays: number;
  commonIssues: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

export function processVendorPerformance(invoices: VendorInvoice[]): VendorScorecard[] {
  const vendorMap = new Map<string, VendorInvoice[]>();

  for (const inv of invoices) {
    const existing = vendorMap.get(inv.vendor) || [];
    existing.push(inv);
    vendorMap.set(inv.vendor, existing);
  }

  const scorecards: VendorScorecard[] = [];

  for (const [vendor, invs] of vendorMap) {
    const issues = invs.filter((i) => i.hasIssue);
    const issueRate = invs.length > 0 ? issues.length / invs.length : 0;
    const resolutionDays = issues
      .filter((i) => i.resolutionDays !== undefined)
      .map((i) => i.resolutionDays!);
    const avgResolution = resolutionDays.length > 0
      ? Math.round(resolutionDays.reduce((s, d) => s + d, 0) / resolutionDays.length)
      : 0;

    const issueTypes = [...new Set(issues.map((i) => i.issueType).filter(Boolean))];

    scorecards.push({
      vendor,
      totalInvoices: invs.length,
      issueRate: Math.round(issueRate * 100),
      avgResolutionDays: avgResolution,
      commonIssues: issueTypes as string[],
      riskLevel: issueRate > 0.4 ? 'high' : issueRate > 0.2 ? 'medium' : 'low',
    });
  }

  return scorecards;
}
