'use client';

import { useState, useMemo, useCallback } from 'react';
import clsx from 'clsx';

/* ── Types ── */

type DesignSubTab = 'submittals' | 'drawings' | 'specs' | 'installation' | 'versions';

interface Submittal {
  id: string;
  number: string;
  title: string;
  discipline: string;
  status: 'draft' | 'submitted' | 'in-review' | 'approved' | 'rejected' | 'resubmit';
  assignedTo: string;
  submittedDate: string;
  dueDate: string;
  reviewer: string;
  revision: number;
  project: string;
}

interface Drawing {
  id: string;
  number: string;
  title: string;
  discipline: string;
  currentRev: string;
  status: 'current' | 'superseded' | 'draft' | 'for-review';
  assignedTo: string;
  lastUpdated: string;
  sheet: string;
  project: string;
}

interface Spec {
  id: string;
  section: string;
  title: string;
  division: string;
  status: 'approved' | 'pending' | 'revision' | 'draft';
  assignedTo: string;
  revision: string;
  lastUpdated: string;
  project: string;
}

interface InstallGuide {
  id: string;
  trade: string;
  title: string;
  method: string;
  qualityStandard: string;
  inspectionChecklist: string[];
  revision: string;
  lastUpdated: string;
  status: 'current' | 'draft' | 'under-review' | 'superseded';
  project: string;
}

interface VersionEntry {
  id: string;
  docType: 'submittal' | 'drawing' | 'spec';
  docNumber: string;
  title: string;
  revision: string;
  changedBy: string;
  date: string;
  summary: string;
}

/* ── Seed Data ── */

const ASSIGNEES = ['J. Martinez', 'S. Kim', 'R. Patel', 'T. Johnson', 'L. Nguyen', 'M. Chen', 'A. Davis'];

const PROJECTS = ['SandBox — Mixed-Use', 'Greenfield — Residential'];

const SUBMITTALS: Submittal[] = [
  { id: 'sub-1', number: 'SUB-001', title: 'Structural Steel Shop Drawings', discipline: 'Structural', status: 'approved', assignedTo: 'J. Martinez', submittedDate: '2026-01-15', dueDate: '2026-01-29', reviewer: 'SHB Studio', revision: 2, project: 'SandBox — Mixed-Use' },
  { id: 'sub-2', number: 'SUB-002', title: 'HVAC Equipment Schedule', discipline: 'Mechanical', status: 'in-review', assignedTo: 'R. Patel', submittedDate: '2026-02-01', dueDate: '2026-02-15', reviewer: 'SHB Studio', revision: 1, project: 'SandBox — Mixed-Use' },
  { id: 'sub-3', number: 'SUB-003', title: 'Electrical Panel Schedule', discipline: 'Electrical', status: 'submitted', assignedTo: 'T. Johnson', submittedDate: '2026-02-05', dueDate: '2026-02-19', reviewer: 'SHB Studio', revision: 0, project: 'Greenfield — Residential' },
  { id: 'sub-4', number: 'SUB-004', title: 'Fire Sprinkler Layout', discipline: 'Fire Protection', status: 'rejected', assignedTo: 'S. Kim', submittedDate: '2026-01-20', dueDate: '2026-02-03', reviewer: 'Fire Marshal', revision: 1, project: 'SandBox — Mixed-Use' },
  { id: 'sub-5', number: 'SUB-005', title: 'Curtain Wall System', discipline: 'Architectural', status: 'resubmit', assignedTo: 'L. Nguyen', submittedDate: '2026-02-08', dueDate: '2026-02-22', reviewer: 'SHB Studio', revision: 3, project: 'SandBox — Mixed-Use' },
  { id: 'sub-6', number: 'SUB-006', title: 'Plumbing Fixture Schedule', discipline: 'Plumbing', status: 'approved', assignedTo: 'M. Chen', submittedDate: '2026-01-10', dueDate: '2026-01-24', reviewer: 'SHB Studio', revision: 1, project: 'Greenfield — Residential' },
  { id: 'sub-7', number: 'SUB-007', title: 'Concrete Mix Design', discipline: 'Structural', status: 'in-review', assignedTo: 'J. Martinez', submittedDate: '2026-02-10', dueDate: '2026-02-24', reviewer: 'Structural Eng.', revision: 0, project: 'Greenfield — Residential' },
  { id: 'sub-8', number: 'SUB-008', title: 'Waterproofing Membrane', discipline: 'Architectural', status: 'draft', assignedTo: 'A. Davis', submittedDate: '', dueDate: '2026-02-28', reviewer: 'SHB Studio', revision: 0, project: 'SandBox — Mixed-Use' },
  { id: 'sub-9', number: 'SUB-009', title: 'Elevator Equipment', discipline: 'Vertical Transport', status: 'submitted', assignedTo: 'R. Patel', submittedDate: '2026-02-12', dueDate: '2026-02-26', reviewer: 'SHB Studio', revision: 0, project: 'Greenfield — Residential' },
  { id: 'sub-10', number: 'SUB-010', title: 'Roofing System', discipline: 'Architectural', status: 'approved', assignedTo: 'S. Kim', submittedDate: '2026-01-08', dueDate: '2026-01-22', reviewer: 'SHB Studio', revision: 2, project: 'SandBox — Mixed-Use' },
];

const DRAWINGS: Drawing[] = [
  { id: 'dwg-1', number: 'A-101', title: 'Level 1 Floor Plan', discipline: 'Architectural', currentRev: 'C', status: 'current', assignedTo: 'L. Nguyen', lastUpdated: '2026-02-10', sheet: 'A', project: 'SandBox — Mixed-Use' },
  { id: 'dwg-2', number: 'A-201', title: 'Building Elevations', discipline: 'Architectural', currentRev: 'B', status: 'current', assignedTo: 'L. Nguyen', lastUpdated: '2026-02-08', sheet: 'A', project: 'SandBox — Mixed-Use' },
  { id: 'dwg-3', number: 'S-101', title: 'Foundation Plan', discipline: 'Structural', currentRev: 'D', status: 'current', assignedTo: 'J. Martinez', lastUpdated: '2026-02-05', sheet: 'S', project: 'SandBox — Mixed-Use' },
  { id: 'dwg-4', number: 'S-301', title: 'Steel Framing Plan Level 2', discipline: 'Structural', currentRev: 'A', status: 'for-review', assignedTo: 'J. Martinez', lastUpdated: '2026-02-12', sheet: 'S', project: 'Greenfield — Residential' },
  { id: 'dwg-5', number: 'M-101', title: 'Mechanical Floor Plan Level 1', discipline: 'Mechanical', currentRev: 'B', status: 'current', assignedTo: 'R. Patel', lastUpdated: '2026-02-06', sheet: 'M', project: 'SandBox — Mixed-Use' },
  { id: 'dwg-6', number: 'E-101', title: 'Electrical Power Plan Level 1', discipline: 'Electrical', currentRev: 'B', status: 'current', assignedTo: 'T. Johnson', lastUpdated: '2026-02-07', sheet: 'E', project: 'Greenfield — Residential' },
  { id: 'dwg-7', number: 'P-101', title: 'Plumbing Plan Level 1', discipline: 'Plumbing', currentRev: 'C', status: 'current', assignedTo: 'M. Chen', lastUpdated: '2026-02-04', sheet: 'P', project: 'Greenfield — Residential' },
  { id: 'dwg-8', number: 'A-501', title: 'Wall Section Details', discipline: 'Architectural', currentRev: 'A', status: 'draft', assignedTo: 'A. Davis', lastUpdated: '2026-02-13', sheet: 'A', project: 'SandBox — Mixed-Use' },
  { id: 'dwg-9', number: 'FP-101', title: 'Fire Protection Plan Level 1', discipline: 'Fire Protection', currentRev: 'A', status: 'for-review', assignedTo: 'S. Kim', lastUpdated: '2026-02-11', sheet: 'FP', project: 'Greenfield — Residential' },
];

const SPECS: Spec[] = [
  { id: 'sp-1', section: '03 30 00', title: 'Cast-in-Place Concrete', division: 'Div 03 — Concrete', status: 'approved', assignedTo: 'J. Martinez', revision: 'Rev 2', lastUpdated: '2026-01-20', project: 'SandBox — Mixed-Use' },
  { id: 'sp-2', section: '05 12 00', title: 'Structural Steel Framing', division: 'Div 05 — Metals', status: 'approved', assignedTo: 'J. Martinez', revision: 'Rev 1', lastUpdated: '2026-01-18', project: 'SandBox — Mixed-Use' },
  { id: 'sp-3', section: '07 92 00', title: 'Joint Sealants', division: 'Div 07 — Thermal/Moisture', status: 'pending', assignedTo: 'A. Davis', revision: 'Rev 0', lastUpdated: '2026-02-10', project: 'Greenfield — Residential' },
  { id: 'sp-4', section: '08 44 00', title: 'Curtain Wall System', division: 'Div 08 — Openings', status: 'revision', assignedTo: 'L. Nguyen', revision: 'Rev 3', lastUpdated: '2026-02-12', project: 'SandBox — Mixed-Use' },
  { id: 'sp-5', section: '22 00 00', title: 'Plumbing General', division: 'Div 22 — Plumbing', status: 'approved', assignedTo: 'M. Chen', revision: 'Rev 1', lastUpdated: '2026-01-25', project: 'Greenfield — Residential' },
  { id: 'sp-6', section: '23 00 00', title: 'HVAC General', division: 'Div 23 — HVAC', status: 'pending', assignedTo: 'R. Patel', revision: 'Rev 0', lastUpdated: '2026-02-08', project: 'SandBox — Mixed-Use' },
  { id: 'sp-7', section: '26 00 00', title: 'Electrical General', division: 'Div 26 — Electrical', status: 'approved', assignedTo: 'T. Johnson', revision: 'Rev 2', lastUpdated: '2026-02-01', project: 'Greenfield — Residential' },
  { id: 'sp-8', section: '09 29 00', title: 'Gypsum Board', division: 'Div 09 — Finishes', status: 'draft', assignedTo: 'S. Kim', revision: 'Rev 0', lastUpdated: '2026-02-13', project: 'SandBox — Mixed-Use' },
];

const VERSIONS: VersionEntry[] = [
  { id: 'v-1', docType: 'drawing', docNumber: 'A-101', title: 'Level 1 Floor Plan', revision: 'Rev C', changedBy: 'L. Nguyen', date: '2026-02-10', summary: 'Updated partition layout per RFI-031 response' },
  { id: 'v-2', docType: 'submittal', docNumber: 'SUB-005', title: 'Curtain Wall System', revision: 'Rev 3', changedBy: 'L. Nguyen', date: '2026-02-08', summary: 'Revised mullion details per architect comments' },
  { id: 'v-3', docType: 'drawing', docNumber: 'S-101', title: 'Foundation Plan', revision: 'Rev D', changedBy: 'J. Martinez', date: '2026-02-05', summary: 'Added pile cap details at grid lines F-G' },
  { id: 'v-4', docType: 'spec', docNumber: '08 44 00', title: 'Curtain Wall System', revision: 'Rev 3', changedBy: 'L. Nguyen', date: '2026-02-12', summary: 'Updated thermal performance requirements' },
  { id: 'v-5', docType: 'submittal', docNumber: 'SUB-001', title: 'Structural Steel Shop Drawings', revision: 'Rev 2', changedBy: 'J. Martinez', date: '2026-01-15', summary: 'Corrected connection details at moment frames' },
  { id: 'v-6', docType: 'drawing', docNumber: 'E-101', title: 'Electrical Power Plan Level 1', revision: 'Rev B', changedBy: 'T. Johnson', date: '2026-02-07', summary: 'Relocated panel EP-1A per field conditions' },
  { id: 'v-7', docType: 'submittal', docNumber: 'SUB-010', title: 'Roofing System', revision: 'Rev 2', changedBy: 'S. Kim', date: '2026-01-08', summary: 'Changed membrane type to TPO per VE' },
  { id: 'v-8', docType: 'drawing', docNumber: 'P-101', title: 'Plumbing Plan Level 1', revision: 'Rev C', changedBy: 'M. Chen', date: '2026-02-04', summary: 'Rerouted waste line around new duct shaft' },
];

const INSTALL_GUIDES: InstallGuide[] = [
  { id: 'ig-1', trade: 'Structural', title: 'Structural Steel Erection', method: 'AISC 303 Code of Standard Practice. Bolted connections per RCSC spec. Field welds per AWS D1.1. Torque verification on all high-strength bolts.', qualityStandard: 'AISC 360-22, AWS D1.1', inspectionChecklist: ['Anchor bolt placement ±1/8"', 'Column plumbness ±1:500', 'Beam alignment verified', 'Bolt tensioning per spec', 'Weld visual + UT inspection'], revision: 'Rev 2', lastUpdated: '2026-02-05', status: 'current', project: 'SandBox — Mixed-Use' },
  { id: 'ig-2', trade: 'Concrete', title: 'Cast-in-Place Concrete', method: 'ACI 318 structural concrete. Mix design per approved submittal. Consolidation via internal vibration. Curing per ACI 308. Min 7-day wet cure for slabs.', qualityStandard: 'ACI 318-19, ACI 301', inspectionChecklist: ['Rebar placement ±1/2" cover', 'Form alignment check', 'Slump test each truck', 'Cylinder break tests (7d, 28d)', 'Curing compound applied', 'Surface finish per spec'], revision: 'Rev 1', lastUpdated: '2026-01-28', status: 'current', project: 'SandBox — Mixed-Use' },
  { id: 'ig-3', trade: 'Mechanical', title: 'HVAC Ductwork Installation', method: 'SMACNA standards for duct construction. Seal class A for supply, class B for return. Support spacing per SMACNA table. Leak test at 1.5× operating pressure.', qualityStandard: 'SMACNA, ASHRAE 90.1', inspectionChecklist: ['Duct gauge per spec', 'Joint sealed & taped', 'Hanger spacing correct', 'Insulation thickness verified', 'Leak test passed', 'Balancing dampers installed'], revision: 'Rev 1', lastUpdated: '2026-02-08', status: 'current', project: 'SandBox — Mixed-Use' },
  { id: 'ig-4', trade: 'Electrical', title: 'Electrical Rough-In', method: 'NEC 2023 compliant. MC cable or EMT per spec. Box fill calculations verified. Grounding per NEC 250. Label all circuits at panels.', qualityStandard: 'NEC 2023, NFPA 70', inspectionChecklist: ['Wire sizing per load calc', 'Box fill within limits', 'Ground continuity tested', 'Circuit labels installed', 'Conduit support spacing', 'Arc-fault protection where req.'], revision: 'Rev 2', lastUpdated: '2026-02-07', status: 'current', project: 'Greenfield — Residential' },
  { id: 'ig-5', trade: 'Plumbing', title: 'Plumbing Rough-In & Stack', method: 'IPC 2021 compliant. DWV in cast iron above grade, PVC below. Copper supply with lead-free solder. Pressure test at 150 PSI for 2 hrs. Camera inspect main lines.', qualityStandard: 'IPC 2021, ASME B31.9', inspectionChecklist: ['Pipe slope ≥1/4" per ft', 'Pressure test 150 PSI / 2hr', 'No leaks at joints', 'Cleanouts accessible', 'Vent termination height', 'Water hammer arrestors'], revision: 'Rev 1', lastUpdated: '2026-02-06', status: 'current', project: 'Greenfield — Residential' },
  { id: 'ig-6', trade: 'Fire Protection', title: 'Fire Sprinkler Installation', method: 'NFPA 13 for commercial, NFPA 13R for residential. Heads per approved shop drawings. Hydrostatic test at 200 PSI for 2 hrs. Main drain flow test.', qualityStandard: 'NFPA 13, NFPA 25', inspectionChecklist: ['Head spacing per design', 'Pipe support per NFPA 13', 'Hydro test 200 PSI / 2hr', 'FDC connection verified', 'Escutcheons flush', 'System tagged & labeled'], revision: 'Rev 1', lastUpdated: '2026-02-10', status: 'under-review', project: 'SandBox — Mixed-Use' },
  { id: 'ig-7', trade: 'Architectural', title: 'Curtain Wall Assembly', method: 'Install per manufacturer instructions and approved shop drawings. Structural silicone glazing where shown. Flash all perimeter joints. ASTM E2112 for window integration.', qualityStandard: 'ASTM E2112, AAMA 501', inspectionChecklist: ['Anchor embedment depth', 'Mullion plumb ±1/16"', 'Glass lite sizes correct', 'Sealant bead continuous', 'Weep holes clear', 'Water test per AAMA 501'], revision: 'Rev 3', lastUpdated: '2026-02-12', status: 'current', project: 'SandBox — Mixed-Use' },
  { id: 'ig-8', trade: 'Drywall', title: 'Gypsum Board Installation', method: 'GA-216 standards. Screw spacing per fire rating. Tape and finish to Level 4 (Level 5 at highlight walls). Control joints at 30ft max spacing.', qualityStandard: 'GA-216, ASTM C840', inspectionChecklist: ['Stud spacing 16" OC', 'Screw pattern per fire rating', 'Joints taped & mudded', 'Corner bead straight', 'Finish level per spec', 'Fire-rated assemblies labeled'], revision: 'Rev 0', lastUpdated: '2026-02-13', status: 'draft', project: 'SandBox — Mixed-Use' },
  { id: 'ig-9', trade: 'Waterproofing', title: 'Below-Grade Waterproofing', method: 'Self-adhered membrane per manufacturer specs. Minimum 6" laps. Protection board over membrane. Drainage mat at foundation walls.', qualityStandard: 'ASTM D4068, ASTM D6135', inspectionChecklist: ['Surface prep clean & dry', 'Primer applied full coverage', 'Lap seams ≥6"', 'Terminations sealed', 'Protection board installed', 'Drainage mat drains to footing'], revision: 'Rev 1', lastUpdated: '2026-02-09', status: 'current', project: 'Greenfield — Residential' },
];

const INSTALL_BADGE: Record<string, string> = {
  current: 'bg-green-100 text-green-700',
  draft: 'bg-gray-100 text-gray-700',
  'under-review': 'bg-yellow-100 text-yellow-700',
  superseded: 'bg-red-100 text-red-700',
};

/* ── Status badges ── */

const SUBMITTAL_BADGE: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  submitted: 'bg-blue-100 text-blue-700',
  'in-review': 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  resubmit: 'bg-orange-100 text-orange-700',
};
const DRAWING_BADGE: Record<string, string> = {
  current: 'bg-green-100 text-green-700',
  superseded: 'bg-gray-100 text-gray-700',
  draft: 'bg-yellow-100 text-yellow-700',
  'for-review': 'bg-blue-100 text-blue-700',
};
const SPEC_BADGE: Record<string, string> = {
  approved: 'bg-green-100 text-green-700',
  pending: 'bg-blue-100 text-blue-700',
  revision: 'bg-orange-100 text-orange-700',
  draft: 'bg-gray-100 text-gray-700',
};
const DOCTYPE_BADGE: Record<string, string> = {
  submittal: 'bg-indigo-100 text-indigo-700',
  drawing: 'bg-cyan-100 text-cyan-700',
  spec: 'bg-amber-100 text-amber-700',
};

const SUB_TAB_LABELS: { key: DesignSubTab; label: string }[] = [
  { key: 'submittals', label: 'Submittals' },
  { key: 'drawings', label: 'Drawings' },
  { key: 'specs', label: 'Specifications' },
  { key: 'installation', label: 'Installation Guidelines' },
  { key: 'versions', label: 'Version History' },
];

/* ── Discipline border colors ── */

const DISCIPLINE_BORDER: Record<string, string> = {
  'Architectural': 'border-l-blue-500',
  'Structural': 'border-l-red-500',
  'Mechanical': 'border-l-green-500',
  'Electrical': 'border-l-yellow-500',
  'Plumbing': 'border-l-cyan-500',
  'Fire Protection': 'border-l-orange-500',
  'Concrete': 'border-l-gray-500',
  'Drywall': 'border-l-purple-500',
  'Waterproofing': 'border-l-teal-500',
};
const DEFAULT_DISCIPLINE_BORDER = 'border-l-gray-400';

function getDisciplineBorder(discipline: string): string {
  return DISCIPLINE_BORDER[discipline] || DEFAULT_DISCIPLINE_BORDER;
}

/* ── Discipline tag colors (for badge inside cards) ── */

const DISCIPLINE_TAG: Record<string, string> = {
  'Architectural': 'bg-blue-50 text-blue-700',
  'Structural': 'bg-red-50 text-red-700',
  'Mechanical': 'bg-green-50 text-green-700',
  'Electrical': 'bg-yellow-50 text-yellow-800',
  'Plumbing': 'bg-cyan-50 text-cyan-700',
  'Fire Protection': 'bg-orange-50 text-orange-700',
  'Concrete': 'bg-gray-100 text-gray-700',
  'Drywall': 'bg-purple-50 text-purple-700',
  'Waterproofing': 'bg-teal-50 text-teal-700',
};
const DEFAULT_DISCIPLINE_TAG = 'bg-gray-50 text-gray-600';

function getDisciplineTag(discipline: string): string {
  return DISCIPLINE_TAG[discipline] || DEFAULT_DISCIPLINE_TAG;
}

/* ── Row action buttons ── */

function RowActions({ onChat, onAttach }: { onChat: () => void; onAttach: () => void }) {
  return (
    <div className="flex items-center gap-0.5">
      <button onClick={onChat} className="p-1 rounded text-gray-400 hover:text-blue-600 transition-colors" title="Conversation">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
      </button>
      <button onClick={onAttach} className="p-1 rounded text-gray-400 hover:text-blue-600 transition-colors" title="Attachments">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
        </svg>
      </button>
    </div>
  );
}

function AssigneeDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="text-xs border border-gray-200 rounded px-1.5 py-0.5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 max-w-[110px]"
    >
      {ASSIGNEES.map((a) => (
        <option key={a} value={a}>{a}</option>
      ))}
    </select>
  );
}

/* ── Filter Dropdown component ── */

function FilterDropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[180px]"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

/* ── Props ── */

interface DesignSelectionsProps {
  finishes: unknown[];
  isAllProjects: boolean;
}

/* ── Component ── */

export function DesignSelections({ isAllProjects: _isAllProjects }: DesignSelectionsProps) {
  const [activeTab, setActiveTab] = useState<DesignSubTab>('submittals');
  const [submittals, setSubmittals] = useState(SUBMITTALS);
  const [drawings, setDrawings] = useState(DRAWINGS);
  const [specs, setSpecs] = useState(SPECS);

  // Filter state
  const [filterProject, setFilterProject] = useState<string>('all');
  const [filterDiscipline, setFilterDiscipline] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Reset filters when switching tabs
  const handleTabChange = useCallback((tab: DesignSubTab) => {
    setActiveTab(tab);
    setFilterStatus('all');
    // Keep project and discipline filters across tabs
  }, []);

  // Derive unique disciplines from all data
  const allDisciplines = useMemo(() => {
    const set = new Set<string>();
    submittals.forEach((s) => set.add(s.discipline));
    drawings.forEach((d) => set.add(d.discipline));
    INSTALL_GUIDES.forEach((g) => set.add(g.trade));
    return Array.from(set).sort();
  }, [submittals, drawings, specs]);

  // Status options per tab
  const statusOptions = useMemo(() => {
    if (activeTab === 'submittals') return Object.keys(SUBMITTAL_BADGE);
    if (activeTab === 'drawings') return Object.keys(DRAWING_BADGE);
    if (activeTab === 'specs') return Object.keys(SPEC_BADGE);
    if (activeTab === 'installation') return Object.keys(INSTALL_BADGE);
    return [];
  }, [activeTab]);

  // Filtered data
  const filteredSubmittals = useMemo(() => {
    return submittals.filter((s) => {
      if (filterProject !== 'all' && s.project !== filterProject) return false;
      if (filterDiscipline !== 'all' && s.discipline !== filterDiscipline) return false;
      if (filterStatus !== 'all' && s.status !== filterStatus) return false;
      return true;
    });
  }, [submittals, filterProject, filterDiscipline, filterStatus]);

  const filteredDrawings = useMemo(() => {
    return drawings.filter((d) => {
      if (filterProject !== 'all' && d.project !== filterProject) return false;
      if (filterDiscipline !== 'all' && d.discipline !== filterDiscipline) return false;
      if (filterStatus !== 'all' && d.status !== filterStatus) return false;
      return true;
    });
  }, [drawings, filterProject, filterDiscipline, filterStatus]);

  const filteredSpecs = useMemo(() => {
    return specs.filter((s) => {
      if (filterProject !== 'all' && s.project !== filterProject) return false;
      if (filterDiscipline !== 'all') {
        // Match discipline filter against spec division text
        const divLower = s.division.toLowerCase();
        const filterLower = filterDiscipline.toLowerCase();
        if (!divLower.includes(filterLower) && filterDiscipline !== s.division) return false;
      }
      if (filterStatus !== 'all' && s.status !== filterStatus) return false;
      return true;
    });
  }, [specs, filterProject, filterDiscipline, filterStatus]);

  // Summary chart data — uses filtered data
  const submittalStats = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredSubmittals.forEach((s) => { counts[s.status] = (counts[s.status] || 0) + 1; });
    return counts;
  }, [filteredSubmittals]);

  const drawingStats = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredDrawings.forEach((d) => { counts[d.status] = (counts[d.status] || 0) + 1; });
    return counts;
  }, [filteredDrawings]);

  const specStats = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredSpecs.forEach((s) => { counts[s.status] = (counts[s.status] || 0) + 1; });
    return counts;
  }, [filteredSpecs]);

  const updateSubmittalAssignee = useCallback((id: string, assignee: string) => {
    setSubmittals((prev) => prev.map((s) => s.id === id ? { ...s, assignedTo: assignee } : s));
  }, []);

  const updateDrawingAssignee = useCallback((id: string, assignee: string) => {
    setDrawings((prev) => prev.map((d) => d.id === id ? { ...d, assignedTo: assignee } : d));
  }, []);

  const updateSpecAssignee = useCallback((id: string, assignee: string) => {
    setSpecs((prev) => prev.map((s) => s.id === id ? { ...s, assignedTo: assignee } : s));
  }, []);

  const filteredInstall = useMemo(() => {
    return INSTALL_GUIDES.filter((g) => {
      if (filterProject !== 'all' && g.project !== filterProject) return false;
      if (filterDiscipline !== 'all' && g.trade !== filterDiscipline) return false;
      if (filterStatus !== 'all' && g.status !== filterStatus) return false;
      return true;
    });
  }, [filterProject, filterDiscipline, filterStatus]);

  const installStats = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredInstall.forEach((g) => { counts[g.status] = (counts[g.status] || 0) + 1; });
    return counts;
  }, [filteredInstall]);

  // Summary bar helper
  const currentStats = activeTab === 'submittals' ? submittalStats : activeTab === 'drawings' ? drawingStats : activeTab === 'installation' ? installStats : specStats;
  const currentBadgeMap = activeTab === 'submittals' ? SUBMITTAL_BADGE : activeTab === 'drawings' ? DRAWING_BADGE : activeTab === 'installation' ? INSTALL_BADGE : SPEC_BADGE;
  const maxCount = Math.max(...Object.values(currentStats).map(Number), 1);

  const filteredCount = activeTab === 'submittals'
    ? filteredSubmittals.length
    : activeTab === 'drawings'
      ? filteredDrawings.length
      : activeTab === 'specs'
        ? filteredSpecs.length
        : activeTab === 'installation'
          ? filteredInstall.length
          : VERSIONS.length;

  const totalCount = activeTab === 'submittals'
    ? submittals.length
    : activeTab === 'drawings'
      ? drawings.length
      : activeTab === 'specs'
        ? specs.length
        : activeTab === 'installation'
          ? INSTALL_GUIDES.length
          : VERSIONS.length;

  return (
    <div className="space-y-6">
      {/* Sub-tab navigation */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {SUB_TAB_LABELS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => handleTabChange(key)}
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

      {/* Filter dropdowns — shown for submittals, drawings, specs (not versions) */}
      {activeTab !== 'versions' && (
        <div className="flex flex-wrap items-end gap-4 bg-white rounded-lg shadow border border-gray-200 px-4 py-3">
          <FilterDropdown
            label="Project"
            value={filterProject}
            options={[
              { value: 'all', label: 'All Projects' },
              ...PROJECTS.map((p) => ({ value: p, label: p })),
            ]}
            onChange={setFilterProject}
          />
          <FilterDropdown
            label="Discipline"
            value={filterDiscipline}
            options={[
              { value: 'all', label: 'All Disciplines' },
              ...allDisciplines.map((d) => ({ value: d, label: d })),
            ]}
            onChange={setFilterDiscipline}
          />
          <FilterDropdown
            label="Status"
            value={filterStatus}
            options={[
              { value: 'all', label: 'All Statuses' },
              ...statusOptions.map((s) => ({ value: s, label: s.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase()) })),
            ]}
            onChange={setFilterStatus}
          />
          <div className="flex items-end pb-1">
            <span className="text-xs text-gray-500">
              {filteredCount === totalCount
                ? `${totalCount} items`
                : `${filteredCount} of ${totalCount} items`}
            </span>
          </div>
        </div>
      )}

      {/* Summary chart — horizontal bar for status distribution (filtered) */}
      {activeTab !== 'versions' && (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            {activeTab === 'submittals' ? 'Submittal' : activeTab === 'drawings' ? 'Drawing' : activeTab === 'installation' ? 'Installation Guide' : 'Specification'} Status
          </h4>
          <div className="space-y-2">
            {Object.entries(currentStats).length === 0 && (
              <p className="text-sm text-gray-400 italic">No items match the current filters.</p>
            )}
            {Object.entries(currentStats).map(([status, count]) => (
              <div key={status} className="flex items-center gap-3">
                <span className={clsx('text-[10px] font-medium capitalize px-2 py-0.5 rounded w-20 text-center', currentBadgeMap[status])}>
                  {status.replace('-', ' ')}
                </span>
                <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={clsx('h-full rounded-full transition-all', currentBadgeMap[status]?.replace('text-', 'bg-').replace(/bg-\w+-100/, ''))}
                    style={{ width: `${(count / maxCount) * 100}%`, minWidth: count > 0 ? '16px' : '0' }}
                  />
                </div>
                <span className="text-sm font-semibold text-gray-700 w-6 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Submittals tab — Card Grid ── */}
      {activeTab === 'submittals' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredSubmittals.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-400 text-sm">No submittals match the current filters.</div>
          )}
          {filteredSubmittals.map((s) => (
            <div
              key={s.id}
              className={clsx(
                'bg-white rounded-lg shadow border border-gray-200 border-l-4 p-4 flex flex-col gap-3 hover:shadow-md transition-shadow',
                getDisciplineBorder(s.discipline)
              )}
            >
              {/* Top row: number + status badge */}
              <div className="flex items-start justify-between gap-2">
                <span className="font-mono text-xs text-gray-700 font-semibold">{s.number}</span>
                <span className={clsx('px-2 py-0.5 rounded text-[10px] font-medium capitalize whitespace-nowrap', SUBMITTAL_BADGE[s.status])}>
                  {s.status.replace('-', ' ')}
                </span>
              </div>

              {/* Title */}
              <div className="flex-1 min-h-0">
                <p className="text-sm font-medium text-gray-900 leading-snug line-clamp-2">{s.title}</p>
              </div>

              {/* Discipline + project tags */}
              <div className="flex flex-wrap gap-1.5">
                <span className={clsx('text-[10px] font-medium px-2 py-0.5 rounded', getDisciplineTag(s.discipline))}>
                  {s.discipline}
                </span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                  Rev {s.revision}
                </span>
              </div>

              {/* Dates */}
              <div className="flex items-center gap-3 text-[10px] text-gray-500">
                <span title="Submitted">{s.submittedDate ? `Sub: ${s.submittedDate}` : 'Not submitted'}</span>
                <span title="Due">Due: {s.dueDate}</span>
              </div>

              {/* Bottom: assignee + actions */}
              <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                <AssigneeDropdown value={s.assignedTo} onChange={(v) => updateSubmittalAssignee(s.id, v)} />
                <RowActions onChat={() => {}} onAttach={() => {}} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Drawings tab — Card Grid ── */}
      {activeTab === 'drawings' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredDrawings.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-400 text-sm">No drawings match the current filters.</div>
          )}
          {filteredDrawings.map((d) => (
            <div
              key={d.id}
              className={clsx(
                'bg-white rounded-lg shadow border border-gray-200 border-l-4 p-4 flex flex-col gap-3 hover:shadow-md transition-shadow',
                getDisciplineBorder(d.discipline)
              )}
            >
              {/* Top row: number + status badge */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-gray-700 font-semibold">{d.number}</span>
                  <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 rounded px-1.5 py-0.5">
                    Rev {d.currentRev}
                  </span>
                </div>
                <span className={clsx('px-2 py-0.5 rounded text-[10px] font-medium capitalize whitespace-nowrap', DRAWING_BADGE[d.status])}>
                  {d.status.replace('-', ' ')}
                </span>
              </div>

              {/* Title */}
              <div className="flex-1 min-h-0">
                <p className="text-sm font-medium text-gray-900 leading-snug line-clamp-2">{d.title}</p>
              </div>

              {/* Discipline + sheet tags */}
              <div className="flex flex-wrap gap-1.5">
                <span className={clsx('text-[10px] font-medium px-2 py-0.5 rounded', getDisciplineTag(d.discipline))}>
                  {d.discipline}
                </span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                  Sheet {d.sheet}
                </span>
              </div>

              {/* Date */}
              <div className="text-[10px] text-gray-500">
                Updated: {d.lastUpdated}
              </div>

              {/* Bottom: assignee + actions */}
              <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                <AssigneeDropdown value={d.assignedTo} onChange={(v) => updateDrawingAssignee(d.id, v)} />
                <RowActions onChat={() => {}} onAttach={() => {}} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Specs tab — Card Grid ── */}
      {activeTab === 'specs' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredSpecs.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-400 text-sm">No specifications match the current filters.</div>
          )}
          {filteredSpecs.map((s) => (
            <div
              key={s.id}
              className={clsx(
                'bg-white rounded-lg shadow border border-gray-200 border-l-4 p-4 flex flex-col gap-3 hover:shadow-md transition-shadow',
                // Specs don't have a direct discipline field — derive from division
                s.division.includes('Concrete') || s.division.includes('Metals') ? 'border-l-red-500'
                  : s.division.includes('Thermal') || s.division.includes('Openings') || s.division.includes('Finishes') ? 'border-l-blue-500'
                  : s.division.includes('Plumbing') ? 'border-l-cyan-500'
                  : s.division.includes('HVAC') ? 'border-l-green-500'
                  : s.division.includes('Electrical') ? 'border-l-yellow-500'
                  : DEFAULT_DISCIPLINE_BORDER
              )}
            >
              {/* Top row: section + status badge */}
              <div className="flex items-start justify-between gap-2">
                <span className="font-mono text-xs text-gray-700 font-semibold">{s.section}</span>
                <span className={clsx('px-2 py-0.5 rounded text-[10px] font-medium capitalize whitespace-nowrap', SPEC_BADGE[s.status])}>
                  {s.status}
                </span>
              </div>

              {/* Title */}
              <div className="flex-1 min-h-0">
                <p className="text-sm font-medium text-gray-900 leading-snug line-clamp-2">{s.title}</p>
              </div>

              {/* Division + revision tags */}
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                  {s.division}
                </span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                  {s.revision}
                </span>
              </div>

              {/* Date */}
              <div className="text-[10px] text-gray-500">
                Updated: {s.lastUpdated}
              </div>

              {/* Bottom: assignee + actions */}
              <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                <AssigneeDropdown value={s.assignedTo} onChange={(v) => updateSpecAssignee(s.id, v)} />
                <RowActions onChat={() => {}} onAttach={() => {}} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Installation Guidelines tab ── */}
      {activeTab === 'installation' && (
        <div className="space-y-4">
          {INSTALL_GUIDES
            .filter((g) => filterProject === 'all' || g.project === filterProject)
            .filter((g) => filterDiscipline === 'all' || g.trade === filterDiscipline)
            .filter((g) => filterStatus === 'all' || g.status === filterStatus)
            .map((g) => (
            <div key={g.id} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-3">
                  <span className={clsx('text-[10px] font-medium px-2 py-0.5 rounded', getDisciplineTag(g.trade))}>
                    {g.trade}
                  </span>
                  <h4 className="text-sm font-semibold text-gray-900">{g.title}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-600">{g.revision}</span>
                  <span className={clsx('px-2 py-0.5 rounded text-[10px] font-medium capitalize', INSTALL_BADGE[g.status])}>
                    {g.status.replace('-', ' ')}
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-4">
                {/* Method */}
                <div>
                  <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Installation Method</h5>
                  <p className="text-sm text-gray-700 leading-relaxed">{g.method}</p>
                </div>

                {/* Quality Standard */}
                <div>
                  <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Quality Standard</h5>
                  <p className="text-sm text-gray-800 font-medium">{g.qualityStandard}</p>
                </div>

                {/* Inspection Checklist */}
                <div>
                  <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Inspection Checklist</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {g.inspectionChecklist.map((item, i) => (
                      <label key={i} className="flex items-start gap-2 text-sm text-gray-700 bg-gray-50 rounded px-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors">
                        <input type="checkbox" className="mt-0.5 rounded border-gray-300" />
                        <span>{item}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-[10px] text-gray-500">
                  <span>Updated: {g.lastUpdated}</span>
                  <span>{g.project}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Versions tab — kept as table ── */}
      {activeTab === 'versions' && (
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="w-16 px-2 py-2" />
                  <th className="text-left px-3 py-2 font-semibold text-gray-600">Type</th>
                  <th className="text-left px-3 py-2 font-semibold text-gray-600">Doc #</th>
                  <th className="text-left px-3 py-2 font-semibold text-gray-600">Title</th>
                  <th className="text-left px-3 py-2 font-semibold text-gray-600">Revision</th>
                  <th className="text-left px-3 py-2 font-semibold text-gray-600">Changed By</th>
                  <th className="text-left px-3 py-2 font-semibold text-gray-600">Date</th>
                  <th className="text-left px-3 py-2 font-semibold text-gray-600">Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {VERSIONS.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="px-2 py-2"><RowActions onChat={() => {}} onAttach={() => {}} /></td>
                    <td className="px-3 py-2">
                      <span className={clsx('px-2 py-0.5 rounded text-xs font-medium capitalize', DOCTYPE_BADGE[v.docType])}>
                        {v.docType}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-gray-800">{v.docNumber}</td>
                    <td className="px-3 py-2 text-gray-800 font-medium max-w-xs truncate">{v.title}</td>
                    <td className="px-3 py-2 text-gray-600 text-xs">{v.revision}</td>
                    <td className="px-3 py-2 text-gray-600 text-xs">{v.changedBy}</td>
                    <td className="px-3 py-2 text-gray-500 text-xs">{v.date}</td>
                    <td className="px-3 py-2 text-gray-600 text-xs max-w-sm truncate">{v.summary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
