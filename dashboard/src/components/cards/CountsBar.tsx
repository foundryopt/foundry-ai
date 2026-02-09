import type { OpenTask } from '@/lib/types';

interface CountsBarProps {
  tasks: OpenTask[];
}

export function CountsBar({ tasks }: CountsBarProps) {
  const overdue = tasks.filter((t) => t.urgency === 'overdue').length;
  const dueToday = tasks.filter((t) => t.urgency === 'due-today').length;
  const newItems = tasks.filter((t) => t.urgency === 'new').length;
  const total = tasks.length;

  return (
    <div className="flex items-center gap-4 py-2 text-xs">
      <Stat label="Overdue" value={overdue} color="text-red-600 bg-red-50" />
      <Stat label="Due Today" value={dueToday} color="text-yellow-600 bg-yellow-50" />
      <Stat label="New" value={newItems} color="text-blue-600 bg-blue-50" />
      <div className="ml-auto text-gray-500 font-medium">{total} total</div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  if (value === 0) return null;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium ${color}`}>
      {value} {label}
    </span>
  );
}
