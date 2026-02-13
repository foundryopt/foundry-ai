/**
 * WhatsApp Business Simulator
 * Simulates messaging for vendor and tenant communications.
 */

export class WhatsAppSimulator {
  static async sendMessage(to: string, message: string) {
    return {
      success: true,
      messageId: `wa-${Date.now()}`,
      to,
      timestamp: new Date().toISOString(),
      status: 'sent',
    };
  }

  static async getMessages(conversationId: string) {
    return [
      {
        id: 'wa-msg-001',
        from: '+15551234567',
        text: 'Delivery confirmed for Friday morning. 8 AM at loading dock.',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        status: 'read',
      },
      {
        id: 'wa-msg-002',
        from: 'system',
        text: 'Acknowledged. Will coordinate with site super.',
        timestamp: new Date(Date.now() - 3000000).toISOString(),
        status: 'delivered',
      },
    ];
  }

  static async sendTemplate(to: string, templateName: string, params: Record<string, string>) {
    return {
      success: true,
      messageId: `wa-tmpl-${Date.now()}`,
      to,
      template: templateName,
      params,
    };
  }
}
