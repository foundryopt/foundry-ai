/**
 * AI Processing Module Index
 * Rule-based processors that simulate AI analysis of project data.
 * These run on seed/schedule to populate pattern tables and generate insights.
 */

export { processEmailIntake } from './email-processor';
export { processMeetingNotes } from './meeting-processor';
export { processTimeEntries } from './time-processor';
export { processVendorPerformance } from './vendor-processor';
export { processEntityExtraction } from './entity-processor';
export { detectPatterns } from './pattern-detector';
export { generateIntelligence } from './intelligence';
