import React, { useState } from 'react';
import {
  Route,
  Sparkles,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { useDemo } from '../context/DemoContext';
import { GeminiService } from '../services/geminiService';
import type { TravelMode } from '../types';
import { DemoBadge } from '../components/ui/DemoBadge';

export const SmartItinerary: React.FC = () => {
  const {
    places,
    userPreferences,
    setUserPreferences,
    activeItinerary,
    setActiveItinerary
  } = useDemo();

  const [isGenerating, setIsGenerating] = useState(false);

  const availableInterests = ['Food', 'History', 'Culture', 'Nature', 'Shopping', 'Family Activities', 'Photography'];

  const toggleInterest = (interest: string) => {
    setUserPreferences(prev => {
      const exists = prev.interests.includes(interest);
      const updated = exists ? prev.interests.filter(i => i !== interest) : [...prev.interests, interest];
      return { ...prev, interests: updated };
    });
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const plan = await GeminiService.generateItinerary({
        budgetINR: userPreferences.budgetMaxINR,
        durationHours: 6,
        travelMode: userPreferences.travelMode,
        interests: userPreferences.interests,
        startingLocation: userPreferences.startingLocation,
        availablePlaces: places
      });
      setActiveItinerary(plan);
    } catch (err) {
      console.error('Failed to generate itinerary', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const removeItem = (itemId: string) => {
    if (!activeItinerary) return;
    const updatedItems = activeItinerary.items.filter(it => it.id !== itemId);
    const newCost = updatedItems.reduce((acc, item) => acc + item.estimatedCostINR, 0);
    setActiveItinerary({
      ...activeItinerary,
      items: updatedItems,
      estimatedCostINR: newCost
    });
  };

  const addPlaceToItinerary = (placeId: string) => {
    if (!activeItinerary) return;
    const place = places.find(p => p.id === placeId);
    if (!place) return;

    const newItem = {
      id: `item-${Date.now()}`,
      placeId: place.id,
      placeName: place.name,
      category: place.category,
      estimatedCostINR: place.estimatedPriceINR,
      durationMinutes: 90,
      suggestedTimeSlot: 'Flexible',
      notes: 'Manually added to trail.',
      hazardsNearbyCount: 0
    };

    const updated = [...activeItinerary.items, newItem];
    const newCost = updated.reduce((acc, i) => acc + i.estimatedCostINR, 0);
    setActiveItinerary({
      ...activeItinerary,
      items: updated,
      estimatedCostINR: newCost
    });
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-violet-100 text-[#6344e7] border border-violet-200 text-xs font-black uppercase">
              AI ITINERARY BUILDER
            </span>
            <DemoBadge label="GEMINI INTEGRATED" size="sm" />
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Route className="w-7 h-7 text-[#6344e7]" /> Smart Itinerary Planner
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Build a personalized, budget-conscious Pune journey with automated cost calculations, travel timing, and safety check overlays.
          </p>
        </div>
      </div>

      {/* Inputs Bar Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#6344e7]" /> Journey Preferences & Constraints
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Starting Location */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Starting Hub</label>
            <input
              type="text"
              value={userPreferences.startingLocation}
              onChange={(e) => setUserPreferences(prev => ({ ...prev, startingLocation: e.target.value }))}
              className="w-full bg-slate-50 text-slate-900 text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:bg-white focus:border-[#6344e7] focus:outline-none"
            />
          </div>

          {/* Maximum Budget Slider */}
          <div>
            <div className="flex items-center justify-between font-bold mb-1">
              <span className="text-slate-700">Max Budget Limit:</span>
              <span className="text-[#0d9488] font-black">₹{userPreferences.budgetMaxINR} INR</span>
            </div>
            <input
              type="range"
              min="100"
              max="2000"
              step="50"
              value={userPreferences.budgetMaxINR}
              onChange={(e) => setUserPreferences(prev => ({ ...prev, budgetMaxINR: Number(e.target.value) }))}
              className="w-full accent-[#0d9488] mt-1"
            />
          </div>

          {/* Travel Mode */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Travel Mode</label>
            <select
              value={userPreferences.travelMode}
              onChange={(e) => setUserPreferences(prev => ({ ...prev, travelMode: e.target.value as TravelMode }))}
              className="w-full bg-slate-50 text-slate-900 text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:bg-white focus:border-[#6344e7] focus:outline-none font-bold cursor-pointer"
            >
              <option value="Drive">Drive (Car/Cab)</option>
              <option value="Two-wheeler">Two-wheeler (Bike)</option>
              <option value="Walk">Walk</option>
              <option value="Transit">Public Transit</option>
            </select>
          </div>

          {/* Generate Action CTA */}
          <div className="flex items-end">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#6344e7] to-indigo-600 hover:from-indigo-600 hover:to-[#6344e7] text-white font-bold text-xs shadow-md shadow-violet-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin text-teal-200' : ''}`} />
              <span>{isGenerating ? 'Synthesizing Plan...' : 'Generate Smart Itinerary'}</span>
            </button>
          </div>
        </div>

        {/* Interests Pills */}
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-2">Interests & Experience Preferences</label>
          <div className="flex flex-wrap gap-2">
            {availableInterests.map((interest) => {
              const isSelected = userPreferences.interests.includes(interest);
              return (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#6344e7] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {interest}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Generated Itinerary Display */}
      {activeItinerary ? (
        <div className="space-y-6">
          {/* Summary & Budget Breakdown Header */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-white via-violet-50/50 to-teal-50/40 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black text-[#0d9488] uppercase tracking-wider">
                  {activeItinerary.isDemoData ? 'DEMO AI ITINERARY' : 'GEMINI GENERATED TRAIL'}
                </span>
              </div>
              <h2 className="text-xl font-black text-slate-900">{activeItinerary.title}</h2>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl font-medium">{activeItinerary.explanation}</p>
            </div>

            {/* Budget Gauge */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 text-right shrink-0 shadow-xs">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Est. Cost / Budget Limit</span>
              <div className="text-lg font-black text-slate-900">
                <span className={activeItinerary.estimatedCostINR <= activeItinerary.totalBudgetINR ? 'text-emerald-600' : 'text-amber-600'}>
                  ₹{activeItinerary.estimatedCostINR}
                </span>{' '}
                / ₹{activeItinerary.totalBudgetINR} INR
              </div>
              <div className="text-[10px] text-slate-500 font-bold mt-0.5">
                {activeItinerary.items.length} Destinations Planned
              </div>
            </div>
          </div>

          {/* Timeline Sequence of Stops */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 tracking-wide">Itinerary Sequence</h3>

            <div className="space-y-4 relative before:absolute before:left-6 before:top-6 before:bottom-6 before:w-0.5 before:bg-[#6344e7]/25">
              {activeItinerary.items.map((item, index) => (
                <div key={item.id} className="relative pl-14 group">
                  {/* Sequence Number Pin */}
                  <div className="absolute left-3 top-4 w-7 h-7 rounded-full bg-[#6344e7] text-white font-black text-xs flex items-center justify-center shadow-md border-2 border-white z-10">
                    {index + 1}
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 group-hover:border-[#6344e7]/40 shadow-xs hover:shadow-md transition-all">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-[#6344e7] bg-violet-50 border border-violet-200 px-2 py-0.5 rounded">
                          {item.suggestedTimeSlot}
                        </span>
                        <span className="text-[10px] font-bold text-[#0d9488]">{item.category}</span>
                      </div>
                      <h4 className="text-base font-black text-slate-900">{item.placeName}</h4>
                      <p className="text-xs text-slate-600 mt-1 font-medium">{item.notes}</p>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-right">
                      <div>
                        <div className="font-black text-slate-900">₹{item.estimatedCostINR} INR</div>
                        <div className="text-[10px] text-slate-500 font-medium">{item.durationMinutes} mins duration</div>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
                        title="Remove stop"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Stop Manual Picker */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-4 shadow-xs">
            <span className="text-xs text-slate-700 font-bold">Add another Pune destination to this itinerary:</span>
            <select
              onChange={(e) => {
                if (e.target.value) addPlaceToItinerary(e.target.value);
                e.target.value = '';
              }}
              className="bg-slate-50 text-slate-800 text-xs px-3 py-2 rounded-xl border border-slate-200 focus:bg-white focus:border-[#6344e7] focus:outline-none font-medium cursor-pointer"
            >
              <option value="">-- Select Destination --</option>
              {places.map(p => (
                <option key={p.id} value={p.id}>{p.name} (Est. ₹{p.estimatedPriceINR})</option>
              ))}
            </select>
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3 shadow-xs">
          <Route className="w-12 h-12 text-[#6344e7] mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Active Itinerary Plan Generated Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Set your budget and interest preferences above, then click <strong>Generate Smart Itinerary</strong> to create an optimized Pune exploration trail.
          </p>
          <button
            onClick={handleGenerate}
            className="px-5 py-2.5 rounded-xl bg-[#6344e7] text-white text-xs font-bold shadow-md mt-2 cursor-pointer"
          >
            Generate Now
          </button>
        </div>
      )}
    </div>
  );
};
