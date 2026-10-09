import type { CitizenReport, VerificationStatus } from '../types';
import { DEMO_REPORTS } from '../data/demoReports';

const LOCAL_STORAGE_KEY = 'citypulse_citizen_reports_v1';

export class ReportsService {
  private static getStoredReports(): CitizenReport[] {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Failed to parse reports from localStorage', e);
    }
    // Initialize with demo reports
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEMO_REPORTS));
    return DEMO_REPORTS;
  }

  public static getReports(): CitizenReport[] {
    return this.getStoredReports();
  }

  public static addReport(reportInput: Omit<CitizenReport, 'id' | 'timestamp' | 'status' | 'upvotes' | 'isDemoData'>): CitizenReport {
    const reports = this.getStoredReports();
    const newReport: CitizenReport = {
      ...reportInput,
      id: `rep-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'Unverified', // New citizen submissions default to Unverified as per masterplan trust rules!
      upvotes: 1,
      isDemoData: true // Local user additions labeled as demo storage
    };

    const updated = [newReport, ...reports];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    return newReport;
  }

  public static updateReportStatus(reportId: string, status: VerificationStatus): CitizenReport[] {
    const reports = this.getStoredReports();
    const updated = reports.map((rep) =>
      rep.id === reportId ? { ...rep, status } : rep
    );
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  }

  public static upvoteReport(reportId: string): CitizenReport[] {
    const reports = this.getStoredReports();
    const updated = reports.map((rep) =>
      rep.id === reportId ? { ...rep, upvotes: rep.upvotes + 1 } : rep
    );
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  }

  public static resetReports(): CitizenReport[] {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEMO_REPORTS));
    return DEMO_REPORTS;
  }
}
