import type { CitizenReport, VerificationStatus, ReportCategory } from '../types';
import { DEMO_REPORTS } from '../data/demoReports';

const LOCAL_STORAGE_KEY = 'citypulse_citizen_reports_v1';

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  matchedReport?: CitizenReport;
  distanceMeters?: number;
  reason?: string;
}

export interface ReportValidationResult {
  isValid: boolean;
  errors: string[];
}

export class ReportsService {
  private static memoryCache: CitizenReport[] | null = null;

  private static getStoredReports(): CitizenReport[] {
    if (typeof localStorage !== 'undefined') {
      try {
        const data = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (data) {
          return JSON.parse(data);
        }
      } catch (e) {
        console.warn('Failed to parse reports from localStorage', e);
      }
    } else if (this.memoryCache) {
      return this.memoryCache;
    }

    // Initialize with demo reports
    this.safeSetReports(DEMO_REPORTS);
    return [...DEMO_REPORTS];
  }

  private static safeSetReports(reports: CitizenReport[]): void {
    this.memoryCache = [...reports];
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(reports));
      } catch (e) {
        console.warn('Failed to save reports to localStorage', e);
      }
    }
  }

  public static getReports(): CitizenReport[] {
    return this.getStoredReports();
  }

  /**
   * Validates citizen report fields against quality and trust criteria
   */
  public static validateReport(input: {
    title?: string;
    description?: string;
    locationName?: string;
    category?: ReportCategory;
  }): ReportValidationResult {
    const errors: string[] = [];

    if (!input.title || input.title.trim().length < 5) {
      errors.push('Title must be at least 5 characters describing the specific incident.');
    }

    if (!input.description || input.description.trim().length < 10) {
      errors.push('Description must provide at least 10 characters of context (e.g., lane, landmarks, hazard extent).');
    }

    if (!input.locationName || input.locationName.trim().length < 3) {
      errors.push('Specific landmark or street name in Pune is required.');
    }

    if (!input.category) {
      errors.push('A valid incident category must be selected.');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Detects potential duplicate reports within 600m radius with matching category or keywords
   */
  public static findDuplicateReport(input: {
    lat: number;
    lng: number;
    category: ReportCategory;
    title: string;
  }): DuplicateCheckResult {
    const reports = this.getStoredReports();
    const cleanTitleWords = input.title.toLowerCase().split(/\s+/).filter(w => w.length > 3);

    for (const existing of reports) {
      const distanceKm = this.calculateDistanceKm(input.lat, input.lng, existing.lat, existing.lng);
      const distanceMeters = Math.round(distanceKm * 1000);

      // If within 600 meters
      if (distanceMeters <= 600) {
        const categoryMatch = existing.category === input.category;
        const titleMatch = cleanTitleWords.some(w => existing.title.toLowerCase().includes(w));

        if (categoryMatch || titleMatch) {
          return {
            isDuplicate: true,
            matchedReport: existing,
            distanceMeters,
            reason: `Existing ${existing.category} report "${existing.title}" is located ${distanceMeters}m away.`
          };
        }
      }
    }

    return { isDuplicate: false };
  }

  public static addReport(
    reportInput: Omit<CitizenReport, 'id' | 'timestamp' | 'status' | 'upvotes' | 'isDemoData'>,
    options?: { allowDuplicate?: boolean }
  ): { report: CitizenReport; wasDuplicate: boolean; duplicateInfo?: DuplicateCheckResult } {
    const reports = this.getStoredReports();

    if (!options?.allowDuplicate) {
      const dupCheck = this.findDuplicateReport({
        lat: reportInput.lat,
        lng: reportInput.lng,
        category: reportInput.category,
        title: reportInput.title
      });

      if (dupCheck.isDuplicate && dupCheck.matchedReport) {
        // Automatically upvote the existing report to amplify community consensus
        const updated = this.upvoteReport(dupCheck.matchedReport.id);
        const upvoted = updated.find(r => r.id === dupCheck.matchedReport!.id) || dupCheck.matchedReport;
        return {
          report: upvoted,
          wasDuplicate: true,
          duplicateInfo: dupCheck
        };
      }
    }

    const newReport: CitizenReport = {
      ...reportInput,
      id: `rep-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'Unverified', // New citizen submissions default to Unverified as per masterplan trust rules!
      upvotes: 1,
      isDemoData: true
    };

    const updated = [newReport, ...reports];
    this.safeSetReports(updated);
    return { report: newReport, wasDuplicate: false };
  }

  public static updateReportStatus(reportId: string, status: VerificationStatus): CitizenReport[] {
    const reports = this.getStoredReports();
    const updated = reports.map((rep) =>
      rep.id === reportId ? { ...rep, status } : rep
    );
    this.safeSetReports(updated);
    return updated;
  }

  public static upvoteReport(reportId: string): CitizenReport[] {
    const reports = this.getStoredReports();
    const updated = reports.map((rep) =>
      rep.id === reportId ? { ...rep, upvotes: rep.upvotes + 1 } : rep
    );
    this.safeSetReports(updated);
    return updated;
  }

  public static resetReports(): CitizenReport[] {
    this.safeSetReports(DEMO_REPORTS);
    return [...DEMO_REPORTS];
  }

  private static calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}
