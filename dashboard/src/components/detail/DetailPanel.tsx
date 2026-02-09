'use client';

import { useEffect } from 'react';
import clsx from 'clsx';
import type { OpenTask } from '@/lib/types';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { DetailHeader } from './DetailHeader';
import { DetailTimeline } from './DetailTimeline';
import { DetailFields } from './DetailFields';
import { DetailRelated } from './DetailRelated';
import { DetailDeepLinks } from './DetailDeepLinks';

interface DetailPanelProps {
  task: OpenTask | null;
  allTasks: OpenTask[];
  onClose: () => void;
  onSelectTask: (id: string) => void;
}

export function DetailPanel({ task, allTasks, onClose, onSelectTask }: DetailPanelProps) {
  const isDesktop = useIsDesktop();

  // Trap body scroll on mobile when panel is open
  useEffect(() => {
    if (task && !isDesktop) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [task, isDesktop]);

  if (!task) return null;

  return (
    <>
      {/* Backdrop (mobile) */}
      {!isDesktop && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={clsx(
          'bg-white border-l border-gray-200 overflow-y-auto scrollbar-thin z-50',
          isDesktop
            ? 'w-[420px] shrink-0'
            : 'fixed inset-y-0 right-0 w-full max-w-md shadow-xl',
        )}
      >
        <DetailHeader task={task} onClose={onClose} />
        <DetailTimeline task={task} />
        <DetailFields detail={task.detail} />
        <DetailRelated task={task} allTasks={allTasks} onSelectTask={onSelectTask} />
        <DetailDeepLinks task={task} />
      </div>
    </>
  );
}
