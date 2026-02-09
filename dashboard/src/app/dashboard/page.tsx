'use client';

import { TabBar } from '@/components/shell/TabBar';
import { ContextStrip } from '@/components/shell/ContextStrip';
import { useActiveView } from '@/hooks/useActiveView';
import { AttentionToday } from '@/components/views/AttentionToday';
import { WhatsRepeating } from '@/components/views/WhatsRepeating';
import { ProcurementDelivery } from '@/components/views/ProcurementDelivery';
import { CostTimeQuality } from '@/components/views/CostTimeQuality';
import { TASKS, BUDGET, SCHEDULE, QUALITY, REPEAT_BREACHES, OWNER_LOADS, INVOICE_PATTERNS } from '@/data';

export default function DashboardPage() {
  const { view, setView } = useActiveView();

  return (
    <>
      <TabBar active={view} onChange={setView} />
      <ContextStrip />

      {view === 0 && <AttentionToday tasks={TASKS} />}
      {view === 1 && (
        <WhatsRepeating
          repeatBreaches={REPEAT_BREACHES}
          ownerLoads={OWNER_LOADS}
          invoicePatterns={INVOICE_PATTERNS}
        />
      )}
      {view === 2 && <ProcurementDelivery tasks={TASKS} />}
      {view === 3 && (
        <CostTimeQuality budget={BUDGET} schedule={SCHEDULE} quality={QUALITY} />
      )}
    </>
  );
}
