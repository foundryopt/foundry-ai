import type { OpenTask } from '@/lib/types';
import { CategoryTag } from '@/components/ui/CategoryTag';

interface DetailRelatedProps {
  task: OpenTask;
  allTasks: OpenTask[];
  onSelectTask: (id: string) => void;
}

export function DetailRelated({ task, allTasks, onSelectTask }: DetailRelatedProps) {
  if (!task.relatedTaskIds || task.relatedTaskIds.length === 0) return null;

  const related = task.relatedTaskIds
    .map((id) => allTasks.find((t) => t.id === id))
    .filter(Boolean) as OpenTask[];

  if (related.length === 0) return null;

  return (
    <div className="px-4 py-3 border-b border-gray-100">
      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
        Related Tasks
      </h3>
      <div className="space-y-1.5">
        {related.map((r) => (
          <button
            key={r.id}
            onClick={() => onSelectTask(r.id)}
            className="w-full text-left flex items-center gap-2 p-2 rounded hover:bg-gray-50 text-xs"
          >
            <CategoryTag category={r.category} />
            <span className="font-mono text-gray-400">{r.id}</span>
            <span className="text-gray-700 truncate">{r.subject}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
