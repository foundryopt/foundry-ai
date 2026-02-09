'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { BudgetCategory } from '@/lib/types';
import { CHART_COLORS } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';

interface CostChartProps {
  categories: BudgetCategory[];
  onSelectCategory: (costCode: string) => void;
}

export function CostChart({ categories, onSelectCategory }: CostChartProps) {
  const data = categories
    .filter((c) => c.current > 0)
    .map((c) => ({
      name: c.label,
      costCode: c.costCode,
      spent: c.spent,
      remaining: c.remaining,
      potential: c.potential,
    }));

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 100, right: 20 }}>
          <XAxis
            type="number"
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            fontSize={11}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={90}
            fontSize={11}
            tick={{ fill: '#374151' }}
          />
          <Tooltip
            formatter={(value: number, name: string) => [formatCurrency(value), name]}
            labelStyle={{ fontWeight: 600 }}
          />
          <Bar
            dataKey="spent"
            stackId="a"
            fill={CHART_COLORS.actual}
            name="Spent"
            cursor="pointer"
            onClick={(d) => d && onSelectCategory(d.costCode)}
          />
          <Bar
            dataKey="remaining"
            stackId="a"
            fill={CHART_COLORS.remaining}
            name="Remaining"
            cursor="pointer"
            onClick={(d) => d && onSelectCategory(d.costCode)}
          />
          <Bar dataKey="potential" stackId="a" name="Potential" cursor="pointer" onClick={(d) => d && onSelectCategory(d.costCode)}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.potential > 0 ? CHART_COLORS.potential : 'transparent'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
