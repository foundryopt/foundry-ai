'use client';

import { useMemo } from 'react';
import { TabBar } from '@/components/shell/TabBar';
import { ContextStrip } from '@/components/shell/ContextStrip';
import { useActiveView } from '@/hooks/useActiveView';
import { useProject } from '@/hooks/useProject';
import { getProjectData } from '@/data';
import { AttentionToday } from '@/components/views/AttentionToday';
import { WhatsRepeating } from '@/components/views/WhatsRepeating';
import { ProcurementDelivery } from '@/components/views/ProcurementDelivery';
import { CriticalPath } from '@/components/views/CriticalPath';
import { BudgetDetail } from '@/components/views/BudgetDetail';

export default function DashboardPage() {
  const { view, setView } = useActiveView();
  const { projectId, isAll } = useProject();

  const data = useMemo(() => getProjectData(projectId), [projectId]);

  return (
    <>
      <TabBar active={view} onChange={setView} />
      <ContextStrip budget={data.budget} schedule={data.schedule} quality={data.quality} />

      {view === 0 && <AttentionToday tasks={data.tasks} />}
      {view === 1 && (
        <WhatsRepeating
          repeatBreaches={data.repeatBreaches}
          ownerLoads={data.ownerLoads}
          invoicePatterns={data.invoicePatterns}
          timesheet={data.timesheet}
        />
      )}
      {view === 2 && <ProcurementDelivery tasks={data.tasks} />}
      {view === 3 && (
        <CriticalPath criticalPath={data.criticalPath} schedule={data.schedule} />
      )}
      {view === 4 && <BudgetDetail budget={data.budget} isAllProjects={isAll} />}
    </>
  );
}
