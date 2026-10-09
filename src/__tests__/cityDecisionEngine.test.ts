import { describe, it, expect } from 'vitest';
import { CityDecisionEngine } from '../services/cityDecisionEngine';
import { DEMO_PLACES } from '../data/demoPlaces';
import { DEMO_REPORTS } from '../data/demoReports';

describe('CityDecisionEngine - Core Algorithm & Constraints', () => {
  it('generates a valid, sequenced itinerary adhering to budget and duration limits', () => {
    const plan = CityDecisionEngine.generateItinerary({
      startingLocation: 'Shivajinagar Station, Pune',
      budgetINR: 500,
      durationHours: 4.5,
      interests: ['Heritage', 'Culture', 'Food'],
      travelMode: 'Two-wheeler',
      availablePlaces: DEMO_PLACES,
      activeReports: DEMO_REPORTS
    });

    expect(plan.constraintCheck?.isSatisfied).toBe(true);
    expect(plan.items.length).toBeGreaterThanOrEqual(1);
    expect(plan.estimatedCostINR).toBeLessThanOrEqual(500);
    expect(plan.remainingBudgetINR).toBe(500 - plan.estimatedCostINR);
    expect(plan.items[0].suggestedTimeSlot).toMatch(/\d{2}:\d{2}\s+(AM|PM)/);
    expect(plan.selectionRationales).toBeDefined();
    expect(Object.keys(plan.selectionRationales!).length).toBe(plan.items.length);
  });

  it('rejects an impossible duration (< 1h) and returns actionable recommendations without hallucinating', () => {
    const plan = CityDecisionEngine.generateItinerary({
      startingLocation: 'Shivajinagar Station, Pune',
      budgetINR: 500,
      durationHours: 0.5, // 30 minutes is impossible for Pune cultural exploration
      interests: ['Heritage'],
      travelMode: 'Drive',
      availablePlaces: DEMO_PLACES
    });

    expect(plan.constraintCheck?.isSatisfied).toBe(false);
    expect(plan.items.length).toBe(0);
    expect(plan.constraintCheck?.unmetReason).toContain('too brief');
    expect(plan.constraintCheck?.suggestions).toBeDefined();
    expect(plan.constraintCheck!.suggestions!.length).toBeGreaterThanOrEqual(1);
  });

  it('enforces wheelchair accessibility constraints strictly when requested', () => {
    const plan = CityDecisionEngine.generateItinerary({
      startingLocation: 'Deccan Gymkhana, Pune',
      budgetINR: 600,
      durationHours: 5,
      interests: ['Heritage', 'Culture'],
      travelMode: 'Drive',
      requireWheelchair: true, // Only places with verified ramp access allowed
      availablePlaces: DEMO_PLACES
    });

    expect(plan.constraintCheck?.isSatisfied).toBe(true);
    // Every selected place must be wheelchair accessible
    plan.items.forEach(item => {
      const place = DEMO_PLACES.find(p => p.id === item.placeId);
      expect(place?.accessibility.wheelchairAccessible).toBe(true);
    });
  });

  it('provides runner-up alternative places with trade-off notes', () => {
    const plan = CityDecisionEngine.generateItinerary({
      startingLocation: 'Shivajinagar Station, Pune',
      budgetINR: 400,
      durationHours: 4,
      interests: ['Food', 'Heritage'],
      travelMode: 'Two-wheeler',
      availablePlaces: DEMO_PLACES
    });

    expect(plan.alternatives).toBeDefined();
    expect(plan.alternatives!.length).toBeGreaterThan(0);
    expect(plan.alternatives![0].tradeoffNote).toBeDefined();
    expect(plan.alternatives![0].recommendedIf).toBeDefined();
  });
});

describe('CityDecisionEngine - Dynamic Replanning Engine', () => {
  it('dynamically replans when a hazard disruption occurs and produces a clean audit diff', () => {
    // 1. Initial Plan
    const initialPlan = CityDecisionEngine.generateItinerary({
      startingLocation: 'Shivajinagar Station, Pune',
      budgetINR: 500,
      durationHours: 4.5,
      interests: ['Heritage', 'Food'],
      travelMode: 'Two-wheeler',
      availablePlaces: DEMO_PLACES
    });

    expect(initialPlan.items.length).toBeGreaterThan(0);

    // 2. Simulate Road Hazard blocking FC Road
    const replanned = CityDecisionEngine.replanItinerary(
      initialPlan,
      {
        type: 'HAZARD_EVENT',
        title: 'Severe Waterlogging on JM Road / FC Road',
        impactedPlaceId: 'pune-fc-road-food',
        description: 'Monsoon flooding blocks pedestrian lanes on FC Road'
      },
      DEMO_PLACES,
      DEMO_REPORTS
    );

    expect(replanned.replanningHistory).toBeDefined();
    expect(replanned.replanningHistory!.length).toBe(1);

    const diff = replanned.replanningHistory![0];
    expect(diff.triggerEvent).toBe('Severe Waterlogging on JM Road / FC Road');
    expect(diff.actionSummary).toBeDefined();
    // Blocked place must not be in the new itinerary
    expect(replanned.items.some(it => it.placeId === 'pune-fc-road-food')).toBe(false);
  });

  it('replans correctly when the user reduces their budget cap', () => {
    const initialPlan = CityDecisionEngine.generateItinerary({
      startingLocation: 'Shivajinagar Station, Pune',
      budgetINR: 650,
      durationHours: 4,
      interests: ['Food', 'Heritage'],
      travelMode: 'Drive',
      availablePlaces: DEMO_PLACES
    });

    // Simulate strict budget cut to ₹100
    const replanned = CityDecisionEngine.replanItinerary(
      initialPlan,
      {
        type: 'BUDGET_CUT',
        title: 'Budget Restricted to ₹100 INR',
        newBudgetINR: 100,
        description: 'User tightened budget constraints'
      },
      DEMO_PLACES,
      DEMO_REPORTS
    );

    expect(replanned.totalBudgetINR).toBe(100);
    expect(replanned.estimatedCostINR).toBeLessThanOrEqual(100);
    expect(replanned.replanningHistory!.length).toBeGreaterThan(0);
  });
});
