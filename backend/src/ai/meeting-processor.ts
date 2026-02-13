/**
 * Meeting Notes Processor
 * Extracts action items and decisions from meeting transcripts.
 */

interface MeetingInput {
  title: string;
  date: string;
  attendees: string[];
  notes: string;
}

interface ActionItem {
  description: string;
  owner: string;
  dueDate?: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
}

interface MeetingResult {
  actionItems: ActionItem[];
  decisions: string[];
  riskFlags: string[];
}

const OWNER_PATTERNS: [RegExp, string][] = [
  [/jordan|pm|project manager/i, 'Jordan M.'],
  [/mike|super|superintendent/i, 'Mike S.'],
  [/sam|principal/i, 'Sam W.'],
  [/rachel|owner.?s?\s*rep/i, 'Rachel K.'],
  [/alex|procurement/i, 'Alex P.'],
  [/taylor|ops|operations/i, 'Taylor R.'],
];

export function processMeetingNotes(meeting: MeetingInput): MeetingResult {
  const lines = meeting.notes.split('\n').filter((l) => l.trim());
  const actionItems: ActionItem[] = [];
  const decisions: string[] = [];
  const riskFlags: string[] = [];

  for (const line of lines) {
    const lower = line.toLowerCase();

    // Detect action items
    if (lower.includes('action:') || lower.includes('todo:') || lower.includes('follow up')) {
      let owner = 'Jordan M.';
      for (const [pattern, name] of OWNER_PATTERNS) {
        if (pattern.test(line)) { owner = name; break; }
      }

      actionItems.push({
        description: line.replace(/^(action|todo|follow up):?\s*/i, '').trim(),
        owner,
        category: lower.includes('rfi') ? 'RFI' : lower.includes('budget') ? 'CO' : 'Decision',
        priority: lower.includes('urgent') || lower.includes('critical') ? 'high' : 'medium',
      });
    }

    // Detect decisions
    if (lower.includes('decided:') || lower.includes('approved:') || lower.includes('agreed:')) {
      decisions.push(line.replace(/^(decided|approved|agreed):?\s*/i, '').trim());
    }

    // Detect risks
    if (lower.includes('risk:') || lower.includes('concern:') || lower.includes('delay')) {
      riskFlags.push(line.trim());
    }
  }

  return { actionItems, decisions, riskFlags };
}
