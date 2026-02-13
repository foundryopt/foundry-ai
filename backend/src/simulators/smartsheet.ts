/**
 * Smartsheet Simulator
 * Simulates schedule, RFI log, and submittal log data from Smartsheet.
 */

export class SmartsheetSimulator {
  static async getSchedule(projectId: string) {
    return {
      projectId,
      lastUpdated: new Date().toISOString(),
      phases: [
        { name: 'Phase 1', percentComplete: 100 },
        { name: 'Phase 2', percentComplete: 85 },
        { name: 'Phase 3', percentComplete: 12 },
      ],
    };
  }

  static async getRFILog(projectId: string) {
    return {
      projectId,
      totalRFIs: 48,
      openRFIs: 5,
      overdueRFIs: 2,
      avgResponseDays: 4.2,
    };
  }

  static async getSubmittalLog(projectId: string) {
    return {
      projectId,
      totalSubmittals: 32,
      pendingReview: 4,
      approved: 26,
      rejected: 2,
    };
  }

  static async updateRow(sheetId: string, rowId: string, data: Record<string, any>) {
    return { success: true, sheetId, rowId, updatedFields: Object.keys(data) };
  }
}
