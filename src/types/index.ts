export type PlaceCategory = 
  | 'Attractions' 
  | 'Food' 
  | 'Heritage' 
  | 'Hotels' 
  | 'Parks' 
  | 'Budget Friendly' 
  | 'Shopping' 
  | 'Culture';

export type VerificationStatus = 
  | 'Unverified' 
  | 'Under Review' 
  | 'Verified' 
  | 'Rejected' 
  | 'Expired';

export type ReportCategory = 
  | 'Road hazard' 
  | 'Accident' 
  | 'Traffic disruption' 
  | 'Flooding or waterlogging' 
  | 'Cleanliness concern' 
  | 'Accessibility problem' 
  | 'Public infrastructure issue' 
  | 'Other city concern';

export type TravelMode = 'Drive' | 'Walk' | 'Transit' | 'Two-wheeler';

export interface AccessibilityInfo {
  wheelchairAccessible: boolean;
  rampAvailable: boolean;
  brailleSignage: boolean;
  accessibleRestrooms: boolean;
  audioAssistance: boolean;
  notes?: string;
}

export interface Place {
  id: string;
  name: string;
  category: PlaceCategory;
  area: string;
  lat: number;
  lng: number;
  rating: number; // 1-5
  reviewCount: number;
  ratingSource: string;
  estimatedPriceINR: number;
  priceLevel: 'Free' | 'Budget (₹)' | 'Moderate (₹₹)' | 'Premium (₹₹₹)';
  openingHours: string;
  accessibility: AccessibilityInfo;
  cleanlinessScore: number; // 0-100 based on evidence
  safetyEvidenceScore: number; // 0-100 based on verified reports & lighting/infrastructure
  evidenceCoverage: number; // 0-100% confidence level of available data
  imageUrl: string;
  description: string;
  tags: string[];
  bestTime: string;
  facilities: string[];
  dataSource: string;
  lastUpdated: string;
  isDemoData: boolean;
  googleMapsUrl?: string;
  wikiUrl?: string;
  officialUrl?: string;
  address?: string;
}

export interface CitizenReport {
  id: string;
  category: ReportCategory;
  title: string;
  description: string;
  locationName: string;
  lat: number;
  lng: number;
  timestamp: string;
  status: VerificationStatus;
  upvotes: number;
  reporterAlias: string; // Anonymous or pseudonym
  imageUrl?: string;
  additionalContext?: string;
  isDemoData: boolean;
}

export interface MatchWeights {
  safetyEvidence: number; // e.g. 30%
  affordability: number;   // e.g. 20%
  ratings: number;         // e.g. 20%
  cleanliness: number;     // e.g. 15%
  accessibility: number;   // e.g. 15%
}

export interface CityMatchResult {
  placeId: string;
  score: number; // 0 - 100
  evidenceCoverage: number; // 0 - 100%
  breakdown: {
    safetyScore: number;
    affordabilityScore: number;
    ratingScore: number;
    cleanlinessScore: number;
    accessibilityScore: number;
  };
  recommendationReason: string;
  missingDataNotes: string[];
}

export interface RouteOption {
  id: string;
  name: string;
  distanceKm: number;
  estimatedMinutes: number;
  travelMode: TravelMode;
  reportedHazardsCount: number;
  hazardsEnRoute: CitizenReport[];
  safetyConfidence: 'High' | 'Moderate' | 'Low (Data Gap)';
  description: string;
  coordinates: [number, number][];
  isRecommended: boolean;
}

export interface ItineraryItem {
  id: string;
  placeId: string;
  placeName: string;
  category: PlaceCategory;
  estimatedCostINR: number;
  durationMinutes: number;
  suggestedTimeSlot: string;
  travelTimeToNextMinutes?: number;
  notes?: string;
  hazardsNearbyCount: number;
}

export interface ItineraryPlan {
  id: string;
  title: string;
  startingLocation: string;
  totalBudgetINR: number;
  estimatedCostINR: number;
  totalDurationHours: number;
  travelMode: TravelMode;
  interests: string[];
  items: ItineraryItem[];
  explanation: string;
  weatherWarning?: string;
  isDemoData: boolean;
  createdAt: string;
}

export interface WeatherSummary {
  temperatureC: number;
  condition: string;
  humidity: number;
  aqi: number;
  aqiStatus: 'Good' | 'Moderate' | 'Poor';
  lastUpdated: string;
  isDemoData: boolean;
}
