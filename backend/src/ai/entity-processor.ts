/**
 * Entity Extraction Processor
 * Extracts named entities (people, cost codes, amounts, dates) from unstructured text.
 */

interface ExtractedEntities {
  people: string[];
  costCodes: string[];
  amounts: number[];
  dates: string[];
  vendors: string[];
  locations: string[];
}

const KNOWN_PEOPLE = [
  'Jordan M.', 'Mike S.', 'Sam W.', 'Rachel K.', 'Alex P.', 'Taylor R.',
  'Chris L.', 'Dana W.', 'Kuan C.',
];

const KNOWN_VENDORS = [
  'Spark Electric', 'Crown Mechanical', 'Pacific Elevator', 'Mediterranean Stone',
  'Heritage Millwork', 'Valley Grading', 'Ironworks Fabrication', 'ABC Concrete',
  'Luminary Design', 'Heritage Flooring',
];

export function processEntityExtraction(text: string): ExtractedEntities {
  const people = KNOWN_PEOPLE.filter((p) => text.includes(p));
  const vendors = KNOWN_VENDORS.filter((v) => text.toLowerCase().includes(v.toLowerCase()));

  // Cost codes: XX-XX pattern
  const costCodes = [...new Set([
    ...(text.match(/\d{2}-\d{2}/g) || []),
    ...(text.match(/GEN-\d{2}/g) || []),
  ])];

  // Amounts: $X,XXX.XX
  const amounts = (text.match(/\$[\d,]+\.?\d*/g) || [])
    .map((m: string) => parseFloat(m.replace(/[$,]/g, '')));

  // Dates: YYYY-MM-DD or MM/DD/YYYY
  const dates = [
    ...(text.match(/\d{4}-\d{2}-\d{2}/g) || []),
    ...(text.match(/\d{1,2}\/\d{1,2}\/\d{4}/g) || []),
  ];

  // Locations
  const locationPatterns = /(?:Level|Unit|Floor|Zone|Section)\s+\w+/gi;
  const locations = (text.match(locationPatterns) || []).map((l) => l.trim());

  return { people, costCodes, amounts, dates, vendors, locations };
}
