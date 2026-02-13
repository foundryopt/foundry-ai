import type { BudgetCategory as PrismaBudgetCategory, BudgetLineItem as PrismaLineItem } from '@prisma/client';
import type { BudgetCategory, BudgetLineItem, BudgetSummary } from '../shared/types';

type CategoryWithLineItems = PrismaBudgetCategory & {
  lineItems: PrismaLineItem[];
  project: { name: string };
};

export function serializeLineItem(li: PrismaLineItem): BudgetLineItem {
  const result: BudgetLineItem = {
    id: li.id,
    costCode: li.costCode,
    description: li.description,
    costType: li.costType as BudgetLineItem['costType'],
    unitPrice: li.unitPrice,
    quantity: li.quantity,
    unitType: li.unitType as BudgetLineItem['unitType'],
    budget: li.budget,
    previousPaid: li.previousPaid,
    due: li.due,
    percentComplete: li.percentComplete,
    remaining: li.remaining,
    co: li.co,
    pco: li.pco,
    actual: li.actual,
  };
  const attachments = li.attachments as any[];
  if (attachments.length) result.attachments = attachments;
  return result;
}

export function serializeBudgetCategory(cat: CategoryWithLineItems): BudgetCategory {
  const result: BudgetCategory = {
    costCode: cat.costCode,
    label: cat.label,
    original: cat.original,
    current: cat.current,
    spent: cat.spent,
    remaining: cat.remaining,
    potential: cat.potential,
    linkedTaskIds: cat.linkedTaskIds as string[],
    projectId: cat.projectId,
    projectName: cat.project.name,
  };
  if (cat.lineItems.length) {
    result.lineItems = cat.lineItems.map(serializeLineItem);
  }
  const attachments = cat.attachments as any[];
  if (attachments.length) result.attachments = attachments;
  return result;
}

export function serializeBudgetSummary(categories: CategoryWithLineItems[]): BudgetSummary {
  const originalBudget = categories.reduce((s, c) => s + c.original, 0);
  const currentBudget = categories.reduce((s, c) => s + c.current, 0);
  const totalSpent = categories.reduce((s, c) => s + c.spent, 0);
  const totalRemaining = categories.reduce((s, c) => s + c.remaining, 0);
  const totalPotential = categories.reduce((s, c) => s + c.potential, 0);
  const percentSpent = currentBudget > 0 ? Math.round((totalSpent / currentBudget) * 100) : 0;

  return {
    originalBudget,
    currentBudget,
    totalSpent,
    totalRemaining,
    totalPotential,
    percentSpent,
    categories: categories.map(serializeBudgetCategory),
  };
}
