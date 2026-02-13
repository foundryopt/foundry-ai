'use client';

import { TabBar } from '@/components/shell/TabBar';
import { ContextStrip } from '@/components/shell/ContextStrip';
import { useActiveView } from '@/hooks/useActiveView';
import { useProject } from '@/hooks/useProject';
import { PROJECTS } from '@/data';
import { useProjectData } from '@/hooks/useProjectData';
import { AttentionToday } from '@/components/views/AttentionToday';
import { WhatsRepeating } from '@/components/views/WhatsRepeating';
import { ProcurementDelivery } from '@/components/views/ProcurementDelivery';
import { CriticalPath } from '@/components/views/CriticalPath';
import { BudgetDetail } from '@/components/views/BudgetDetail';
import { QAQC } from '@/components/views/QAQC';
import { WarrantyTracker } from '@/components/views/WarrantyTracker';
import { DesignSelections } from '@/components/views/DesignSelections';
import { Development } from '@/components/views/Development';
import { Fund } from '@/components/views/Fund';
import { SalesShowroom } from '@/components/views/SalesShowroom';
import { TaktPlanning } from '@/components/views/TaktPlanning';

export default function DashboardPage() {
  const { view, setView } = useActiveView();
  const { projectId, isAll } = useProject();
  const { data, loading } = useProjectData(projectId);

  if (loading) {
    return (
      <>
        <TabBar active={view} onChange={setView} />
        <div className="flex items-center justify-center py-20 text-sm text-gray-400">
          Loading project data...
        </div>
      </>
    );
  }

  return (
    <>
      <TabBar active={view} onChange={setView} />
      <ContextStrip budget={data.budget} schedule={data.schedule} quality={data.quality} />

      {view === 0 && <AttentionToday tasks={data.tasks} projects={PROJECTS} />}
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
      {view === 5 && <QAQC qaqc={data.qaqc} tasks={data.tasks} isAllProjects={isAll} />}
      {view === 6 && <WarrantyTracker warranties={data.warranties} isAllProjects={isAll} />}
      {view === 7 && <DesignSelections finishes={data.finishes} isAllProjects={isAll} />}
      {view === 8 && <Development milestones={data.devMilestones} isAllProjects={isAll} />}
      {view === 9 && <Fund fund={data.fund} isAllProjects={isAll} />}
      {view === 10 && (
        <SalesShowroom
          leasing={data.leasing}
          events={data.events}
          pos={data.pos}
          memberships={data.memberships}
        />
      )}
      {view === 11 && <TaktPlanning />}
    </>
  );
}
