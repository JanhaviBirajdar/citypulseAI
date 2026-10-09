import { describe, it, expect } from 'vitest';
import { calculateCityMatch, DEFAULT_WEIGHTS } from '../services/scoringEngine';
import { DEMO_PLACES } from '../data/demoPlaces';

describe('ScoringEngine - Multi-Criteria Decision Framework', () => {
  const samplePlace = DEMO_PLACES[0]; // Shaniwar Wada

  it('calculates a bounded score between 0 and 100 with evidence breakdown', () => {
    const result = calculateCityMatch(samplePlace, 500, DEFAULT_WEIGHTS);

    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.evidenceCoverage).toBeGreaterThan(0);
    expect(result.breakdown.safetyScore).toBeDefined();
    expect(result.breakdown.affordabilityScore).toBeDefined();
    expect(result.breakdown.ratingScore).toBeDefined();
    expect(result.breakdown.accessibilityScore).toBeDefined();
  });

  it('adjusts match score sensitively when affordability or accessibility weights are amplified', () => {
    const accessibilityHeavyWeights = {
      safetyEvidence: 10,
      affordability: 10,
      ratings: 10,
      cleanliness: 10,
      accessibility: 60 // Heavily prioritize ramp & accessibility
    };

    const accessiblePlace = DEMO_PLACES.find(p => p.accessibility.wheelchairAccessible && p.accessibility.accessibleRestrooms)!;
    const nonAccessiblePlace = DEMO_PLACES.find(p => !p.accessibility.wheelchairAccessible)!;

    const accessibleScore = calculateCityMatch(accessiblePlace, 500, accessibilityHeavyWeights).score;
    const nonAccessibleScore = calculateCityMatch(nonAccessiblePlace, 500, accessibilityHeavyWeights).score;

    expect(accessibleScore).toBeGreaterThan(nonAccessibleScore);
  });

  it('penalizes affordability score heavily when cost exceeds user max budget', () => {
    const expensivePlace = DEMO_PLACES.find(p => p.estimatedPriceINR >= 400)!;
    const budgetFriendlyPlace = DEMO_PLACES.find(p => p.estimatedPriceINR <= 50)!;

    const lowBudget = 50; // User only has ₹50
    const expensiveResult = calculateCityMatch(expensivePlace, lowBudget, DEFAULT_WEIGHTS);
    const budgetResult = calculateCityMatch(budgetFriendlyPlace, lowBudget, DEFAULT_WEIGHTS);

    expect(budgetResult.breakdown.affordabilityScore).toBeGreaterThan(expensiveResult.breakdown.affordabilityScore);
  });
});
