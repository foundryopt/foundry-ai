'use client';

import { useState } from 'react';
import clsx from 'clsx';

type ChartKey = 'takt' | 'lps' | 'huddle' | 'opf' | 'btl';

const CHART_LABELS: Record<ChartKey, string> = {
  takt: 'Takt Planning',
  lps: 'Last Planner System',
  huddle: 'Daily Huddle',
  opf: 'One-Piece Flow',
  btl: 'Batch-to-Lean',
};

/* ── SVG flow building helpers ── */
function Arrow({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#9ca3af" strokeWidth={2} markerEnd="url(#arrowhead)" />
    </g>
  );
}

function Box({
  x, y, w, h, label, fill = '#2563eb',
}: { x: number; y: number; w: number; h: number; label: string; fill?: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={6} fill={fill} opacity={0.85} />
      <text
        x={x + w / 2}
        y={y + h / 2 + 4}
        textAnchor="middle"
        fill="#ffffff"
        fontSize={12}
        fontWeight={600}
      >
        {label}
      </text>
    </g>
  );
}

function Diamond({ cx, cy, label }: { cx: number; cy: number; label: string }) {
  const s = 30;
  return (
    <g>
      <polygon
        points={`${cx},${cy - s} ${cx + s},${cy} ${cx},${cy + s} ${cx - s},${cy}`}
        fill="#f59e0b"
        opacity={0.85}
      />
      <text x={cx} y={cy + 4} textAnchor="middle" fill="#ffffff" fontSize={10} fontWeight={600}>
        {label}
      </text>
    </g>
  );
}

/* ── Individual charts ── */
function TaktChart() {
  return (
    <svg viewBox="0 0 700 220" className="w-full max-w-[700px]">
      <defs>
        <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#9ca3af" />
        </marker>
      </defs>
      <Box x={10} y={80} w={110} h={44} label="Define Zones" fill="#2563eb" />
      <Arrow x1={120} y1={102} x2={150} y2={102} />
      <Box x={150} y={80} w={110} h={44} label="Set Takt Time" fill="#2563eb" />
      <Arrow x1={260} y1={102} x2={290} y2={102} />
      <Box x={290} y={80} w={110} h={44} label="Assign Trades" fill="#16a34a" />
      <Arrow x1={400} y1={102} x2={430} y2={102} />
      <Box x={430} y={80} w={120} h={44} label="Balance Work" fill="#16a34a" />
      <Arrow x1={550} y1={102} x2={580} y2={102} />
      <Box x={580} y={80} w={110} h={44} label="Execute & Track" fill="#dc2626" />
      <text x={350} y={30} textAnchor="middle" fill="#374151" fontSize={16} fontWeight={700}>
        Takt Planning Flow
      </text>
    </svg>
  );
}

function LPSChart() {
  return (
    <svg viewBox="0 0 700 260" className="w-full max-w-[700px]">
      <defs>
        <marker id="arrowhead2" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#9ca3af" />
        </marker>
      </defs>
      <Box x={10} y={40} w={120} h={44} label="Master Schedule" fill="#6366f1" />
      <Arrow x1={130} y1={62} x2={160} y2={62} />
      <Box x={160} y={40} w={130} h={44} label="Phase Pull Plan" fill="#2563eb" />
      <Arrow x1={290} y1={62} x2={320} y2={62} />
      <Box x={320} y={40} w={130} h={44} label="Lookahead Plan" fill="#2563eb" />
      <Arrow x1={450} y1={62} x2={480} y2={62} />
      <Box x={480} y={40} w={120} h={44} label="Weekly Work" fill="#16a34a" />
      <Arrow x1={540} y1={84} x2={540} y2={130} />
      <Diamond cx={540} cy={160} label="PPC?" />
      <Arrow x1={570} y1={160} x2={620} y2={160} />
      <Box x={620} y={138} w={70} h={44} label="Learn" fill="#dc2626" />
      <text x={350} y={22} textAnchor="middle" fill="#374151" fontSize={16} fontWeight={700}>
        Last Planner System
      </text>
    </svg>
  );
}

function HuddleChart() {
  return (
    <svg viewBox="0 0 700 200" className="w-full max-w-[700px]">
      <defs>
        <marker id="arrowhead3" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#9ca3af" />
        </marker>
      </defs>
      <Box x={10} y={70} w={100} h={44} label="Safety" fill="#dc2626" />
      <Arrow x1={110} y1={92} x2={140} y2={92} />
      <Box x={140} y={70} w={100} h={44} label="Quality" fill="#f59e0b" />
      <Arrow x1={240} y1={92} x2={270} y2={92} />
      <Box x={270} y={70} w={100} h={44} label="Schedule" fill="#2563eb" />
      <Arrow x1={370} y1={92} x2={400} y2={92} />
      <Box x={400} y={70} w={100} h={44} label="Cost" fill="#16a34a" />
      <Arrow x1={500} y1={92} x2={530} y2={92} />
      <Box x={530} y={70} w={110} h={44} label="Roadblocks" fill="#7c3aed" />
      <text x={350} y={40} textAnchor="middle" fill="#374151" fontSize={16} fontWeight={700}>
        Daily Huddle Flow
      </text>
    </svg>
  );
}

function OPFChart() {
  return (
    <svg viewBox="0 0 700 200" className="w-full max-w-[700px]">
      <defs>
        <marker id="arrowhead4" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#9ca3af" />
        </marker>
      </defs>
      <Box x={10} y={70} w={130} h={44} label="Single Zone" fill="#2563eb" />
      <Arrow x1={140} y1={92} x2={170} y2={92} />
      <Box x={170} y={70} w={130} h={44} label="Single Trade" fill="#16a34a" />
      <Arrow x1={300} y1={92} x2={330} y2={92} />
      <Box x={330} y={70} w={130} h={44} label="Complete Work" fill="#16a34a" />
      <Arrow x1={460} y1={92} x2={490} y2={92} />
      <Box x={490} y={70} w={130} h={44} label="Hand Off" fill="#f59e0b" />
      <text x={350} y={40} textAnchor="middle" fill="#374151" fontSize={16} fontWeight={700}>
        One-Piece Flow
      </text>
    </svg>
  );
}

function BTLChart() {
  return (
    <svg viewBox="0 0 700 260" className="w-full max-w-[700px]">
      <defs>
        <marker id="arrowhead5" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#9ca3af" />
        </marker>
      </defs>
      <text x={170} y={22} textAnchor="middle" fill="#6b7280" fontSize={13} fontWeight={600}>
        Before (Batch)
      </text>
      <Box x={30} y={40} w={120} h={36} label="All Framing" fill="#9ca3af" />
      <Arrow x1={150} y1={58} x2={175} y2={58} />
      <Box x={175} y={40} w={120} h={36} label="All Plumbing" fill="#9ca3af" />
      <Arrow x1={295} y1={58} x2={320} y2={58} />
      <Box x={320} y={40} w={120} h={36} label="All Electrical" fill="#9ca3af" />

      <text x={170} y={120} textAnchor="middle" fill="#374151" fontSize={13} fontWeight={600}>
        After (Lean / Takt)
      </text>
      {['Zone A', 'Zone B', 'Zone C'].map((zone, i) => (
        <g key={zone}>
          <text x={10} y={155 + i * 38} fill="#374151" fontSize={11} fontWeight={600}>
            {zone}
          </text>
          <Box x={70} y={138 + i * 38} w={80} h={28} label="Frame" fill="#2563eb" />
          <Arrow x1={150} y1={152 + i * 38} x2={170} y2={152 + i * 38} />
          <Box x={170} y={138 + i * 38} w={80} h={28} label="Plumb" fill="#16a34a" />
          <Arrow x1={250} y1={152 + i * 38} x2={270} y2={152 + i * 38} />
          <Box x={270} y={138 + i * 38} w={80} h={28} label="Elect" fill="#f59e0b" />
        </g>
      ))}
      <text x={350} y={135} textAnchor="middle" fill="#374151" fontSize={16} fontWeight={700}>
        Batch → Lean Transformation
      </text>
    </svg>
  );
}

const CHARTS: Record<ChartKey, React.FC> = {
  takt: TaktChart,
  lps: LPSChart,
  huddle: HuddleChart,
  opf: OPFChart,
  btl: BTLChart,
};

export function FlowCharts() {
  const [active, setActive] = useState<ChartKey>('takt');
  const Chart = CHARTS[active];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Flow Charts</h3>

      {/* Chart selector */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(CHART_LABELS) as ChartKey[]).map((key) => (
          <button
            key={key}
            onClick={() => setActive(key)}
            className={clsx(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              active === key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {CHART_LABELS[key]}
          </button>
        ))}
      </div>

      {/* Chart display */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6 flex justify-center">
        <Chart />
      </div>
    </div>
  );
}
