import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Place, ItineraryPlan, TravelMode, CitizenReport } from '../types';
import { CityDecisionEngine } from './cityDecisionEngine';

export interface GeminiItineraryRequest {
  budgetINR: number;
  durationHours: number;
  travelMode: TravelMode;
  interests: string[];
  startingLocation: string;
  availablePlaces: Place[];
  userApiKey?: string;
  requireWheelchair?: boolean;
  requireRestroom?: boolean;
  activeReports?: CitizenReport[];
}

export class GeminiService {
  /**
   * Generates a smart itinerary using Google Gemini API when available,
   * or delegates to the deterministic CityDecisionEngine when unconfigured.
   */
  public static async generateItinerary(req: GeminiItineraryRequest): Promise<ItineraryPlan> {
    // 1. Generate factual, constraint-checked base plan using the Decision Engine
    const factualBasePlan = CityDecisionEngine.generateItinerary({
      startingLocation: req.startingLocation,
      budgetINR: req.budgetINR,
      durationHours: req.durationHours,
      interests: req.interests,
      travelMode: req.travelMode,
      requireWheelchair: req.requireWheelchair,
      requireRestroom: req.requireRestroom,
      availablePlaces: req.availablePlaces,
      activeReports: req.activeReports
    });

    // If constraints are unsatisfied, return immediately with factual explanation
    if (!factualBasePlan.constraintCheck?.isSatisfied) {
      return factualBasePlan;
    }

    const apiKey = req.userApiKey || import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('citypulse_gemini_api_key');

    if (apiKey && apiKey.trim().length > 10) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey.trim());
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
You are an expert, trustworthy smart-city exploration planner for Pune, India.
Given the verified factual itinerary below, write a natural language explanation and contextual tips.

DO NOT invent fake places, fake prices, fake coordinates, or fabricated incidents.
Respect the factual constraints and stops provided.

User Constraints:
- Starting Location: ${req.startingLocation}
- Maximum Budget: ₹${req.budgetINR} INR
- Available Duration: ${req.durationHours} hours
- Travel Mode: ${req.travelMode}
- Interests: ${req.interests.join(', ')}

Factual Stops Planned:
${JSON.stringify(factualBasePlan.items.map(it => ({
  name: it.placeName,
  category: it.category,
  cost: it.estimatedCostINR,
  duration: it.durationMinutes,
  timeSlot: it.suggestedTimeSlot
})), null, 2)}

Return ONLY valid JSON matching this structure:
{
  "title": "Title for this journey",
  "explanation": "Natural language summary of why this flow is optimal for Pune city context.",
  "weatherWarning": "Brief weather advice (e.g. hydration, sunset timing)"
}
`;

        const result = await model.generateContent(prompt);
        const textResponse = result.response.text();
        const jsonMatch = textResponse.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            ...factualBasePlan,
            title: parsed.title || factualBasePlan.title,
            explanation: `[Gemini 1.5 Flash AI Synthesis] ${parsed.explanation}`,
            weatherWarning: parsed.weatherWarning || factualBasePlan.weatherWarning,
            isDemoData: false
          };
        }
      } catch (err) {
        console.warn('Gemini API call failed, falling back to deterministic CityDecisionEngine:', err);
      }
    }

    // Return the verified City Decision Engine plan (labeled Honest DEMO / DETERMINISTIC)
    return {
      ...factualBasePlan,
      explanation: `[Deterministic City Decision Engine] ${factualBasePlan.explanation}`
    };
  }
}
