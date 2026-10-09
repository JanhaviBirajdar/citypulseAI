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

interface UserPreferences {
  budgetMaxINR: number;
  interests: string[];
  travelMode: TravelMode;
  startingLocation: string;
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
    interests: ['Food', 'Heritage', 'Culture', 'Photography'],
    travelMode: 'Drive',
    startingLocation: 'Deccan Gymkhana, Pune'
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

  // Hackathon Demo Scenario 1-Click Trigger
  const loadDemoScenario = () => {
    setUserPreferences({
      budgetMaxINR: 500,
      interests: ['Food', 'Heritage', 'Culture', 'Photography'],
      travelMode: 'Drive',
      startingLocation: 'Deccan Gymkhana, Pune'
    });

    setComparePlaceIds(['pune-shaniwar-wada', 'pune-aga-khan-palace', 'pune-fc-road-food']);

    // Set sample pre-generated itinerary
    setActiveItinerary({
      id: 'demo-scenario-itin',
      title: 'Pune Heritage & Culinary Trail (Hackathon Demo)',
      startingLocation: 'Deccan Gymkhana, Pune',
      totalBudgetINR: 500,
      estimatedCostINR: 225,
      totalDurationHours: 6,
      travelMode: 'Drive',
      interests: ['Food', 'Heritage', 'Photography'],
      items: [
        {
          id: 'sc-1',
          placeId: 'pune-shaniwar-wada',
          placeName: 'Shaniwar Wada',
          category: 'Heritage',
          estimatedCostINR: 25,
          durationMinutes: 90,
          suggestedTimeSlot: '09:00 AM - 10:30 AM',
          travelTimeToNextMinutes: 15,
          notes: 'Visit Dilli Darwaja and courtyard lawns. Wheelchair ramp available.',
          hazardsNearbyCount: 1
        },
        {
          id: 'sc-2',
          placeId: 'pune-dagadusheth-temple',
          placeName: 'Shreemant Dagadusheth Halwai Temple',
          category: 'Culture',
          estimatedCostINR: 0,
          durationMinutes: 45,
          suggestedTimeSlot: '10:45 AM - 11:30 AM',
          travelTimeToNextMinutes: 20,
          notes: 'Free entry. Dedicated senior/disability darshan lane.',
          hazardsNearbyCount: 0
        },
        {
          id: 'sc-3',
          placeId: 'pune-fc-road-food',
          placeName: 'FC Road Street Food Trail',
          category: 'Food',
          estimatedCostINR: 200,
          durationMinutes: 90,
          suggestedTimeSlot: '12:00 PM - 01:30 PM',
          travelTimeToNextMinutes: 0,
          notes: 'Enjoy SPDP and Filter Coffee at Hotel Vaishali (FC Road). Note: Pothole report logged nearby at Goodluck Chowk.',
          hazardsNearbyCount: 1
        }
      ],
      explanation: '[Demo Scenario] Optimized 3-stop Pune route within ₹500 budget. SafeRoute Lens flagged 1 road hazard near FC Road (rep-001: Pothole on Goodluck Chowk), providing alternate pedestrian route guidance.',
      weatherWarning: 'Sunny with mild evening breeze. Ideal for morning heritage tour.',
      isDemoData: true,
      createdAt: new Date().toISOString()
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
