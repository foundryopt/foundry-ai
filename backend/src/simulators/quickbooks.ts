/**
 * QuickBooks Online Simulator
 * Simulates invoice, vendor, and payment data from QBO.
 */

export class QuickBooksSimulator {
  static async getInvoice(invoiceId: string) {
    return {
      id: invoiceId,
      vendor: 'Simulated Vendor',
      amount: Math.round(Math.random() * 50000 + 5000),
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      lineItems: [
        { description: 'Labor', amount: Math.round(Math.random() * 30000) },
        { description: 'Materials', amount: Math.round(Math.random() * 20000) },
      ],
    };
  }

  static async getVendorBalance(vendorId: string) {
    return {
      vendorId,
      name: 'Simulated Vendor',
      balance: Math.round(Math.random() * 100000),
      lastPaymentDate: '2026-02-01',
    };
  }

  static async matchInvoice(invoiceNumber: string, costCode: string) {
    return {
      matched: Math.random() > 0.3,
      invoiceNumber,
      costCode,
      discrepancy: Math.random() > 0.5 ? Math.round(Math.random() * 5000) : 0,
    };
  }
}
