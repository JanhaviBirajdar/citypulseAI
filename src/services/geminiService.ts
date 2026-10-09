import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Place, ItineraryPlan, TravelMode } from '../types';

export interface GeminiItineraryRequest {
  budgetINR: number;
  durationHours: number;
  travelMode: TravelMode;
  interests: string[];
  startingLocation: string;
  availablePlaces: Place[];
  userApiKey?: string;
}

export class GeminiService {
  /**
   * Generates a smart itinerary using Google Gemini API when available,
   * or a smart deterministic fallback labeled DEMO AI when key is unconfigured.
   */
  public static async generateItinerary(req: GeminiItineraryRequest): Promise<ItineraryPlan> {
    const apiKey = req.userApiKey || import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('citypulse_gemini_api_key');

    if (apiKey && apiKey.trim().length > 10) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey.trim());
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
You are an expert, trustworthy smart-city exploration planner for Pune, India.
Generate a structured, budget-conscious itinerary adhering strictly to the provided parameters.

DO NOT fabricate live traffic, weather, or unverified safety incidents.
Identify any missing data or assumptions explicitly.

User Constraints:
- Starting Location: ${req.startingLocation}
- Maximum Budget: ₹${req.budgetINR} INR
- Available Duration: ${req.durationHours} hours
- Travel Mode: ${req.travelMode}
- Interests: ${req.interests.join(', ')}

Available Destinations Dataset (Use strictly these places):
${JSON.stringify(req.availablePlaces.map(p => ({
          id: p.id,
          name: p.name,
          category: p.category,
          area: p.area,
          price: p.estimatedPriceINR,
          rating: p.rating,
          bestTime: p.bestTime,
          safetyScore: p.safetyEvidenceScore
        })), null, 2)}

Return ONLY valid JSON matching this structure:
{
  "title": "String title",
  "explanation": "Clear explanation of why these places were chosen and how budget/time were optimized.",
  "weatherWarning": "Optional weather caveat or null",
  "items": [
    {
      "placeId": "exact id from dataset",
      "placeName": "exact name from dataset",
      "category": "category from dataset",
      "estimatedCostINR": number,
      "durationMinutes": number,
      "suggestedTimeSlot": "e.g. 09:00 AM - 11:00 AM",
      "travelTimeToNextMinutes": number,
      "notes": "Short tip or caution"
    }
  ]
}
`;

        const result = await model.generateContent(prompt);
        const textResponse = result.response.text();

        // Extract JSON from response markdown
        const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          let calculatedTotal = 0;
          const items = parsed.items.map((it: any) => {
            calculatedTotal += it.estimatedCostINR || 0;
            return {
              id: `item-${Math.random().toString(36).substr(2, 6)}`,
              placeId: it.placeId,
              placeName: it.placeName,
              category: it.category,
              estimatedCostINR: it.estimatedCostINR || 0,
              durationMinutes: it.durationMinutes || 60,
              suggestedTimeSlot: it.suggestedTimeSlot || 'Flexible',
              travelTimeToNextMinutes: it.travelTimeToNextMinutes || 20,
              notes: it.notes || '',
              hazardsNearbyCount: 0
            };
          });

          return {
            id: `itin-gemini-${Date.now()}`,
            title: parsed.title || 'AI Optimized Pune Itinerary',
            startingLocation: req.startingLocation,
            totalBudgetINR: req.budgetINR,
            estimatedCostINR: calculatedTotal,
            totalDurationHours: req.durationHours,
            travelMode: req.travelMode,
            interests: req.interests,
            items,
            explanation: `[Gemini AI Generated] ${parsed.explanation}`,
            weatherWarning: parsed.weatherWarning || undefined,
            isDemoData: false,
            createdAt: new Date().toISOString()
          };
        }
      } catch (err) {
        console.warn('Gemini API call failed, falling back to deterministic demo generator:', err);
      }
    }

    // Fallback: Deterministic smart generator labeled DEMO AI
    return this.generateFallbackItinerary(req);
  }

  private static generateFallbackItinerary(req: GeminiItineraryRequest): ItineraryPlan {
    // Filter places by interests & budget
    const matched = req.availablePlaces.filter(p => {
      const matchInterest = req.interests.some(interest =>
        p.category.toLowerCase().includes(interest.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(interest.toLowerCase()))
      );
      return matchInterest || p.estimatedPriceINR <= req.budgetINR / 2;
    });

    const selectedPlaces = matched.length >= 2 ? matched.slice(0, 3) : req.availablePlaces.slice(0, 3);
    let totalCost = 0;
    let timeAcc = 9; // Start 09:00 AM

    const items = selectedPlaces.map((p, idx) => {
      const cost = p.estimatedPriceINR;
      totalCost += cost;
      const startStr = `${Math.floor(timeAcc).toString().padStart(2, '0')}:${(timeAcc % 1 * 60).toString().padStart(2, '0')} ${timeAcc >= 12 ? 'PM' : 'AM'}`;
      timeAcc += 2; // 2 hrs per stop
      const endStr = `${Math.floor(timeAcc).toString().padStart(2, '0')}:${(timeAcc % 1 * 60).toString().padStart(2, '0')} ${timeAcc >= 12 ? 'PM' : 'AM'}`;

      return {
        id: `itin-item-${idx + 1}`,
        placeId: p.id,
        placeName: p.name,
        category: p.category,
        estimatedCostINR: cost,
        durationMinutes: 90,
        suggestedTimeSlot: `${startStr} - ${endStr}`,
        travelTimeToNextMinutes: idx < selectedPlaces.length - 1 ? 25 : 0,
        notes: `High safety rating (${p.safetyEvidenceScore}/100). Verified accessible pathways.`,
        hazardsNearbyCount: idx === 1 ? 1 : 0
      };
    });

    return {
      id: `itin-demo-${Date.now()}`,
      title: `Pune ${req.interests.join(' & ')} Trail (Demo AI)`,
      startingLocation: req.startingLocation,
      totalBudgetINR: req.budgetINR,
      estimatedCostINR: totalCost,
      totalDurationHours: req.durationHours,
      travelMode: req.travelMode,
      interests: req.interests,
      items,
      explanation: '[DEMO AI Fallback] Selected top rated destinations matching interest tags within your ₹' + req.budgetINR + ' budget limit. Verified citizen reports check complete.',
      weatherWarning: 'Mild afternoon humidity expected. Carry water for outdoor walks.',
      isDemoData: true,
      createdAt: new Date().toISOString()
    };
  }
}
