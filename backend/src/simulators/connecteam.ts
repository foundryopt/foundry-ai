/**
 * Connecteam Simulator
 * Simulates time tracking and field operations data.
 */

export class ConnecteamSimulator {
  static async getTimeEntries(date: string) {
    return [
      { userId: 'ct-001', name: 'Mike S.', role: 'Super', clockIn: `${date}T07:00:00`, clockOut: `${date}T16:00:00`, hours: 9, project: 'Belmont', costCode: 'GEN-01' },
      { userId: 'ct-002', name: 'Crew Lead A', role: 'General Labor', clockIn: `${date}T06:30:00`, clockOut: `${date}T15:30:00`, hours: 9, project: 'Belmont', costCode: '23-05' },
      { userId: 'ct-003', name: 'Crew Lead B', role: 'General Labor', clockIn: `${date}T07:00:00`, clockOut: `${date}T15:00:00`, hours: 8, project: 'Wieland', costCode: '31-23' },
    ];
  }

  static async getActiveShifts() {
    return {
      totalOnSite: 14,
      byProject: [
        { project: 'Belmont', count: 9 },
        { project: 'Wieland', count: 5 },
      ],
    };
  }

  static async getWeeklySummary(weekOf: string) {
    return {
      weekOf,
      totalHours: 372,
      byRole: [
        { role: 'Super', hours: 45 },
        { role: 'General Labor', hours: 280 },
        { role: 'PM', hours: 47 },
      ],
    };
  }
}
