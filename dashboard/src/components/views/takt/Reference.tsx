'use client';

import { useState } from 'react';

interface Term {
  term: string;
  definition: string;
  category: string;
}

const GLOSSARY: Term[] = [
  { term: 'Takt Time', definition: 'The standardized duration for completing work in each zone before crews move to the next zone. Derived from the German word for rhythm or beat.', category: 'Core' },
  { term: 'Takt Zone', definition: 'A physical area of the project where a trade crew completes their scope of work within one Takt time unit.', category: 'Core' },
  { term: 'Takt Train', definition: 'The sequential flow of trade crews through zones, each completing work in one Takt period before advancing.', category: 'Core' },
  { term: 'Last Planner System (LPS)', definition: 'A production planning system that involves the people who do the work in planning the work, producing reliable workflow and rapid learning.', category: 'Planning' },
  { term: 'Percent Plan Complete (PPC)', definition: 'The ratio of completed planned tasks to total planned tasks, used to measure planning reliability.', category: 'Metrics' },
  { term: 'Daily Huddle', definition: 'A brief daily standup meeting (typically 15 minutes) at the project board to review progress, identify roadblocks, and plan the day.', category: 'Meetings' },
  { term: 'Roadblock', definition: 'Any issue preventing a trade from completing their work in a zone within the Takt time. Must be resolved immediately.', category: 'Issues' },
  { term: 'Handoff', definition: 'The formal transfer of a zone from one trade to the next, including quality checks, cleanup, and sign-off.', category: 'Process' },
  { term: 'Pull Planning', definition: 'Planning backward from milestones to determine when each activity must start, engaging trade partners in the process.', category: 'Planning' },
  { term: 'One-Piece Flow', definition: 'Moving one zone through completion before starting the next, minimizing work-in-progress and waste.', category: 'Core' },
  { term: 'Buffer', definition: 'Time or resource reserve built into the Takt schedule to absorb variability without disrupting the train.', category: 'Planning' },
  { term: 'Plus/Delta', definition: 'A retrospective format where Plus = what went well and Delta = what should change. Used in weekly reviews.', category: 'Meetings' },
  { term: 'Steering Board', definition: 'A visual management tool showing zone-by-day grid with trade assignments, status, and milestones.', category: 'Tools' },
  { term: 'JIT Delivery', definition: 'Just-In-Time delivery of materials to the zone exactly when needed, reducing staging area waste and damage risk.', category: 'Logistics' },
  { term: 'Variance', definition: 'The difference between planned and actual performance. Tracked daily at the zone level in Takt systems.', category: 'Metrics' },
];

const CATEGORIES = [...new Set(GLOSSARY.map((t) => t.category))];

export function Reference() {
  const [openCategory, setOpenCategory] = useState<string | null>('Core');

  const toggle = (cat: string) => {
    setOpenCategory(openCategory === cat ? null : cat);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Takt Reference & Glossary</h3>

      <div className="space-y-2">
        {CATEGORIES.map((cat) => {
          const terms = GLOSSARY.filter((t) => t.category === cat);
          const isOpen = openCategory === cat;
          return (
            <div key={cat} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggle(cat)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-semibold text-gray-900">
                  {cat} ({terms.length})
                </span>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isOpen && (
                <div className="border-t border-gray-200 divide-y divide-gray-100">
                  {terms.map((t) => (
                    <div key={t.term} className="px-4 py-3">
                      <dt className="text-sm font-medium text-gray-800">{t.term}</dt>
                      <dd className="mt-1 text-sm text-gray-600">{t.definition}</dd>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
