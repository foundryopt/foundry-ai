/**
 * Gmail Simulator
 * Simulates email intake monitoring.
 */

export class GmailSimulator {
  static async getUnreadEmails(label: string = 'INBOX') {
    return [
      {
        id: 'sim-email-001',
        from: 'invoices@sparkelectric.com',
        subject: 'Invoice INV-8840 — January Rough-in Progress',
        date: new Date().toISOString(),
        snippet: 'Please find attached invoice for January electrical rough-in work...',
        hasAttachment: true,
        labels: [label],
      },
      {
        id: 'sim-email-002',
        from: 'pm@crownmechanical.com',
        subject: 'RE: RFI-044 Response Needed',
        date: new Date().toISOString(),
        snippet: 'Following up on the mechanical chase routing question from last week...',
        hasAttachment: false,
        labels: [label],
      },
    ];
  }

  static async getEmailBody(emailId: string) {
    return {
      id: emailId,
      body: 'This is a simulated email body for testing. Please review the attached documentation and provide your response at your earliest convenience.',
    };
  }

  static async markAsRead(emailId: string) {
    return { success: true, emailId };
  }
}
