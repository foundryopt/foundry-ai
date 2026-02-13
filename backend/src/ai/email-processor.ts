/**
 * Email Intake Processor
 * Simulates AI classification of incoming emails into task categories.
 */

interface EmailInput {
  from: string;
  subject: string;
  body: string;
  attachments?: string[];
}

interface EmailClassification {
  category: string;
  confidence: number;
  suggestedOwner: string;
  urgency: string;
  costCodeRef?: string;
  extractedEntities: {
    vendor?: string;
    amount?: number;
    invoiceNumber?: string;
    rfiNumber?: string;
  };
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Invoice: ['invoice', 'billing', 'payment', 'amount due', 'net 30', 'pay app'],
  RFI: ['rfi', 'request for information', 'clarification', 'design question'],
  CO: ['change order', 'pco', 'scope change', 'additional work', 'extra'],
  Submittal: ['submittal', 'shop drawing', 'sample', 'product data'],
  'Lead Time': ['delivery', 'lead time', 'ship date', 'tracking', 'eta'],
  Warranty: ['warranty', 'defect', 'complaint', 'repair', 'callback'],
  Decision: ['decision', 'approve', 'select', 'option a', 'option b'],
  'Pay App': ['pay application', 'progress billing', 'retainage', 'draw request'],
};

const VENDOR_OWNER_MAP: Record<string, string> = {
  'spark electric': 'Jordan M.',
  'crown mechanical': 'Jordan M.',
  'pacific elevator': 'Alex P.',
  'mediterranean stone': 'Alex P.',
  'heritage millwork': 'Taylor R.',
};

export function processEmailIntake(email: EmailInput): EmailClassification {
  const text = `${email.subject} ${email.body}`.toLowerCase();

  // Category detection
  let bestCategory = 'Invoice';
  let bestScore = 0;
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const score = keywords.filter((kw) => text.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      bestCategory = cat;
    }
  }

  // Entity extraction
  const amountMatch = text.match(/\$[\d,]+\.?\d*/);
  const invoiceMatch = text.match(/inv[- ]?(\w+-?\d+)/i);
  const rfiMatch = text.match(/rfi[- ]?(\d+)/i);

  // Owner suggestion
  const fromLower = email.from.toLowerCase();
  let suggestedOwner = 'Jordan M.';
  for (const [vendor, owner] of Object.entries(VENDOR_OWNER_MAP)) {
    if (fromLower.includes(vendor)) {
      suggestedOwner = owner;
      break;
    }
  }

  // Urgency heuristic
  let urgency = 'new';
  if (text.includes('urgent') || text.includes('asap') || text.includes('overdue')) urgency = 'overdue';
  else if (text.includes('today') || text.includes('immediate')) urgency = 'due-today';

  return {
    category: bestCategory,
    confidence: Math.min(0.95, 0.4 + bestScore * 0.2),
    suggestedOwner,
    urgency,
    extractedEntities: {
      vendor: email.from,
      amount: amountMatch ? parseFloat(amountMatch[0].replace(/[$,]/g, '')) : undefined,
      invoiceNumber: invoiceMatch ? invoiceMatch[1] : undefined,
      rfiNumber: rfiMatch ? rfiMatch[1] : undefined,
    },
  };
}
