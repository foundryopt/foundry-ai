'use client';

import { useState, useMemo } from 'react';
import clsx from 'clsx';
import type { DevMilestone, DevPhase } from '@/lib/types';
import { formatDate } from '@/lib/utils';

/* ── Props ── */

interface DevelopmentProps {
  milestones: DevMilestone[];
  isAllProjects: boolean;
}

/* ── Constants ── */

const DEV_PHASES: DevPhase[] = [
  'Site Acquisition',
  'Entitlement',
  'Design',
  'Permitting',
  'Pre-Construction',
  'Construction',
  'Lease-Up',
  'Stabilization',
];

const STATUS_COLORS = {
  completed: { bg: 'bg-green-500', text: 'text-green-700', light: 'bg-green-100', badge: 'bg-green-100 text-green-700' },
  'in-progress': { bg: 'bg-blue-500', text: 'text-blue-700', light: 'bg-blue-100', badge: 'bg-blue-100 text-blue-700' },
  upcoming: { bg: 'bg-gray-300', text: 'text-gray-500', light: 'bg-gray-100', badge: 'bg-gray-100 text-gray-500' },
  'at-risk': { bg: 'bg-red-500', text: 'text-red-700', light: 'bg-red-100', badge: 'bg-red-100 text-red-700' },
} as const;

const STATUS_LABELS: Record<string, string> = {
  completed: 'Completed',
  'in-progress': 'In Progress',
  upcoming: 'Upcoming',
  'at-risk': 'At Risk',
};

/* ── Inline icons ── */

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4l4 4-4 4" />
    </svg>
  );
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6l4 4 4-4" />
    </svg>
  );
}

/* ── Helpers ── */

/** Derive the overall status for a phase from its milestones */
function derivePhaseStatus(phaseMilestones: DevMilestone[]): DevMilestone['status'] {
  if (phaseMilestones.length === 0) return 'upcoming';
  if (phaseMilestones.some((m) => m.status === 'at-risk')) return 'at-risk';
  if (phaseMilestones.every((m) => m.status === 'completed')) return 'completed';
  if (phaseMilestones.some((m) => m.status === 'in-progress')) return 'in-progress';
  return 'upcoming';
}

/** Find the earliest target date among milestones in a phase */
function phaseTargetDate(phaseMilestones: DevMilestone[]): string | null {
  if (phaseMilestones.length === 0) return null;
  const sorted = [...phaseMilestones].sort(
    (a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime(),
  );
  return sorted[0].targetDate;
}

/**
 * Extract a project key from the milestone id.
 * Convention: ids are prefixed like "sb-dev-001" or "gf-dev-002".
 * Falls back to "Unknown Project" if no prefix pattern is found.
 */
function extractProjectKey(id: string): string {
  const prefix = id.split('-')[0];
  return prefix || 'default';
}

const PROJECT_KEY_LABELS: Record<string, string> = {
  sb: 'SandBox -- Mixed-Use Development',
  gf: 'Greenfield -- Residential',
};

function projectLabel(key: string): string {
  return PROJECT_KEY_LABELS[key] ?? `Project: ${key}`;
}

/* ── Pipeline Strip ── */

function PipelineStrip({ milestones }: { milestones: DevMilestone[] }) {
  const milestonesByPhase = useMemo(() => {
    const map = new Map<DevPhase, DevMilestone[]>();
    for (const phase of DEV_PHASES) map.set(phase, []);
    for (const m of milestones) {
      const list = map.get(m.phase);
      if (list) list.push(m);
    }
    return map;
  }, [milestones]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Development Pipeline</h3>
      <div className="flex gap-1">
        {DEV_PHASES.map((phase, i) => {
          const phaseMilestones = milestonesByPhase.get(phase) ?? [];
          const status = derivePhaseStatus(phaseMilestones);
          const colors = STATUS_COLORS[status];
          const target = phaseTargetDate(phaseMilestones);

          return (
            <div key={phase} className="flex-1 min-w-0 relative">
              {/* Phase bar */}
              <div className={clsx('h-8 rounded flex items-center justify-center px-1', colors.bg)}>
                <span className="text-white text-[10px] font-semibold truncate">{phase}</span>
              </div>
              {/* Arrow connector (except last) */}
              {i < DEV_PHASES.length - 1 && (
                <div className="absolute top-3 -right-1 z-10 text-gray-300">
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
                    <path d="M0 0l4 4-4 4z" />
                  </svg>
                </div>
              )}
              {/* Target date */}
              <div className="mt-1 text-center">
                {target ? (
                  <span className="text-[10px] text-gray-500 block leading-tight">
                    {formatDate(target).replace(/, \d{4}$/, '')}
                  </span>
                ) : (
                  <span className="text-[10px] text-gray-300 block leading-tight">--</span>
                )}
                <span className={clsx('text-[10px] font-semibold', colors.text)}>
                  {STATUS_LABELS[status]}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Milestone Table ── */

function MilestoneTable({ milestones }: { milestones: DevMilestone[] }) {
  // Sort milestones by phase order, then by target date
  const sorted = useMemo(() => {
    return [...milestones].sort((a, b) => {
      const phaseA = DEV_PHASES.indexOf(a.phase);
      const phaseB = DEV_PHASES.indexOf(b.phase);
      if (phaseA !== phaseB) return phaseA - phaseB;
      return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
    });
  }, [milestones]);

  if (sorted.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-sm text-gray-400">
        No milestones to display.
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Phase</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Milestone</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Target Date</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Owner</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sorted.map((m) => {
              const colors = STATUS_COLORS[m.status];
              return (
                <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-2.5 text-xs font-medium text-gray-700 whitespace-nowrap">{m.phase}</td>
                  <td className="px-4 py-2.5 text-xs text-gray-800">{m.label}</td>
                  <td className="px-4 py-2.5 text-xs text-gray-600 whitespace-nowrap">{formatDate(m.targetDate)}</td>
                  <td className="px-4 py-2.5">
                    <span className={clsx('inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full', colors.badge)}>
                      {STATUS_LABELS[m.status]}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-gray-600">{m.owner}</td>
                  <td className="px-4 py-2.5 text-xs text-gray-500 max-w-xs truncate">{m.notes ?? '--'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Gantt Chart ── */

/** Timeline boundaries for the Gantt chart (Q1 2025 through Q2 2028) */
const GANTT_START = new Date('2025-01-01');
const GANTT_END   = new Date('2028-07-01');
const GANTT_TOTAL_MS = GANTT_END.getTime() - GANTT_START.getTime();

/** Build year/quarter markers for the Gantt header */
function buildQuarters(): { label: string; yearLabel: string; startMs: number; endMs: number; isQ1: boolean }[] {
  const quarters: { label: string; yearLabel: string; startMs: number; endMs: number; isQ1: boolean }[] = [];
  for (let year = 2025; year <= 2028; year++) {
    for (let q = 0; q < 4; q++) {
      const qStart = new Date(year, q * 3, 1);
      const qEnd   = new Date(year, (q + 1) * 3, 1);
      if (qStart.getTime() >= GANTT_END.getTime()) break;
      if (qEnd.getTime() <= GANTT_START.getTime()) continue;
      quarters.push({
        label: `Q${q + 1}`,
        yearLabel: String(year),
        startMs: Math.max(qStart.getTime(), GANTT_START.getTime()),
        endMs:   Math.min(qEnd.getTime(), GANTT_END.getTime()),
        isQ1: q === 0,
      });
    }
  }
  return quarters;
}

const GANTT_QUARTERS = buildQuarters();

/** Bar colors mapping status to Tailwind bg classes for the Gantt bars */
const GANTT_BAR_COLORS: Record<string, string> = {
  completed:     'bg-green-500',
  'in-progress': 'bg-blue-500',
  upcoming:      'bg-gray-300',
  'at-risk':     'bg-red-500',
};

/** Darker hover variants for interactivity */
const GANTT_BAR_HOVER: Record<string, string> = {
  completed:     'hover:bg-green-600',
  'in-progress': 'hover:bg-blue-600',
  upcoming:      'hover:bg-gray-400',
  'at-risk':     'hover:bg-red-600',
};

interface PhaseBar {
  phase: DevPhase;
  status: DevMilestone['status'];
  startDate: Date;
  endDate: Date;
  milestoneCount: number;
}

interface ProjectRow {
  key: string;
  label: string;
  phases: PhaseBar[];
}

function computeProjectRows(milestones: DevMilestone[]): ProjectRow[] {
  // Group by project key
  const projectMap = new Map<string, DevMilestone[]>();
  for (const m of milestones) {
    const key = extractProjectKey(m.id);
    if (!projectMap.has(key)) projectMap.set(key, []);
    projectMap.get(key)!.push(m);
  }

  const rows: ProjectRow[] = [];

  for (const [key, projectMilestones] of projectMap) {
    // Group milestones by phase
    const phaseMap = new Map<DevPhase, DevMilestone[]>();
    for (const m of projectMilestones) {
      if (!phaseMap.has(m.phase)) phaseMap.set(m.phase, []);
      phaseMap.get(m.phase)!.push(m);
    }

    const phases: PhaseBar[] = [];
    // Walk DEV_PHASES in order to derive start/end per phase
    let previousEnd: Date | null = null;

    for (const phase of DEV_PHASES) {
      const phaseMilestones = phaseMap.get(phase);
      if (!phaseMilestones || phaseMilestones.length === 0) continue;

      const dates = phaseMilestones.map((m) => new Date(m.targetDate).getTime());
      const earliest = new Date(Math.min(...dates));
      const latest   = new Date(Math.max(...dates));

      // Phase start: use previous phase's end date (if any) to create a span,
      // otherwise back up 60 days from the earliest milestone as a heuristic.
      const inferredStart = previousEnd
        ? new Date(Math.min(previousEnd.getTime(), earliest.getTime()))
        : new Date(earliest.getTime() - 60 * 86_400_000);

      // Phase end: the latest milestone target date
      const phaseEnd = latest;

      phases.push({
        phase,
        status: derivePhaseStatus(phaseMilestones),
        startDate: inferredStart,
        endDate: phaseEnd,
        milestoneCount: phaseMilestones.length,
      });

      previousEnd = phaseEnd;
    }

    rows.push({
      key,
      label: projectLabel(key),
      phases,
    });
  }

  // Sort rows by earliest phase start
  rows.sort((a, b) => {
    const aStart = a.phases.length > 0 ? a.phases[0].startDate.getTime() : 0;
    const bStart = b.phases.length > 0 ? b.phases[0].startDate.getTime() : 0;
    return aStart - bStart;
  });

  return rows;
}

/** Convert a date to a percentage position on the Gantt timeline */
function dateToPercent(date: Date): number {
  const ms = date.getTime() - GANTT_START.getTime();
  return Math.max(0, Math.min(100, (ms / GANTT_TOTAL_MS) * 100));
}

/** Today-line position */
function todayPercent(): number {
  return dateToPercent(new Date());
}

function DevGantt({ milestones }: { milestones: DevMilestone[] }) {
  const rows = useMemo(() => computeProjectRows(milestones), [milestones]);
  const today = todayPercent();

  if (rows.length === 0) return null;

  // Group quarters by year for the two-row header
  const years: { year: string; startIdx: number; count: number }[] = [];
  let prevYear = '';
  for (let i = 0; i < GANTT_QUARTERS.length; i++) {
    const q = GANTT_QUARTERS[i];
    if (q.yearLabel !== prevYear) {
      years.push({ year: q.yearLabel, startIdx: i, count: 1 });
      prevYear = q.yearLabel;
    } else {
      years[years.length - 1].count++;
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 overflow-x-auto">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Development Timeline</h3>

      <div className="min-w-[700px]">
        {/* ── Header: Year row ── */}
        <div className="flex">
          {/* Label gutter */}
          <div className="w-44 shrink-0" />
          {/* Timeline area */}
          <div className="flex-1 relative flex">
            {years.map((y) => {
              const firstQ = GANTT_QUARTERS[y.startIdx];
              const lastQ  = GANTT_QUARTERS[y.startIdx + y.count - 1];
              const left   = ((firstQ.startMs - GANTT_START.getTime()) / GANTT_TOTAL_MS) * 100;
              const right  = ((lastQ.endMs - GANTT_START.getTime()) / GANTT_TOTAL_MS) * 100;
              const width  = right - left;
              return (
                <div
                  key={y.year}
                  className="text-center text-[11px] font-bold text-gray-700 border-b border-gray-300"
                  style={{ width: `${width}%`, flexShrink: 0 }}
                >
                  {y.year}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Header: Quarter row ── */}
        <div className="flex">
          <div className="w-44 shrink-0" />
          <div className="flex-1 relative flex">
            {GANTT_QUARTERS.map((q, i) => {
              const left  = ((q.startMs - GANTT_START.getTime()) / GANTT_TOTAL_MS) * 100;
              const right = ((q.endMs - GANTT_START.getTime()) / GANTT_TOTAL_MS) * 100;
              const width = right - left;
              return (
                <div
                  key={`${q.yearLabel}-${q.label}`}
                  className={clsx(
                    'text-center text-[10px] text-gray-500 border-b border-gray-200 py-0.5',
                    q.isQ1 && i > 0 && 'border-l border-l-gray-300',
                  )}
                  style={{ width: `${width}%`, flexShrink: 0 }}
                >
                  {q.label}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Project rows ── */}
        {rows.map((row) => (
          <div key={row.key} className="mt-3">
            {/* Project label */}
            <div className="flex items-center mb-1">
              <div className="w-44 shrink-0 pr-2">
                <span className="text-xs font-semibold text-gray-800 truncate block">{row.label}</span>
              </div>
            </div>

            {/* Phase bars row */}
            <div className="flex">
              <div className="w-44 shrink-0" />
              <div className="flex-1 relative h-7 bg-gray-50 rounded border border-gray-100">
                {/* Quarter grid lines */}
                {GANTT_QUARTERS.map((q) => {
                  if (!q.isQ1) return null;
                  const left = ((q.startMs - GANTT_START.getTime()) / GANTT_TOTAL_MS) * 100;
                  if (left <= 0) return null;
                  return (
                    <div
                      key={`grid-${row.key}-${q.yearLabel}`}
                      className="absolute top-0 bottom-0 border-l border-gray-200"
                      style={{ left: `${left}%` }}
                    />
                  );
                })}

                {/* Today marker */}
                {today > 0 && today < 100 && (
                  <div
                    className="absolute top-0 bottom-0 w-px bg-amber-500 z-20"
                    style={{ left: `${today}%` }}
                    title="Today"
                  />
                )}

                {/* Phase bars */}
                {row.phases.map((pb) => {
                  const left  = dateToPercent(pb.startDate);
                  const right = dateToPercent(pb.endDate);
                  const width = Math.max(right - left, 0.8); // min width so tiny phases are visible

                  return (
                    <div
                      key={`${row.key}-${pb.phase}`}
                      className={clsx(
                        'absolute top-1 bottom-1 rounded-sm flex items-center justify-center z-10 transition-colors cursor-default group',
                        GANTT_BAR_COLORS[pb.status],
                        GANTT_BAR_HOVER[pb.status],
                      )}
                      style={{ left: `${left}%`, width: `${width}%` }}
                      title={`${pb.phase} — ${STATUS_LABELS[pb.status]}\n${pb.startDate.toLocaleDateString()} – ${pb.endDate.toLocaleDateString()}`}
                    >
                      {width > 6 && (
                        <span className="text-[9px] font-semibold text-white truncate px-1 select-none">
                          {pb.phase}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}

        {/* ── Legend ── */}
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100">
          {(['completed', 'in-progress', 'upcoming', 'at-risk'] as const).map((status) => (
            <div key={status} className="flex items-center gap-1.5">
              <div className={clsx('w-3 h-3 rounded-sm', GANTT_BAR_COLORS[status])} />
              <span className="text-[10px] text-gray-600">{STATUS_LABELS[status]}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5 ml-2">
            <div className="w-3 h-px bg-amber-500" />
            <span className="text-[10px] text-gray-600">Today</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main Component ── */

export function Development({ milestones, isAllProjects }: DevelopmentProps) {
  const [collapsedProjects, setCollapsedProjects] = useState<Set<string>>(new Set());

  // Group milestones by project key when viewing all projects
  const projectGroups = useMemo(() => {
    if (!isAllProjects) return null;
    const map = new Map<string, DevMilestone[]>();
    for (const m of milestones) {
      const key = extractProjectKey(m.id);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(m);
    }
    // Sort groups by first milestone's target date
    return [...map.entries()].sort((a, b) => {
      const dateA = a[1].length > 0 ? new Date(a[1][0].targetDate).getTime() : 0;
      const dateB = b[1].length > 0 ? new Date(b[1][0].targetDate).getTime() : 0;
      return dateA - dateB;
    });
  }, [milestones, isAllProjects]);

  function toggleProject(key: string) {
    setCollapsedProjects((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <div className="max-w-[90rem] mx-auto px-4 py-6 space-y-6">
      <h2 className="text-lg font-bold text-gray-900">Development Pipeline</h2>

      {isAllProjects && projectGroups ? (
        /* ── All-Projects: grouped with collapsible headers ── */
        <div className="space-y-6">
          <DevGantt milestones={milestones} />
          {projectGroups.map(([key, groupMilestones]) => {
            const isCollapsed = collapsedProjects.has(key);
            const label = projectLabel(key);
            const statusCounts = {
              completed: groupMilestones.filter((m) => m.status === 'completed').length,
              'in-progress': groupMilestones.filter((m) => m.status === 'in-progress').length,
              'at-risk': groupMilestones.filter((m) => m.status === 'at-risk').length,
              upcoming: groupMilestones.filter((m) => m.status === 'upcoming').length,
            };

            return (
              <div key={key} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Collapsible project header */}
                <button
                  onClick={() => toggleProject(key)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    {isCollapsed ? (
                      <ChevronRight className="text-gray-400 shrink-0" />
                    ) : (
                      <ChevronDown className="text-gray-400 shrink-0" />
                    )}
                    <span className="text-sm font-semibold text-gray-800">{label}</span>
                    <span className="text-xs text-gray-400">({groupMilestones.length} milestones)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {statusCounts.completed > 0 && (
                      <span className="text-[10px] font-medium bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                        {statusCounts.completed} done
                      </span>
                    )}
                    {statusCounts['in-progress'] > 0 && (
                      <span className="text-[10px] font-medium bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">
                        {statusCounts['in-progress']} active
                      </span>
                    )}
                    {statusCounts['at-risk'] > 0 && (
                      <span className="text-[10px] font-medium bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">
                        {statusCounts['at-risk']} at risk
                      </span>
                    )}
                    {statusCounts.upcoming > 0 && (
                      <span className="text-[10px] font-medium bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
                        {statusCounts.upcoming} upcoming
                      </span>
                    )}
                  </div>
                </button>

                {/* Expandable content */}
                {!isCollapsed && (
                  <div className="p-4 space-y-4">
                    <PipelineStrip milestones={groupMilestones} />
                    <MilestoneTable milestones={groupMilestones} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* ── Single project view ── */
        <>
          <PipelineStrip milestones={milestones} />
          <DevGantt milestones={milestones} />
          <MilestoneTable milestones={milestones} />
        </>
      )}
    </div>
  );
}
