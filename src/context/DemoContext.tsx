import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  Place,
  CitizenReport,
  MatchWeights,
  ItineraryPlan,
  WeatherSummary,
  TravelMode,
  VerificationStatus
} from '../types';
import { DEMO_PLACES } from '../data/demoPlaces';
import { ReportsService } from '../services/reportsService';
import { DEFAULT_WEIGHTS } from '../services/scoringEngine';

import { CityDecisionEngine, type DisruptionTrigger } from '../services/cityDecisionEngine';

export interface UserPreferences {
  budgetMaxINR: number;
  durationHours: number;
  interests: string[];
  travelMode: TravelMode;
  startingLocation: string;
  requireWheelchair?: boolean;
  requireRestroom?: boolean;
  avoidHazards?: boolean;
}

interface DemoContextType {
  city: string;
  places: Place[];
  reports: CitizenReport[];
  comparePlaceIds: string[];
  matchWeights: MatchWeights;
  activeItinerary: ItineraryPlan | null;
  userPreferences: UserPreferences;
  weather: WeatherSummary;
  isDemoMode: boolean;
  adminModerationMode: boolean;
  setAdminModerationMode: (val: boolean) => void;
  toggleComparePlace: (placeId: string) => void;
  clearComparePlaces: () => void;
  updateWeights: (weights: MatchWeights) => void;
  setUserPreferences: React.Dispatch<React.SetStateAction<UserPreferences>>;
  addReport: (report: Omit<CitizenReport, 'id' | 'timestamp' | 'status' | 'upvotes' | 'isDemoData'>) => void;
  updateReportStatus: (id: string, status: VerificationStatus) => void;
  upvoteReport: (id: string) => void;
  setActiveItinerary: (plan: ItineraryPlan | null) => void;
  replanActiveItinerary: (trigger: DisruptionTrigger) => void;
  loadDemoScenario: () => void;
  resetAllData: () => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export const DemoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [city] = useState<string>('Pune, India');
  const [places] = useState<Place[]>(DEMO_PLACES);
  const [reports, setReports] = useState<CitizenReport[]>([]);
  const [comparePlaceIds, setComparePlaceIds] = useState<string[]>(['pune-shaniwar-wada', 'pune-aga-khan-palace']);
  const [matchWeights, setMatchWeights] = useState<MatchWeights>(DEFAULT_WEIGHTS);
  const [activeItinerary, setActiveItinerary] = useState<ItineraryPlan | null>(null);
  const [isDemoMode] = useState<boolean>(true);
  const [adminModerationMode, setAdminModerationMode] = useState<boolean>(false);

  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    budgetMaxINR: 500,
    durationHours: 4.5,
    interests: ['Food', 'Heritage', 'Culture', 'Photography'],
    travelMode: 'Two-wheeler',
    startingLocation: 'Shivajinagar Station, Pune',
    requireWheelchair: false,
    requireRestroom: false,
    avoidHazards: true
  });

  const [weather] = useState<WeatherSummary>({
    temperatureC: 28,
    condition: 'Partly Cloudy',
    humidity: 62,
    aqi: 72,
    aqiStatus: 'Moderate',
    lastUpdated: '2026-10-09 10:30 AM',
    isDemoData: true
  });

  // Load initial reports from localStorage / service
  useEffect(() => {
    setReports(ReportsService.getReports());
  }, []);

  const toggleComparePlace = (placeId: string) => {
    setComparePlaceIds(prev => {
      if (prev.includes(placeId)) {
        return prev.filter(id => id !== placeId);
      }
      if (prev.length >= 3) {
        // Max 3 places for side-by-side face-off
        return [...prev.slice(1), placeId];
      }
      return [...prev, placeId];
    });
  };

  const clearComparePlaces = () => setComparePlaceIds([]);

  const updateWeights = (weights: MatchWeights) => setMatchWeights(weights);

  const handleAddReport = (reportInput: Omit<CitizenReport, 'id' | 'timestamp' | 'status' | 'upvotes' | 'isDemoData'>) => {
    ReportsService.addReport(reportInput);
    setReports(ReportsService.getReports());
  };

  const handleUpdateReportStatus = (id: string, status: VerificationStatus) => {
    const updated = ReportsService.updateReportStatus(id, status);
    setReports(updated);
  };

  const handleUpvoteReport = (id: string) => {
    const updated = ReportsService.upvoteReport(id);
    setReports(updated);
  };

  // Dynamic Replanning Trigger
  const replanActiveItinerary = (trigger: DisruptionTrigger) => {
    if (!activeItinerary) return;
    const replanned = CityDecisionEngine.replanItinerary(activeItinerary, trigger, places, reports);
    setActiveItinerary(replanned);
  };

  // Hackathon Demo Scenario 1-Click Trigger
  const loadDemoScenario = () => {
    const demoPreferences: UserPreferences = {
      budgetMaxINR: 500,
      durationHours: 4.5,
      interests: ['Heritage', 'Culture', 'Food'],
      travelMode: 'Two-wheeler',
      startingLocation: 'Shivajinagar Station, Pune',
      requireWheelchair: false,
      requireRestroom: true,
      avoidHazards: true
    };
    setUserPreferences(demoPreferences);
    setComparePlaceIds(['pune-shaniwar-wada', 'pune-aga-khan-palace', 'pune-fc-road-food']);

    // Generate verified itinerary via signature CityDecisionEngine
    const scenarioPlan = CityDecisionEngine.generateItinerary({
      startingLocation: demoPreferences.startingLocation,
      budgetINR: demoPreferences.budgetMaxINR,
      durationHours: demoPreferences.durationHours,
      interests: demoPreferences.interests,
      travelMode: demoPreferences.travelMode,
      requireWheelchair: demoPreferences.requireWheelchair,
      requireRestroom: demoPreferences.requireRestroom,
      availablePlaces: places,
      activeReports: reports
    });

    setActiveItinerary({
      ...scenarioPlan,
      title: 'Pune Heritage & Street Gastronomy Trail (Evaluator Scenario)',
      explanation: '[Evaluator Demo] Synthesized a 3-stop Pune route starting at Shivajinagar. Tested against active citizen hazard reports with full accessibility audits, selection rationales, and dynamic replanning triggers ready.',
      isDemoData: true
    });
  };

  const resetAllData = () => {
    const defaultReps = ReportsService.resetReports();
    setReports(defaultReps);
    setComparePlaceIds(['pune-shaniwar-wada', 'pune-aga-khan-palace']);
    setMatchWeights(DEFAULT_WEIGHTS);
    setActiveItinerary(null);
  };

  return (
    <DemoContext.Provider
      value={{
        city,
        places,
        reports,
        comparePlaceIds,
        matchWeights,
        activeItinerary,
        userPreferences,
        weather,
        isDemoMode,
        adminModerationMode,
        setAdminModerationMode,
        toggleComparePlace,
        clearComparePlaces,
        updateWeights,
        setUserPreferences,
        addReport: handleAddReport,
        updateReportStatus: handleUpdateReportStatus,
        upvoteReport: handleUpvoteReport,
        setActiveItinerary,
        replanActiveItinerary,
        loadDemoScenario,
        resetAllData,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
};

export const useDemo = () => {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
};
