'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import type { BudgetSummary, ScheduleSummary, QualitySummary } from '@/lib/types';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { CostDrillDown } from '@/components/charts/CostDrillDown';
import { TimeDrillDown } from '@/components/charts/TimeDrillDown';
import { QualityDrillDown } from '@/components/charts/QualityDrillDown';

// Dynamic import for Recharts-based component to avoid SSR issues
const CostChart = dynamic(
  () => import('@/components/charts/CostChart').then((m) => m.CostChart),
  { ssr: false },
);

interface CostTimeQualityProps {
  budget: BudgetSummary;
  schedule: ScheduleSummary;
  quality: QualitySummary;
}

export function CostTimeQuality({ budget, schedule, quality }: CostTimeQualityProps) {
  const [selectedCostCode, setSelectedCostCode] = useState<string | null>(null);
  const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>(null);
  const [selectedDocType, setSelectedDocType] = useState<string | null>(null);

  const selectedCategory = selectedCostCode
    ? budget.categories.find((c) => c.costCode === selectedCostCode) ?? null
    : null;

  const selectedPhase = selectedPhaseId
    ? schedule.phases.find((p) => p.id === selectedPhaseId) ?? null
    : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
      {/* ── Cost Section ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Cost</h2>
          <div className="text-right text-xs">
            <p className="text-gray-500">
              {formatCurrency(budget.totalSpent)} of {formatCurrency(budget.currentBudget)}
            </p>
            <p className="text-gray-700 font-semibold">{formatPercent(budget.percentSpent)} spent</p>
            {budget.totalPotential > 0 && (
              <p className="text-amber-600">+{formatCurrency(budget.totalPotential)} potential</p>
            )}
          </div>
        </div>

        <CostChart
          categories={budget.categories}
          onSelectCategory={setSelectedCostCode}
        />

        {selectedCategory && (
          <div className="mt-4">
            <CostDrillDown
              category={selectedCategory}
              onClose={() => setSelectedCostCode(null)}
            />
          </div>
        )}
      </section>

      {/* ── Time Section ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Time</h2>
          <div className="text-right text-xs">
            <p className="text-gray-500">{schedule.totalPhases} phases</p>
          </div>
        </div>

        {/* TimeChart is CSS-only, no Recharts needed */}
        <TimeChartSection
          schedule={schedule}
          selectedPhaseId={selectedPhaseId}
          onSelectPhase={setSelectedPhaseId}
        />

        {selectedPhase && (
          <div className="mt-4">
            <TimeDrillDown
              phase={selectedPhase}
              onClose={() => setSelectedPhaseId(null)}
            />
          </div>
        )}
      </section>

      {/* ── Quality Section ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Quality</h2>
          <div className="text-right text-xs">
            <p className="text-gray-500">{quality.totalDocuments} documents</p>
            <p className="text-gray-700 font-semibold">{formatPercent(quality.percentCurrent)} current</p>
          </div>
        </div>

        <QualityChartSection
          quality={quality}
          selectedDocType={selectedDocType}
          onSelectType={setSelectedDocType}
        />

        {selectedDocType && (
          <div className="mt-4">
            <QualityDrillDown
              quality={quality}
              selectedType={selectedDocType}
              onClose={() => setSelectedDocType(null)}
            />
          </div>
        )}
      </section>
    </div>
  );
}

// Inline wrappers to lazily import non-Recharts chart components
function TimeChartSection({
  schedule,
  selectedPhaseId,
  onSelectPhase,
}: {
  schedule: ScheduleSummary;
  selectedPhaseId: string | null;
  onSelectPhase: (id: string) => void;
}) {
  // TimeChart doesn't use Recharts, import directly
  const { TimeChart } = require('@/components/charts/TimeChart');
  return <TimeChart phases={schedule.phases} onSelectPhase={onSelectPhase} />;
}

function QualityChartSection({
  quality,
  selectedDocType,
  onSelectType,
}: {
  quality: QualitySummary;
  selectedDocType: string | null;
  onSelectType: (type: string) => void;
}) {
  const { QualityChart } = require('@/components/charts/QualityChart');
  return <QualityChart quality={quality} onSelectType={onSelectType} />;
}
