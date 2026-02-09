import type { OpenTask } from '@/lib/types';
import { DeepLinkButton } from '@/components/ui/DeepLinkButton';

interface DetailDeepLinksProps {
  task: OpenTask;
}

export function DetailDeepLinks({ task }: DetailDeepLinksProps) {
  if (task.deepLinks.length === 0) return null;

  return (
    <div className="px-4 py-3">
      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
        Open In
      </h3>
      <div className="flex flex-wrap gap-2">
        {task.deepLinks.map((link) => (
          <DeepLinkButton key={`${link.target}-${link.label}`} link={link} />
        ))}
      </div>
    </div>
  );
}
