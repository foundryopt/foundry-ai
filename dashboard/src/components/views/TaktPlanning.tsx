'use client';

import { useState, useMemo } from 'react';
import clsx from 'clsx';
import type { CriticalPathData, ScheduleSummary } from '@/lib/types';
import { SteeringBoard, type Sub, type TaktTask, type Milestone } from './takt/SteeringBoard';
import { FlowCharts } from './takt/FlowCharts';
import { Reference } from './takt/Reference';
import { HuddleBoard } from './takt/HuddleBoard';
import { Roadblocks, type Roadblock } from './takt/Roadblocks';
import { Handoffs } from './takt/Handoffs';
import { Deliveries } from './takt/Deliveries';
import { PPCMetrics } from './takt/PPCMetrics';
import { PlusDelta } from './takt/PlusDelta';
import { Permits } from './takt/Permits';
import { Production } from './takt/Production';
import { CriticalPath } from './CriticalPath';

// ── Sub-tab definitions ──

type TaktSubTab =
  | 'steering'
  | 'critical-path'
  | 'flowcharts'
  | 'reference'
  | 'huddle'
  | 'roadblocks'
  | 'handoffs'
  | 'deliveries'
  | 'ppc'
  | 'plusdelta'
  | 'permits'
  | 'production';

const SUB_TAB_LABELS: { key: TaktSubTab; label: string }[] = [
  { key: 'steering', label: 'Steering Board' },
  { key: 'critical-path', label: 'Critical Path' },
  { key: 'flowcharts', label: 'Flow Charts' },
  { key: 'reference', label: 'Reference' },
  { key: 'huddle', label: 'Huddle Board' },
  { key: 'roadblocks', label: 'Roadblocks' },
  { key: 'handoffs', label: 'Handoffs' },
  { key: 'deliveries', label: 'Deliveries' },
  { key: 'ppc', label: 'PPC Metrics' },
  { key: 'plusdelta', label: 'Plus/Delta' },
  { key: 'permits', label: 'Permits' },
  { key: 'production', label: 'Production' },
];

// ── Shared mock data ──

const INITIAL_SUBS: Sub[] = [
  { name: 'Apex Framing', abbrev: 'AF', color: '#2563eb', trade: 'Framing' },
  { name: 'Summit Plumbing', abbrev: 'SP', color: '#16a34a', trade: 'Plumbing' },
  { name: 'Volt Electric', abbrev: 'VE', color: '#f59e0b', trade: 'Electrical' },
  { name: 'AirFlow HVAC', abbrev: 'AH', color: '#7c3aed', trade: 'HVAC' },
  { name: 'Shield Fire', abbrev: 'SF', color: '#dc2626', trade: 'Fire Protection' },
  { name: 'Core Concrete', abbrev: 'CC', color: '#6b7280', trade: 'Concrete' },
  { name: 'TrueLevel Drywall', abbrev: 'TD', color: '#0891b2', trade: 'Drywall' },
  { name: 'FineLine Paint', abbrev: 'FP', color: '#db2777', trade: 'Paint' },
  { name: 'SteelWorks', abbrev: 'SW', color: '#4b5563', trade: 'Structural Steel' },
  { name: 'ProTile', abbrev: 'PT', color: '#059669', trade: 'Tile & Flooring' },
  { name: 'GlassCraft', abbrev: 'GC', color: '#0284c7', trade: 'Glazing' },
  { name: 'RoofTop', abbrev: 'RT', color: '#92400e', trade: 'Roofing' },
  { name: 'LandForm', abbrev: 'LF', color: '#15803d', trade: 'Landscaping' },
  { name: 'CleanSweep', abbrev: 'CS', color: '#64748b', trade: 'Cleanup' },
];

const ZONES = ['Zone A', 'Zone B', 'Zone C', 'Zone D'];
const TOTAL_DAYS = 14;

const SEED_TASKS: TaktTask[] = [
  { id: 't1', sub: 'AF', zone: 'Zone A', day: 1, duration: 2, status: 'done' },
  { id: 't2', sub: 'SP', zone: 'Zone A', day: 3, duration: 2, status: 'done' },
  { id: 't3', sub: 'VE', zone: 'Zone A', day: 5, duration: 2, status: 'active' },
  { id: 't4', sub: 'AH', zone: 'Zone A', day: 7, duration: 2, status: 'planned' },
  { id: 't5', sub: 'AF', zone: 'Zone B', day: 3, duration: 2, status: 'done' },
  { id: 't6', sub: 'SP', zone: 'Zone B', day: 5, duration: 2, status: 'active' },
  { id: 't7', sub: 'VE', zone: 'Zone B', day: 7, duration: 2, status: 'planned' },
  { id: 't8', sub: 'AH', zone: 'Zone B', day: 9, duration: 2, status: 'planned' },
  { id: 't9', sub: 'AF', zone: 'Zone C', day: 5, duration: 2, status: 'active' },
  { id: 't10', sub: 'SP', zone: 'Zone C', day: 7, duration: 2, status: 'planned' },
  { id: 't11', sub: 'VE', zone: 'Zone C', day: 9, duration: 2, status: 'planned' },
  { id: 't12', sub: 'AF', zone: 'Zone D', day: 7, duration: 2, status: 'planned' },
  { id: 't13', sub: 'SP', zone: 'Zone D', day: 9, duration: 2, status: 'planned' },
  { id: 't14', sub: 'TD', zone: 'Zone A', day: 9, duration: 3, status: 'planned' },
  { id: 't15', sub: 'FP', zone: 'Zone A', day: 12, duration: 2, status: 'planned' },
];

const SEED_MILESTONES: Milestone[] = [
  { id: 'm1', label: 'Rough-in Complete', day: 8, zone: 'Zone A' },
  { id: 'm2', label: 'Framing Inspection', day: 4, zone: 'Zone B' },
  { id: 'm3', label: 'Drywall Start', day: 9, zone: 'Zone A' },
];

const SEED_ROADBLOCKS: Roadblock[] = [
  { id: 'rb1', description: 'Plumbing inspection hold — inspector unavailable until Thursday', zone: 'Zone C', trade: 'Plumbing', severity: 'critical', status: 'open', owner: 'L. Nguyen', created: '2026-02-12' },
  { id: 'rb2', description: 'Fire sprinkler heads backordered — supplier delay', zone: 'Zone B', trade: 'Fire Protection', severity: 'high', status: 'in-progress', owner: 'R. Patel', created: '2026-02-11' },
  { id: 'rb3', description: 'Drywall delivery truck access blocked by crane placement', zone: 'Zone A', trade: 'Drywall', severity: 'medium', status: 'open', owner: 'J. Martinez', created: '2026-02-13' },
  { id: 'rb4', description: 'Missing structural drawing revision for Zone D beam connections', zone: 'Zone D', trade: 'Structural Steel', severity: 'high', status: 'open', owner: 'S. Kim', created: '2026-02-10' },
  { id: 'rb5', description: 'RFI #42 response pending from architect — window header detail', zone: 'Zone B', trade: 'Framing', severity: 'medium', status: 'resolved', owner: 'T. Johnson', created: '2026-02-08', resolved: '2026-02-12' },
];

// ── Modals ──

function EditTaskModal({
  task,
  subs,
  onSave,
  onClose,
}: {
  task: TaktTask;
  subs: Sub[];
  onSave: (updated: TaktTask) => void;
  onClose: () => void;
}) {
  const [status, setStatus] = useState(task.status);
  const [day, setDay] = useState(task.day);
  const [duration, setDuration] = useState(task.duration);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Task</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sub-Contractor</label>
            <div className="text-sm text-gray-800">
              {subs.find((s) => s.abbrev === task.sub)?.name ?? task.sub} ({task.sub})
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Zone</label>
            <div className="text-sm text-gray-800">{task.zone}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Day</label>
            <input
              type="number"
              min={1}
              value={day}
              onChange={(e) => setDay(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (days)</label>
            <input
              type="number"
              min={1}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaktTask['status'])}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="planned">Planned</option>
              <option value="active">Active</option>
              <option value="done">Done</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave({ ...task, status, day, duration })}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function AddMilestoneModal({
  zones,
  onSave,
  onClose,
}: {
  zones: string[];
  onSave: (ms: Milestone) => void;
  onClose: () => void;
}) {
  const [label, setLabel] = useState('');
  const [day, setDay] = useState(1);
  const [zone, setZone] = useState(zones[0]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Milestone</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Milestone name..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
            <input
              type="number"
              min={1}
              value={day}
              onChange={(e) => setDay(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Zone</label>
            <select
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {zones.map((z) => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (!label.trim()) return;
              onSave({ id: `m${Date.now()}`, label: label.trim(), day, zone });
            }}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

function AddRoadblockModal({
  zones,
  subs,
  onSave,
  onClose,
}: {
  zones: string[];
  subs: Sub[];
  onSave: (rb: Roadblock) => void;
  onClose: () => void;
}) {
  const [description, setDescription] = useState('');
  const [zone, setZone] = useState(zones[0]);
  const [trade, setTrade] = useState(subs[0].trade);
  const [severity, setSeverity] = useState<Roadblock['severity']>('medium');
  const [owner, setOwner] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Roadblock</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the roadblock..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Zone</label>
              <select
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {zones.map((z) => (
                  <option key={z} value={z}>{z}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trade</label>
              <select
                value={trade}
                onChange={(e) => setTrade(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {subs.map((s) => (
                  <option key={s.abbrev} value={s.trade}>{s.trade}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as Roadblock['severity'])}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
              <input
                type="text"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                placeholder="Name..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (!description.trim()) return;
              onSave({
                id: `rb${Date.now()}`,
                description: description.trim(),
                zone,
                trade,
                severity,
                status: 'open',
                owner: owner.trim() || 'Unassigned',
                created: new Date().toISOString().split('T')[0],
              });
            }}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ──

interface TaktPlanningProps {
  criticalPath: CriticalPathData;
  schedule: ScheduleSummary;
}

export function TaktPlanning({ criticalPath, schedule }: TaktPlanningProps) {
  const [activeTab, setActiveTab] = useState<TaktSubTab>('steering');

  // Shared state
  const [subs, setSubs] = useState<Sub[]>(INITIAL_SUBS);
  const [tasks, setTasks] = useState<TaktTask[]>(SEED_TASKS);
  const [milestones, setMilestones] = useState<Milestone[]>(SEED_MILESTONES);
  const [roadblocks, setRoadblocks] = useState<Roadblock[]>(SEED_ROADBLOCKS);

  // Modal state
  const [editingTask, setEditingTask] = useState<TaktTask | null>(null);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [showRoadblockModal, setShowRoadblockModal] = useState(false);

  // Summary metrics
  const summaryMetrics = useMemo(() => {
    // Active Zones — zones that have at least 1 active task
    const activeZones = new Set(
      tasks.filter((t) => t.status === 'active').map((t) => t.zone)
    ).size;

    // Task status counts
    const done = tasks.filter((t) => t.status === 'done').length;
    const active = tasks.filter((t) => t.status === 'active').length;
    const planned = tasks.filter((t) => t.status === 'planned').length;
    const blocked = tasks.filter((t) => t.status === 'blocked').length;

    // Open roadblocks
    const openRoadblocks = roadblocks.filter((r) => r.status !== 'resolved').length;

    // PPC — hard-coded to match PPCMetrics: 148/168 = 88%
    const ppcPercent = 88;

    // Active subs — unique subs that have tasks assigned
    const activeSubs = new Set(tasks.map((t) => t.sub)).size;

    return { activeZones, done, active, planned, blocked, openRoadblocks, ppcPercent, activeSubs };
  }, [tasks, roadblocks]);

  const ppcColorClass =
    summaryMetrics.ppcPercent >= 85
      ? 'text-green-600'
      : summaryMetrics.ppcPercent >= 70
        ? 'text-yellow-600'
        : 'text-red-600';

  const roadblockColorClass =
    summaryMetrics.openRoadblocks > 0 ? 'text-red-600' : 'text-green-600';

  // Handlers
  const handleTaskDrop = (taskId: string, zone: string, day: number) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, zone, day } : t))
    );
  };

  const handleTaskSave = (updated: TaktTask) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setEditingTask(null);
  };

  const handleMilestoneSave = (ms: Milestone) => {
    setMilestones((prev) => [...prev, ms]);
    setShowMilestoneModal(false);
  };

  const handleRoadblockUpdate = (id: string, status: Roadblock['status']) => {
    setRoadblocks((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status, resolved: status === 'resolved' ? new Date().toISOString().split('T')[0] : r.resolved }
          : r
      )
    );
  };

  const handleRoadblockAdd = (rb: Roadblock) => {
    setRoadblocks((prev) => [rb, ...prev]);
    setShowRoadblockModal(false);
  };

  const handleAddSub = (sub: Sub) => {
    setSubs((prev) => [...prev, sub]);
  };

  return (
    <div className="space-y-6">
      {/* Sub-tab Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {SUB_TAB_LABELS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={clsx(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
              activeTab === key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Summary Overview Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-3 text-center">
          <div className="text-2xl font-bold text-gray-900">{summaryMetrics.activeZones}</div>
          <div className="text-xs text-gray-500 mt-0.5">Active Zones</div>
        </div>
        <div className="bg-white rounded-lg shadow border border-gray-200 p-3 text-center">
          <div className="text-2xl font-bold text-gray-900">
            {summaryMetrics.done}/{summaryMetrics.active}/{summaryMetrics.planned}/{summaryMetrics.blocked}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">Done / Active / Planned / Blocked</div>
        </div>
        <div className="bg-white rounded-lg shadow border border-gray-200 p-3 text-center">
          <div className={`text-2xl font-bold ${roadblockColorClass}`}>{summaryMetrics.openRoadblocks}</div>
          <div className="text-xs text-gray-500 mt-0.5">Open Roadblocks</div>
        </div>
        <div className="bg-white rounded-lg shadow border border-gray-200 p-3 text-center">
          <div className={`text-2xl font-bold ${ppcColorClass}`}>{summaryMetrics.ppcPercent}%</div>
          <div className="text-xs text-gray-500 mt-0.5">PPC</div>
        </div>
        <div className="bg-white rounded-lg shadow border border-gray-200 p-3 text-center">
          <div className="text-2xl font-bold text-gray-900">{summaryMetrics.activeSubs}</div>
          <div className="text-xs text-gray-500 mt-0.5">Active Subs</div>
        </div>
      </div>

      {/* Sub-tab Content */}
      {activeTab === 'steering' && (
        <SteeringBoard
          subs={subs}
          zones={ZONES}
          days={TOTAL_DAYS}
          tasks={tasks}
          milestones={milestones}
          onTaskDrop={handleTaskDrop}
          onTaskClick={setEditingTask}
          onAddMilestone={() => setShowMilestoneModal(true)}
          onAddSub={handleAddSub}
        />
      )}
      {activeTab === 'critical-path' && (
        <CriticalPath criticalPath={criticalPath} schedule={schedule} />
      )}
      {activeTab === 'flowcharts' && <FlowCharts />}
      {activeTab === 'reference' && <Reference />}
      {activeTab === 'huddle' && <HuddleBoard />}
      {activeTab === 'roadblocks' && (
        <Roadblocks
          roadblocks={roadblocks}
          onUpdate={handleRoadblockUpdate}
          onAdd={() => setShowRoadblockModal(true)}
        />
      )}
      {activeTab === 'handoffs' && <Handoffs />}
      {activeTab === 'deliveries' && <Deliveries />}
      {activeTab === 'ppc' && <PPCMetrics />}
      {activeTab === 'plusdelta' && <PlusDelta />}
      {activeTab === 'permits' && <Permits />}
      {activeTab === 'production' && <Production />}

      {/* Modals */}
      {editingTask && (
        <EditTaskModal
          task={editingTask}
          subs={subs}
          onSave={handleTaskSave}
          onClose={() => setEditingTask(null)}
        />
      )}
      {showMilestoneModal && (
        <AddMilestoneModal
          zones={ZONES}
          onSave={handleMilestoneSave}
          onClose={() => setShowMilestoneModal(false)}
        />
      )}
      {showRoadblockModal && (
        <AddRoadblockModal
          zones={ZONES}
          subs={subs}
          onSave={handleRoadblockAdd}
          onClose={() => setShowRoadblockModal(false)}
        />
      )}
    </div>
  );
}
