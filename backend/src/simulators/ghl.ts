/**
 * GoHighLevel (GHL) CRM Simulator
 * Simulates contact and campaign management.
 */

export class GHLSimulator {
  static async getContacts(tag?: string) {
    return [
      { id: 'ghl-001', name: 'David Harrington', email: 'dharrington@vanguardwealth.com', tag: 'vip', status: 'active' },
      { id: 'ghl-002', name: 'Sarah Matsuda', email: 'smatsuda@formapilates.com', tag: 'tenant', status: 'active' },
      { id: 'ghl-003', name: 'James Ortega', email: 'jortega@boroughbarber.com', tag: 'prospect', status: 'nurture' },
    ].filter((c) => !tag || c.tag === tag);
  }

  static async createContact(data: { name: string; email: string; tag: string }) {
    return { success: true, id: `ghl-${Date.now()}`, ...data };
  }

  static async sendCampaignEmail(contactId: string, templateId: string) {
    return { success: true, contactId, templateId, sentAt: new Date().toISOString() };
  }

  static async getLeadScore(contactId: string) {
    return { contactId, score: Math.round(Math.random() * 100), lastActivity: new Date().toISOString() };
  }
}
