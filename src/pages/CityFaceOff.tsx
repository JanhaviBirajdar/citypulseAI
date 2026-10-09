import React, { useState } from 'react';
import {
  Scale,
  Sparkles,
  Info,
  CheckCircle2,
  XCircle,
  Plus,
  SlidersHorizontal,
  Award
} from 'lucide-react';
import { useDemo } from '../context/DemoContext';
import { calculateCityMatch } from '../services/scoringEngine';
import { DemoBadge } from '../components/ui/DemoBadge';
import type { MatchWeights } from '../types';

export const CityFaceOff: React.FC = () => {
  const {
    places,
    comparePlaceIds,
    toggleComparePlace,
    matchWeights,
    updateWeights,
    userPreferences
  } = useDemo();

  const [showWeightSliders, setShowWeightSliders] = useState(false);

  const selectedPlaces = places.filter(p => comparePlaceIds.includes(p.id));

  const matchResults = selectedPlaces.map(p => ({
    place: p,
    result: calculateCityMatch(p, userPreferences.budgetMaxINR, matchWeights)
  }));

  const topMatch = matchResults.slice().sort((a, b) => b.result.score - a.result.score)[0];

  const handleSliderChange = (key: keyof MatchWeights, value: number) => {
    updateWeights({
      ...matchWeights,
      [key]: value
    });
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-violet-100 text-[#6344e7] border border-violet-200 text-xs font-black uppercase">
              UNIQUE DECISION ENGINE
            </span>
            <DemoBadge label="CONFIGURABLE SCORING" size="sm" />
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Scale className="w-7 h-7 text-[#6344e7]" /> City Face-Off
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Compare 2 or 3 Pune destinations side-by-side using custom weighted scoring, safety evidence, and accessibility coverage.
          </p>
        </div>

        {/* Configure Weights Button */}
        <button
          onClick={() => setShowWeightSliders(!showWeightSliders)}
          className="px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 shadow-xs text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
        >
          <SlidersHorizontal className="w-4 h-4 text-[#0d9488]" />
          <span>{showWeightSliders ? 'Hide Weight Controls' : 'Configure Scoring Weights'}</span>
        </button>
      </div>

      {/* Configurable Weight Sliders Drawer */}
      {showWeightSliders && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-4 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#6344e7]" /> CityMatch Weighting Preference Controls
              </h3>
              <p className="text-[11px] text-slate-500">
                Adjust importance sliders below. Values normalize automatically to calculate 0-100 preference scores.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs">
            {/* Safety Weight */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span>Safety Evidence</span>
                <span className="text-[#0d9488] font-black">{matchWeights.safetyEvidence}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={matchWeights.safetyEvidence}
                onChange={(e) => handleSliderChange('safetyEvidence', Number(e.target.value))}
                className="w-full accent-[#6344e7]"
              />
            </div>

            {/* Affordability Weight */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span>Affordability</span>
                <span className="text-[#0d9488] font-black">{matchWeights.affordability}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={matchWeights.affordability}
                onChange={(e) => handleSliderChange('affordability', Number(e.target.value))}
                className="w-full accent-[#6344e7]"
              />
            </div>

            {/* Ratings Weight */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span>Ratings & Reviews</span>
                <span className="text-[#0d9488] font-black">{matchWeights.ratings}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={matchWeights.ratings}
                onChange={(e) => handleSliderChange('ratings', Number(e.target.value))}
                className="w-full accent-[#6344e7]"
              />
            </div>

            {/* Cleanliness Weight */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span>Cleanliness Evidence</span>
                <span className="text-[#0d9488] font-black">{matchWeights.cleanliness}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={matchWeights.cleanliness}
                onChange={(e) => handleSliderChange('cleanliness', Number(e.target.value))}
                className="w-full accent-[#6344e7]"
              />
            </div>

            {/* Accessibility Weight */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span>Accessibility</span>
                <span className="text-[#0d9488] font-black">{matchWeights.accessibility}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={matchWeights.accessibility}
                onChange={(e) => handleSliderChange('accessibility', Number(e.target.value))}
                className="w-full accent-[#6344e7]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Selected Places Selection Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Comparing {selectedPlaces.length} of 3 Selected Destinations
        </h3>

        {selectedPlaces.length < 2 && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Select at least 2 places from Explore or below to perform a side-by-side comparison.</span>
          </div>
        )}

        {/* Quick Picker Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {places.map((place) => {
            const isSel = comparePlaceIds.includes(place.id);
            return (
              <button
                key={place.id}
                onClick={() => toggleComparePlace(place.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isSel
                    ? 'bg-[#6344e7] text-white shadow-xs'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
                }`}
              >
                <span>{place.name}</span>
                {isSel ? <XCircle className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Recommendation Panel: Best Match for Preferences */}
      {topMatch && selectedPlaces.length >= 2 && (
        <div className="relative p-6 rounded-3xl bg-gradient-to-r from-violet-50/70 via-teal-50/50 to-white border border-teal-300 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-6 h-6 text-[#0d9488]" />
              <h3 className="text-base font-black text-slate-900">Best Match For Your Preferences</h3>
            </div>
            <span className="px-3 py-1 rounded-full bg-teal-100 text-[#0d9488] border border-teal-300 text-xs font-black">
              SCORE: {topMatch.result.score}/100
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
            <div className="lg:col-span-1 space-y-1">
              <div className="text-lg font-black text-slate-900">{topMatch.place.name}</div>
              <div className="text-slate-600 font-medium">{topMatch.place.area} • Est. ₹{topMatch.place.estimatedPriceINR} INR</div>
            </div>

            <div className="lg:col-span-2 space-y-2 text-slate-700">
              <p className="leading-relaxed">
                <strong className="text-slate-900">Rationale:</strong> {topMatch.result.recommendationReason}
              </p>
              {topMatch.result.missingDataNotes.length > 0 && (
                <div className="text-[11px] text-amber-800 flex items-center gap-1.5 font-medium">
                  <Info className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                  <span>Missing Data Audit: {topMatch.result.missingDataNotes.join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Detailed Side-by-Side Comparison Matrix */}
      {selectedPlaces.length >= 2 && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-sm text-slate-900">
            Comprehensive Specification & Evidence Comparison Table
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <th className="p-4 w-48 font-bold">Comparison Spec</th>
                  {matchResults.map(({ place }) => (
                    <th key={place.id} className="p-4 min-w-[220px]">
                      <div className="font-black text-sm text-slate-900">{place.name}</div>
                      <div className="text-[10px] text-slate-500 font-medium">{place.category}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {/* CityMatch Score */}
                <tr className="bg-violet-50/60">
                  <td className="p-4 font-black text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#6344e7]" /> CityMatch Score
                  </td>
                  {matchResults.map(({ place, result }) => (
                    <td key={place.id} className="p-4 font-black text-sm text-[#6344e7]">
                      {result.score} / 100
                    </td>
                  ))}
                </tr>

                {/* Safety Evidence Score */}
                <tr>
                  <td className="p-4 font-bold text-slate-700">Safety Evidence Score</td>
                  {matchResults.map(({ place, result }) => (
                    <td key={place.id} className="p-4 font-bold text-emerald-700">
                      {result.breakdown.safetyScore} / 100
                    </td>
                  ))}
                </tr>

                {/* Affordability & Est Price */}
                <tr>
                  <td className="p-4 font-bold text-slate-700">Estimated Cost (INR)</td>
                  {matchResults.map(({ place }) => (
                    <td key={place.id} className="p-4 font-bold text-slate-900">
                      {place.estimatedPriceINR === 0 ? 'Free Entry' : `₹${place.estimatedPriceINR}`} ({place.priceLevel})
                    </td>
                  ))}
                </tr>

                {/* Rating & Review Source */}
                <tr>
                  <td className="p-4 font-bold text-slate-700">Public Rating</td>
                  {matchResults.map(({ place }) => (
                    <td key={place.id} className="p-4 font-bold text-amber-600">
                      ★ {place.rating} / 5.0 ({place.reviewCount.toLocaleString()} reviews)
                    </td>
                  ))}
                </tr>

                {/* Accessibility Support */}
                <tr>
                  <td className="p-4 font-bold text-slate-700">Accessibility Coverage</td>
                  {matchResults.map(({ place }) => (
                    <td key={place.id} className="p-4">
                      {place.accessibility.wheelchairAccessible ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Wheelchair Ramp Available
                        </span>
                      ) : (
                        <span className="text-slate-500 italic">Steep Steps / Limited Access</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Cleanliness Index */}
                <tr>
                  <td className="p-4 font-bold text-slate-700">Cleanliness Evidence</td>
                  {matchResults.map(({ place }) => (
                    <td key={place.id} className="p-4 font-bold text-teal-700">
                      {place.cleanlinessScore} / 100
                    </td>
                  ))}
                </tr>

                {/* Evidence Coverage & Confidence */}
                <tr>
                  <td className="p-4 font-bold text-slate-700">Evidence Coverage Confidence</td>
                  {matchResults.map(({ place }) => (
                    <td key={place.id} className="p-4 font-bold text-[#6344e7]">
                      {place.evidenceCoverage}% Confidence
                    </td>
                  ))}
                </tr>

                {/* Data Source & Updated */}
                <tr>
                  <td className="p-4 font-bold text-slate-700">Data Source Audit</td>
                  {matchResults.map(({ place }) => (
                    <td key={place.id} className="p-4 text-[11px] text-slate-500 font-medium">
                      {place.dataSource} (Updated {place.lastUpdated.split(' ')[0]})
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Critical Trust & Transparency Disclaimer */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs text-slate-600 flex items-start gap-3 shadow-xs">
        <Info className="w-5 h-5 text-[#6344e7] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-slate-800">Trust Guarantee:</strong> Missing evidence is never interpreted as good or safe. Scores represent custom preference-based decision aids, not objective safety guarantees. All ratings and citizen scores display explicit data source attributes.
        </p>
      </div>
    </div>
  );
};
