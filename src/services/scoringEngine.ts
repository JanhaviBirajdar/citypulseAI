import type { Place, MatchWeights, CityMatchResult } from '../types';

export const DEFAULT_WEIGHTS: MatchWeights = {
  safetyEvidence: 30,
  affordability: 20,
  ratings: 20,
  cleanliness: 15,
  accessibility: 15,
};

/**
 * Calculates a preference-based decision score (0-100) for a place given custom or default weights.
 * Normalizes values and calculates explicit data confidence / evidence coverage.
 */
export function calculateCityMatch(
  place: Place,
  userBudgetMaxINR: number = 1000,
  weights: MatchWeights = DEFAULT_WEIGHTS
): CityMatchResult {
  // Normalize Weights to sum to 1.0
  const weightSum =
    (weights.safetyEvidence +
      weights.affordability +
      weights.ratings +
      weights.cleanliness +
      weights.accessibility) || 100;

  const wSafety = weights.safetyEvidence / weightSum;
  const wAfford = weights.affordability / weightSum;
  const wRating = weights.ratings / weightSum;
  const wClean = weights.cleanliness / weightSum;
  const wAccess = weights.accessibility / weightSum;

  // 1. Safety Evidence Score (0-100)
  const safetyScore = Math.min(100, Math.max(0, place.safetyEvidenceScore));

  // 2. Affordability Score (0-100)
  // Higher score if cost is well below user budget, lower if exceeds
  let affordabilityScore = 100;
  if (place.estimatedPriceINR > userBudgetMaxINR) {
    const ratio = place.estimatedPriceINR / userBudgetMaxINR;
    affordabilityScore = Math.max(10, Math.round(100 / ratio));
  } else if (userBudgetMaxINR > 0) {
    // If within budget, score based on budget friendliness
    affordabilityScore = Math.min(100, 50 + Math.round(((userBudgetMaxINR - place.estimatedPriceINR) / userBudgetMaxINR) * 50));
  }

  // 3. Rating Score (0-100) -> 5.0 rating = 100
  const ratingScore = Math.min(100, Math.round((place.rating / 5) * 100));

  // 4. Cleanliness Score (0-100)
  const cleanlinessScore = Math.min(100, Math.max(0, place.cleanlinessScore));

  // 5. Accessibility Score (0-100)
  let accessibilityScore = 30; // base score
  if (place.accessibility.wheelchairAccessible) accessibilityScore += 25;
  if (place.accessibility.rampAvailable) accessibilityScore += 15;
  if (place.accessibility.accessibleRestrooms) accessibilityScore += 15;
  if (place.accessibility.audioAssistance || place.accessibility.brailleSignage) accessibilityScore += 15;
  accessibilityScore = Math.min(100, accessibilityScore);

  // Calculate Weighted Total Score
  const rawScore =
    safetyScore * wSafety +
    affordabilityScore * wAfford +
    ratingScore * wRating +
    cleanlinessScore * wClean +
    accessibilityScore * wAccess;

  const finalScore = Math.min(100, Math.max(0, Math.round(rawScore)));

  // Missing data notes & recommendation rationale
  const missingNotes: string[] = [];
  if (!place.accessibility.brailleSignage && !place.accessibility.audioAssistance) {
    missingNotes.push('Limited sensory accessibility data');
  }
  if (place.evidenceCoverage < 85) {
    missingNotes.push('Moderate citizen evidence volume around this location');
  }

  let rationale = `Strong match based on high safety index (${safetyScore}/100) and user rating (${place.rating}/5).`;
  if (affordabilityScore > 85) {
    rationale += ` Fits comfortably within ₹${userBudgetMaxINR} max budget (Est. ₹${place.estimatedPriceINR}).`;
  }

  return {
    placeId: place.id,
    score: finalScore,
    evidenceCoverage: place.evidenceCoverage,
    breakdown: {
      safetyScore,
      affordabilityScore,
      ratingScore,
      cleanlinessScore,
      accessibilityScore,
    },
    recommendationReason: rationale,
    missingDataNotes: missingNotes,
  };
}
