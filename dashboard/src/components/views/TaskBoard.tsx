'use client';

import { useEffect, useMemo, useState } from 'react';
import type { BoardStatus, BoardTask, OpenTask, TaskCategory, Urgency } from '@/lib/types';
import { BOARD_STATUS_LABELS, BOARD_STATUS_ORDER } from '@/lib/types';
import { ALL_CATEGORIES } from '@/lib/constants';
import { Column } from './board/Column';
import { AddTaskModal } from './board/AddTaskModal';

interface TaskBoardProps {
  tasks: OpenTask[];
  projectId: string;
}

function urgencyToStatus(urgency: Urgency): BoardStatus {
  switch (urgency) {
    case 'overdue': return 'blocked';
    case 'due-today': return 'in-progress';
    case 'new': return 'todo';
    case 'watching': return 'todo';
  }
}

function seedFromOpenTasks(tasks: OpenTask[]): BoardTask[] {
  return tasks.map((t) => ({
    id: t.id,
    projectId: t.projectId,
    category: t.category,
    subject: t.subject,
    owner: t.owner,
    slaDate: t.slaDate,
    createdDate: t.createdDate,
    status: urgencyToStatus(t.urgency),
    source: t.source,
    costImpact: t.costImpact,
    scheduleImpactDays: t.scheduleImpactDays,
    costCodeRef: t.costCodeRef,
  }));
}

export function TaskBoard({ tasks, projectId }: TaskBoardProps) {
  const seed = useMemo(() => seedFromOpenTasks(tasks), [tasks]);
  const [board, setBoard] = useState<BoardTask[]>(seed);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDefaultStatus, setModalDefaultStatus] = useState<BoardStatus>('todo');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<TaskCategory | 'all'>('all');

  useEffect(() => {
    setBoard(seed);
  }, [seed]);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return board.filter((t) => {
      if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
      if (s && !`${t.subject} ${t.owner} ${t.id}`.toLowerCase().includes(s)) return false;
      return true;
    });
  }, [board, search, categoryFilter]);

  const columns = useMemo(() => {
    const byStatus: Record<BoardStatus, BoardTask[]> = {
      todo: [],
      'in-progress': [],
      blocked: [],
      done: [],
    };
    for (const t of filtered) byStatus[t.status].push(t);
    return byStatus;
  }, [filtered]);

  function handleDragStart(e: React.DragEvent, taskId: string) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', taskId);
    setDraggingId(taskId);
  }

  function handleDragEnd() {
    setDraggingId(null);
  }

  function handleDrop(status: BoardStatus) {
    if (!draggingId) return;
    setBoard((prev) =>
      prev.map((t) => (t.id === draggingId ? { ...t, status } : t)),
    );
    setDraggingId(null);
  }

  function handleDelete(taskId: string) {
    setBoard((prev) => prev.filter((t) => t.id !== taskId));
  }

  function handleCreate(task: BoardTask) {
    setBoard((prev) => [task, ...prev]);
  }

  function openAdd(status: BoardStatus) {
    setModalDefaultStatus(status);
    setModalOpen(true);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Task Board</h2>
          <p className="text-xs text-gray-500">
            Drag to move · {board.length} task{board.length === 1 ? '' : 's'} · local-only (resets on reload)
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-48"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as TaskCategory | 'all')}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="all">All categories</option>
            {ALL_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => openAdd('todo')}
            className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
          >
            + New Task
          </button>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4">
        {BOARD_STATUS_ORDER.map((status) => (
          <Column
            key={status}
            status={status}
            label={BOARD_STATUS_LABELS[status]}
            tasks={columns[status]}
            draggingId={draggingId}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDrop={handleDrop}
            onDelete={handleDelete}
            onAddInColumn={openAdd}
          />
        ))}
      </div>

      <AddTaskModal
        open={modalOpen}
        defaultStatus={modalDefaultStatus}
        projectId={projectId}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreate}
      />
    </div>
  );
}
