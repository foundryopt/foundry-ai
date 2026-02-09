'use client';

import type { OpenTask, Urgency } from '@/lib/types';
import { URGENCY_COLORS, URGENCY_LABELS } from '@/lib/constants';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { TaskCard } from './TaskCard';

interface UrgencyGroupProps {
  urgency: Urgency;
  tasks: OpenTask[];
  onSelectTask: (taskId: string) => void;
}

export function UrgencyGroup({ urgency, tasks, onSelectTask }: UrgencyGroupProps) {
  if (tasks.length === 0) return null;

  return (
    <SectionHeader
      title={URGENCY_LABELS[urgency]}
      count={tasks.length}
      colorClass={URGENCY_COLORS[urgency].text}
    >
      <div className="grid gap-2 pb-4">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onSelect={onSelectTask} />
        ))}
      </div>
    </SectionHeader>
  );
}
