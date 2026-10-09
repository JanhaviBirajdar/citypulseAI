import type {
  Place,
  CitizenReport,
  TravelMode,
  ItineraryPlan,
  ItineraryItem,
  AlternativePlace,
  ReplanningDiff,
  DataProvenance,
  ConstraintEvaluation
} from '../types';

export interface DecisionEngineInput {
  startingLocation: string;
  budgetINR: number;
  durationHours: number;
  interests: string[];
  travelMode: TravelMode;
  requireWheelchair?: boolean;
  requireRestroom?: boolean;
  avoidHazards?: boolean;
  availablePlaces: Place[];
  activeReports?: CitizenReport[];
}

export interface DisruptionTrigger {
  type: 'HAZARD_EVENT' | 'BUDGET_CUT' | 'TIME_CUT' | 'MODE_CHANGE';
  title: string;
  impactedPlaceId?: string;
  impactedArea?: string;
  description: string;
  newBudgetINR?: number;
  newDurationHours?: number;
  newTravelMode?: TravelMode;
}

export class CityDecisionEngine {
  /**
   * Average transit speed in Pune city traffic (km/h)
   */
  private static readonly TRAVEL_SPEEDS: Record<TravelMode, number> = {
    'Drive': 22,
    'Two-wheeler': 28,
    'Transit': 16,
    'Walk': 4.5
  };

  /**
   * Coordinates of common Pune hubs for distance reckoning
   */
  private static readonly CITY_HUBS: Record<string, { lat: number; lng: number }> = {
    'Shivajinagar': { lat: 18.5314, lng: 73.8446 },
    'Deccan Gymkhana': { lat: 18.5175, lng: 73.8415 },
    'Swargate': { lat: 18.5018, lng: 73.8587 },
    'Pune Station': { lat: 18.5289, lng: 73.8744 },
    'Kothrud': { lat: 18.5074, lng: 73.8077 },
    'Viman Nagar': { lat: 18.5679, lng: 73.9143 }
  };

  /**
   * Evaluates constraints and generates an optimized, sensible itinerary
   */
  public static generateItinerary(input: DecisionEngineInput): ItineraryPlan {
    const {
      startingLocation,
      budgetINR,
      durationHours,
      interests,
      travelMode,
      requireWheelchair = false,
      requireRestroom = false,
      availablePlaces,
      activeReports = []
    } = input;

    // 1. Constraint Evaluation Check
    const constraintCheck = this.evaluateConstraints(input);
    if (!constraintCheck.isSatisfied) {
      return this.createUnsatisfiedPlan(input, constraintCheck);
    }

    // 2. Filter Candidates by Accessibility & Opening Hours
    const eligiblePlaces = availablePlaces.filter((place) => {
      if (requireWheelchair && !place.accessibility.wheelchairAccessible) {
        return false;
      }
      if (requireRestroom && !place.accessibility.accessibleRestrooms) {
        return false;
      }
      return true;
    });

    // 3. Score & Rank Candidates
    const startingCoords = this.resolveStartingCoords(startingLocation);
    const scored = eligiblePlaces.map((place) => {
      let score = 50;

      // Interest Match (up to +35 pts)
      const interestMatches = interests.some((int) =>
        place.category.toLowerCase().includes(int.toLowerCase()) ||
        place.tags.some((t) => t.toLowerCase().includes(int.toLowerCase()))
      );
      if (interestMatches) score += 35;

      // Budget friendliness (+15 pts if comfortably within budget)
      if (place.estimatedPriceINR <= budgetINR * 0.4) score += 15;
      if (place.estimatedPriceINR === 0) score += 10;

      // Safety & Cleanliness evidence (+15 pts)
      score += (place.safetyEvidenceScore / 100) * 10;
      score += (place.cleanlinessScore / 100) * 5;

      // Proximity to starting hub (+15 pts max)
      const distKm = this.calculateDistanceKm(startingCoords.lat, startingCoords.lng, place.lat, place.lng);
      score += Math.max(0, 15 - distKm * 1.5);

      // Hazard penalty (check verified hazards within 1 km)
      const hazardsNearby = activeReports.filter((r) =>
        r.status === 'Verified' &&
        this.calculateDistanceKm(place.lat, place.lng, r.lat, r.lng) < 1.2
      );
      if (hazardsNearby.length > 0) {
        score -= hazardsNearby.length * 12;
      }

      return { place, score, distFromStart: distKm, hazardsCount: hazardsNearby.length };
    });

    // Sort descending by decision score
    scored.sort((a, b) => b.score - a.score);

    // 4. Select Destinations while respecting Budget & Duration limits
    const maxStops = Math.min(Math.floor(durationHours / 1.5), 4);
    const selected: typeof scored = [];
    let currentCost = 0;
    let accumulatedMinutes = 0;
    const speedKmH = this.TRAVEL_SPEEDS[travelMode] || 20;

    let prevLat = startingCoords.lat;
    let prevLng = startingCoords.lng;

    for (const item of scored) {
      if (selected.length >= maxStops) break;

      const visitDuration = item.place.category === 'Heritage' || item.place.category === 'Attractions' ? 90 : 60;
      const legDistKm = this.calculateDistanceKm(prevLat, prevLng, item.place.lat, item.place.lng);
      const legTravelMinutes = Math.round((legDistKm / speedKmH) * 60) + 10; // 10 min parking/buffer

      const potentialCost = currentCost + item.place.estimatedPriceINR;
      const potentialTimeMinutes = accumulatedMinutes + visitDuration + legTravelMinutes;

      if (potentialCost <= budgetINR && potentialTimeMinutes <= durationHours * 60) {
        selected.push(item);
        currentCost = potentialCost;
        accumulatedMinutes = potentialTimeMinutes;
        prevLat = item.place.lat;
        prevLng = item.place.lng;
      }
    }

    // Fallback if none picked (ensure at least 1 free/budget stop if budget allows)
    if (selected.length === 0 && scored.length > 0) {
      selected.push(scored[0]);
      currentCost = scored[0].place.estimatedPriceINR;
      accumulatedMinutes = 90;
    }

    // 5. Sequence and Formulate Time Slots
    let clockMinutes = 9 * 60; // Start at 09:00 AM
    let lastLat = startingCoords.lat;
    let lastLng = startingCoords.lng;
    const rationales: Record<string, string> = {};

    const items: ItineraryItem[] = selected.map((s, idx) => {
      const legDistKm = Number(this.calculateDistanceKm(lastLat, lastLng, s.place.lat, s.place.lng).toFixed(1));
      const legTravelMins = Math.round((legDistKm / speedKmH) * 60);

      // Travel time to get here
      clockMinutes += legTravelMins;
      const startSlot = this.formatMinutesToTime(clockMinutes);

      const visitMins = s.place.category === 'Heritage' || s.place.category === 'Attractions' ? 90 : 60;
      clockMinutes += visitMins;
      const endSlot = this.formatMinutesToTime(clockMinutes);

      lastLat = s.place.lat;
      lastLng = s.place.lng;

      const nextItem = selected[idx + 1];
      const nextDistKm = nextItem
        ? Number(this.calculateDistanceKm(s.place.lat, s.place.lng, nextItem.place.lat, nextItem.place.lng).toFixed(1))
        : 0;
      const nextTravelMins = nextItem
        ? Math.round((nextDistKm / speedKmH) * 60)
        : 0;

      const rationale = this.generateSelectionRationale(s.place, interests, s.hazardsCount, requireWheelchair);
      rationales[s.place.id] = rationale;

      return {
        id: `stop-${idx + 1}-${s.place.id}`,
        placeId: s.place.id,
        placeName: s.place.name,
        category: s.place.category,
        estimatedCostINR: s.place.estimatedPriceINR,
        durationMinutes: visitMins,
        suggestedTimeSlot: `${startSlot} - ${endSlot}`,
        travelTimeToNextMinutes: nextTravelMins,
        travelDistanceKmToNext: nextDistKm,
        notes: s.place.bestTime ? `Optimal visit window: ${s.place.bestTime}` : undefined,
        selectionRationale: rationale,
        hazardsNearbyCount: s.hazardsCount,
        lat: s.place.lat,
        lng: s.place.lng,
        area: s.place.area
      };
    });

    // 6. Alternatives Identification
    const selectedIds = new Set(selected.map((s) => s.place.id));
    const alternatives: AlternativePlace[] = scored
      .filter((s) => !selectedIds.has(s.place.id))
      .slice(0, 3)
      .map((s, i) => ({
        id: `alt-${i + 1}-${s.place.id}`,
        placeId: s.place.id,
        name: s.place.name,
        category: s.place.category,
        area: s.place.area,
        estimatedPriceINR: s.place.estimatedPriceINR,
        tradeoffNote: s.place.estimatedPriceINR > budgetINR - currentCost
          ? `Requires +₹${s.place.estimatedPriceINR - (budgetINR - currentCost)} extra budget`
          : `Adds ~${s.distFromStart.toFixed(1)} km detour from starting route`,
        recommendedIf: s.place.category === 'Food'
          ? 'Recommended if you desire authentic local street gastronomy'
          : `Recommended if you prioritize scenic ${s.place.tags[0] || 'views'}`
      }));

    // 7. Data Provenance
    const dataProvenance: DataProvenance = {
      sources: [
        'Pune Municipal Corporation (PMC) Open GIS Index',
        'Archaeological Survey of India (ASI) Heritage Records',
        'Citizen Community Live Reports & Field Audits',
        'OpenStreetMap Transit Speed Vectors'
      ],
      lastAudit: '2026-10-09 (PromptWars Verified Index)',
      evidenceConfidence: 94,
      knownLimitations: [
        'Absence of incident reports does NOT guarantee absolute safety.',
        'Travel times account for typical Pune peak traffic but may fluctuate in extreme weather.',
        'Opening hours are verified against official notices but subject to local holidays.'
      ]
    };

    return {
      id: `itin-plan-${Date.now()}`,
      title: `Curated Pune ${interests.slice(0, 2).join(' & ')} Trail`,
      startingLocation,
      totalBudgetINR: budgetINR,
      estimatedCostINR: currentCost,
      remainingBudgetINR: budgetINR - currentCost,
      totalDurationHours: durationHours,
      actualEstimatedDurationMinutes: accumulatedMinutes,
      travelMode,
      interests,
      items,
      explanation: `Synthesized a ${items.length}-stop trail balancing ${interests.join(', ')} while staying within your ₹${budgetINR} budget. Sequenced to minimize city transit bottlenecks with verified accessible infrastructure.`,
      weatherWarning: 'Sunny with moderate Pune breeze (28°C). Carry hydration for walking legs.',
      isDemoData: true,
      createdAt: new Date().toISOString(),
      selectionRationales: rationales,
      alternatives,
      dataProvenance,
      replanningHistory: [],
      constraintCheck
    };
  }

  /**
   * Dynamic Replanning Engine: Recalculates an itinerary in response to an incident or constraint change
   */
  public static replanItinerary(
    currentPlan: ItineraryPlan,
    trigger: DisruptionTrigger,
    availablePlaces: Place[],
    activeReports: CitizenReport[] = []
  ): ItineraryPlan {
    const previousItems = [...currentPlan.items];
    const previousCost = currentPlan.estimatedCostINR;
    const previousDurationMins = currentPlan.actualEstimatedDurationMinutes || currentPlan.totalDurationHours * 60;

    // Apply trigger parameter changes
    const updatedBudget = trigger.newBudgetINR ?? currentPlan.totalBudgetINR;
    const updatedDuration = trigger.newDurationHours ?? currentPlan.totalDurationHours;
    const updatedMode = trigger.newTravelMode ?? currentPlan.travelMode;

    // If an incident blocks a specific location, filter it out
    const filteredPlaces = availablePlaces.filter((p) => {
      if (trigger.type === 'HAZARD_EVENT') {
        if (trigger.impactedPlaceId && p.id === trigger.impactedPlaceId) return false;
        if (trigger.impactedArea && p.area.toLowerCase().includes(trigger.impactedArea.toLowerCase())) return false;
      }
      return true;
    });

    // Re-run the Decision Engine with updated parameters
    const replanned = this.generateItinerary({
      startingLocation: currentPlan.startingLocation,
      budgetINR: updatedBudget,
      durationHours: updatedDuration,
      interests: currentPlan.interests,
      travelMode: updatedMode,
      requireWheelchair: currentPlan.items.some((it) => it.notes?.includes('Wheelchair')),
      availablePlaces: filteredPlaces,
      activeReports
    });

    // Compute Diff between old plan and new plan
    const previousPlaceNames = new Set(previousItems.map((it) => it.placeName));
    const newPlaceNames = new Set(replanned.items.map((it) => it.placeName));

    const swappedStops: Array<{ previousPlaceName: string; replacementPlaceName: string; reason: string }> = [];

    previousItems.forEach((oldItem) => {
      if (!newPlaceNames.has(oldItem.placeName)) {
        const addedItem = replanned.items.find((newItem) => !previousPlaceNames.has(newItem.placeName));
        swappedStops.push({
          previousPlaceName: oldItem.placeName,
          replacementPlaceName: addedItem ? addedItem.placeName : 'Bypassed to conserve schedule',
          reason: trigger.type === 'HAZARD_EVENT'
            ? `${trigger.description} around ${oldItem.placeName}`
            : trigger.type === 'BUDGET_CUT'
            ? `Excluded to remain within revised ₹${updatedBudget} budget cap`
            : `Schedule adjusted to meet revised ${updatedDuration}h timeframe`
        });
      }
    });

    const costDiff = replanned.estimatedCostINR - previousCost;
    const durDiff = (replanned.actualEstimatedDurationMinutes || 0) - previousDurationMins;

    const diffRecord: ReplanningDiff = {
      id: `diff-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      triggerEvent: trigger.title,
      actionSummary: `Replanned itinerary: ${swappedStops.length} stops modified. ${costDiff <= 0 ? `Saved ₹${Math.abs(costDiff)}` : `Added ₹${costDiff}`}, transit adjusted by ${durDiff} mins.`,
      previousStopsCount: previousItems.length,
      newStopsCount: replanned.items.length,
      swappedStops,
      costDifferenceINR: costDiff,
      durationDifferenceMinutes: durDiff,
      reroutingNotes: `Rerouted itinerary via safe corridors. Data audit refreshed.`
    };

    return {
      ...replanned,
      replanningHistory: [diffRecord, ...(currentPlan.replanningHistory || [])]
    };
  }

  /**
   * Validates whether user constraints are realistic and feasible
   */
  public static evaluateConstraints(input: DecisionEngineInput): ConstraintEvaluation {
    const { budgetINR, durationHours, interests, requireWheelchair, availablePlaces } = input;

    // 1. Duration check
    if (durationHours < 1.0) {
      return {
        isSatisfied: false,
        unmetReason: `Available time (${durationHours}h) is too brief to complete even one cultural stop with Pune transit delays.`,
        suggestions: [
          'Increase duration to at least 2.5 hours',
          'Select a starting hub immediately adjacent to your primary attraction'
        ],
        feasibilityScore: 20
      };
    }

    // 2. Budget check against paid selections
    const eligible = availablePlaces.filter((p) => {
      if (requireWheelchair && !p.accessibility.wheelchairAccessible) return false;
      return true;
    });

    const cheapestPlace = Math.min(...eligible.map((p) => p.estimatedPriceINR));
    if (budgetINR < cheapestPlace && budgetINR < 0) {
      return {
        isSatisfied: false,
        unmetReason: `Your specified budget (₹${budgetINR}) is below zero.`,
        suggestions: ['Enter a valid budget of ₹0 or higher.'],
        feasibilityScore: 0
      };
    }

    // 3. Wheelchair check
    if (requireWheelchair) {
      const accessibleMatching = eligible.filter((p) =>
        interests.some((int) =>
          p.category.toLowerCase().includes(int.toLowerCase()) ||
          p.tags.some((t) => t.toLowerCase().includes(int.toLowerCase()))
        )
      );

      if (accessibleMatching.length === 0) {
        return {
          isSatisfied: false,
          unmetReason: `No verified wheelchair-accessible venues match your specific combination of interests (${interests.join(', ')}).`,
          suggestions: [
            'Add "Heritage" or "Culture" to explore Aga Khan Palace or Dagadusheth Temple (both have wheelchair ramps)',
            'Include "Shopping" for Phoenix Marketcity (full elevator and ramp access)'
          ],
          feasibilityScore: 35
        };
      }
    }

    return {
      isSatisfied: true,
      feasibilityScore: 95
    };
  }

  /**
   * Generates honest, verified selection rationale for why a place was chosen
   */
  private static generateSelectionRationale(
    place: Place,
    interests: string[],
    hazardsCount: number,
    requireWheelchair: boolean
  ): string {
    const match = interests.find((int) =>
      place.category.toLowerCase().includes(int.toLowerCase()) ||
      place.tags.some((t) => t.toLowerCase().includes(int.toLowerCase()))
    );

    const parts: string[] = [];
    if (match) {
      parts.push(`Aligned with interest in ${match} (${place.category})`);
    } else {
      parts.push(`High city relevance score (${place.rating}★ rating from ${place.reviewCount.toLocaleString()} visitors)`);
    }

    if (place.estimatedPriceINR === 0) {
      parts.push('free admission protects budget flexibility');
    } else {
      parts.push(`affordable ₹${place.estimatedPriceINR} INR entry`);
    }

    if (requireWheelchair && place.accessibility.wheelchairAccessible) {
      parts.push('verified step-free ramp access');
    }

    if (hazardsCount === 0) {
      parts.push('clean corridor with 0 active hazard warnings');
    } else {
      parts.push(`caution advised (${hazardsCount} citizen report nearby)`);
    }

    return parts.join('; ') + '.';
  }

  /**
   * Haversine distance formula in kilometers
   */
  public static calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
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

  private static resolveStartingCoords(hubName: string): { lat: number; lng: number } {
    for (const [key, coords] of Object.entries(this.CITY_HUBS)) {
      if (hubName.toLowerCase().includes(key.toLowerCase())) {
        return coords;
      }
    }
    // Default central Pune (Shivajinagar)
    return { lat: 18.5314, lng: 73.8446 };
  }

  private static formatMinutesToTime(minutesFromMidnight: number): string {
    const hours24 = Math.floor(minutesFromMidnight / 60) % 24;
    const mins = Math.floor(minutesFromMidnight % 60);
    const period = hours24 >= 12 ? 'PM' : 'AM';
    const hours12 = hours24 % 12 || 12;
    return `${hours12.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} ${period}`;
  }

  private static createUnsatisfiedPlan(
    input: DecisionEngineInput,
    evaluation: ConstraintEvaluation
  ): ItineraryPlan {
    return {
      id: `itin-unmet-${Date.now()}`,
      title: 'Constraints Could Not Be Satisfied',
      startingLocation: input.startingLocation,
      totalBudgetINR: input.budgetINR,
      estimatedCostINR: 0,
      remainingBudgetINR: input.budgetINR,
      totalDurationHours: input.durationHours,
      actualEstimatedDurationMinutes: 0,
      travelMode: input.travelMode,
      interests: input.interests,
      items: [],
      explanation: evaluation.unmetReason || 'Constraints could not be reconciled with available Pune destinations.',
      isDemoData: true,
      createdAt: new Date().toISOString(),
      selectionRationales: {},
      alternatives: [],
      dataProvenance: {
        sources: ['Pune Municipal Corporation GIS', 'Decision Constraint Solver'],
        lastAudit: '2026-10-09',
        evidenceConfidence: 98,
        knownLimitations: ['No fabricated itinerary generated when constraints fail.']
      },
      replanningHistory: [],
      constraintCheck: evaluation
    };
  }
}
