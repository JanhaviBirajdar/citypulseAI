import { describe, it, expect, beforeEach } from 'vitest';
import { ReportsService } from '../services/reportsService';

describe('ReportsService - Citizen Reporting & Trust Engine', () => {
  beforeEach(() => {
    // Reset stored mock reports before each test
    ReportsService.resetReports();
  });

  it('validates report inputs strictly and rejects too-short submissions', () => {
    const invalidTitle = ReportsService.validateReport({
      title: 'bad', // Too short (< 5 chars)
      description: 'Pothole on road near station',
      locationName: 'FC Road',
      category: 'Road hazard'
    });
    expect(invalidTitle.isValid).toBe(false);
    expect(invalidTitle.errors[0]).toContain('Title must be at least 5 characters');

    const invalidDesc = ReportsService.validateReport({
      title: 'Waterlogging alert',
      description: 'rain', // Too short (< 10 chars)
      locationName: 'JM Road',
      category: 'Flooding or waterlogging'
    });
    expect(invalidDesc.isValid).toBe(false);
    expect(invalidDesc.errors[0]).toContain('Description must provide at least 10 characters');

    const valid = ReportsService.validateReport({
      title: 'Waterlogging near Alka Talkies Chowk',
      description: 'Water depth approximately 8 inches blocking left traffic lane.',
      locationName: 'Alka Talkies Chowk, Pune',
      category: 'Flooding or waterlogging'
    });
    expect(valid.isValid).toBe(true);
    expect(valid.errors.length).toBe(0);
  });

  it('detects duplicate incident reports within 600m and suggests upvoting', () => {
    // Existing report rep-001 is on FC Road (Goodluck Chowk) around (18.5204, 73.8415)
    const dupCheck = ReportsService.findDuplicateReport({
      lat: 18.5206, // ~25 meters from existing report
      lng: 73.8418,
      category: 'Road hazard',
      title: 'Unmarked pothole near Goodluck Cafe'
    });

    expect(dupCheck.isDuplicate).toBe(true);
    expect(dupCheck.matchedReport).toBeDefined();
    expect(dupCheck.distanceMeters).toBeLessThan(600);
  });

  it('upvotes existing report rather than duplicating when duplicate is submitted', () => {
    const initialReports = ReportsService.getReports();
    const existingPothole = initialReports.find(r => r.title.toLowerCase().includes('pothole'))!;
    const initialUpvotes = existingPothole.upvotes;

    const result = ReportsService.addReport({
      category: existingPothole.category,
      title: existingPothole.title,
      description: 'Duplicate claim submitted for same road obstacle',
      locationName: existingPothole.locationName,
      lat: existingPothole.lat + 0.0001,
      lng: existingPothole.lng + 0.0001,
      reporterAlias: 'TestReporter'
    });

    expect(result.wasDuplicate).toBe(true);
    expect(result.report.upvotes).toBe(initialUpvotes + 1);
  });

  it('ensures all newly submitted reports default to Unverified status', () => {
    const result = ReportsService.addReport({
      category: 'Public infrastructure issue',
      title: 'Broken streetlight on Senapati Bapat Road',
      description: 'Four streetlights out between petrol pump and Symbiosis entrance.',
      locationName: 'Senapati Bapat Road, Pune',
      lat: 18.5350,
      lng: 73.8290,
      reporterAlias: 'SBR_Commuter'
    }, { allowDuplicate: true });

    expect(result.report.status).toBe('Unverified');
    expect(result.report.isDemoData).toBe(true);
  });
});
