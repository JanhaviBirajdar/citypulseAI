import React from 'react';
import {
  MapPin,
  Star,
  Scale,
  PlusCircle,
  CheckCircle2,
  Accessibility,
  ShieldCheck,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import type { Place } from '../../types';
import { useDemo } from '../../context/DemoContext';
import { DemoBadge } from '../ui/DemoBadge';
import { calculateCityMatch } from '../../services/scoringEngine';

interface PlaceCardProps {
  place: Place;
  onViewDetails?: (place: Place) => void;
  onViewOnMap?: (place: Place) => void;
}

export const PlaceCard: React.FC<PlaceCardProps> = ({
  place,
  onViewDetails,
  onViewOnMap
}) => {
  const {
    comparePlaceIds,
    toggleComparePlace,
    userPreferences,
    matchWeights,
    activeItinerary,
    setActiveItinerary
  } = useDemo();

  const isCompared = comparePlaceIds.includes(place.id);
  const matchResult = calculateCityMatch(place, userPreferences.budgetMaxINR, matchWeights);
  const isInItinerary = activeItinerary?.items.some(it => it.placeId === place.id);

  const handleToggleItinerary = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeItinerary) {
      setActiveItinerary({
        id: `itin-${Date.now()}`,
        title: `Custom Pune Exploration`,
        startingLocation: userPreferences.startingLocation,
        totalBudgetINR: userPreferences.budgetMaxINR,
        estimatedCostINR: place.estimatedPriceINR,
        totalDurationHours: 4,
        travelMode: userPreferences.travelMode,
        interests: [place.category],
        items: [
          {
            id: `item-1`,
            placeId: place.id,
            placeName: place.name,
            category: place.category,
            estimatedCostINR: place.estimatedPriceINR,
            durationMinutes: 90,
            suggestedTimeSlot: '10:00 AM - 11:30 AM',
            notes: 'Added from Place Card.',
            hazardsNearbyCount: 0
          }
        ],
        explanation: 'User created custom itinerary.',
        isDemoData: true,
        createdAt: new Date().toISOString()
      });
    } else {
      if (isInItinerary) {
        const updatedItems = activeItinerary.items.filter(it => it.placeId !== place.id);
        const newCost = updatedItems.reduce((acc, item) => acc + item.estimatedCostINR, 0);
        setActiveItinerary({
          ...activeItinerary,
          items: updatedItems,
          estimatedCostINR: newCost
        });
      } else {
        const newItem = {
          id: `item-${Date.now()}`,
          placeId: place.id,
          placeName: place.name,
          category: place.category,
          estimatedCostINR: place.estimatedPriceINR,
          durationMinutes: 90,
          suggestedTimeSlot: 'Flexible',
          notes: 'Added from Place Card.',
          hazardsNearbyCount: 0
        };
        const updatedItems = [...activeItinerary.items, newItem];
        const newCost = updatedItems.reduce((acc, item) => acc + item.estimatedCostINR, 0);
        setActiveItinerary({
          ...activeItinerary,
          items: updatedItems,
          estimatedCostINR: newCost
        });
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between group shadow-sm hover:shadow-xl hover:border-[#6344e7]/40 transition-all duration-300">
      {/* Image & Floating Badges */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        <img
          src={place.imageUrl}
          alt={place.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            if (!target.dataset.fallback) {
              target.dataset.fallback = '1';
              target.src = 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80';
            }
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Top Floating Badges & Real Maps Quick Link */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          <span className="px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur-md border border-slate-200 text-xs font-bold text-[#0d9488] shadow-sm">
            {place.category}
          </span>
          <div className="flex items-center gap-1.5">
            {place.googleMapsUrl && (
              <a
                href={place.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="px-2 py-1 rounded-lg bg-white/95 backdrop-blur-md hover:bg-white text-slate-800 text-[11px] font-bold border border-slate-200 shadow-sm flex items-center gap-1 transition-all hover:text-[#6344e7]"
                title="Open directly in Google Maps"
              >
                <MapPin className="w-3 h-3 text-rose-500" />
                <span>Maps</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
              </a>
            )}
            <DemoBadge size="sm" />
          </div>
        </div>

        {/* CityMatch Floating Score Badge */}
        <div className="absolute bottom-3 right-3 z-10 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-200 flex items-center gap-1.5 shadow-md">
          <Sparkles className="w-3.5 h-3.5 text-[#6344e7]" />
          <div className="leading-none">
            <span className="text-[10px] text-slate-500 font-bold block">CityMatch</span>
            <span className="text-xs font-black text-slate-900">{matchResult.score}/100</span>
          </div>
        </div>

        {/* Price Tag */}
        <div className="absolute bottom-3 left-3 z-10 text-xs font-bold text-white bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20">
          {place.estimatedPriceINR === 0 ? (
            <span className="text-emerald-300">FREE ENTRY</span>
          ) : (
            <span>Est. ₹{place.estimatedPriceINR} INR</span>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Title & Area */}
          <div className="mb-2">
            <h3
              onClick={() => onViewDetails && onViewDetails(place)}
              className="text-base font-bold text-slate-900 group-hover:text-[#6344e7] transition-colors cursor-pointer line-clamp-1"
            >
              {place.name}
            </h3>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-[#6344e7] shrink-0" />
              <span className="truncate">{place.area}</span>
            </p>
          </div>

          {/* Rating & Safety Stats Row */}
          <div className="grid grid-cols-2 gap-2 my-3 py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <div>
                <span className="font-bold text-slate-800">{place.rating}</span>
                <span className="text-[10px] text-slate-500 ml-1">
                  ({place.reviewCount > 1000 ? `${(place.reviewCount / 1000).toFixed(1)}k` : place.reviewCount})
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 border-l border-slate-200 pl-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <div>
                <span className="font-bold text-emerald-700">{place.safetyEvidenceScore}%</span>
                <span className="text-[10px] text-slate-500 ml-1">Safety</span>
              </div>
            </div>
          </div>

          {/* Accessibility & Features Icons */}
          <div className="flex items-center justify-between text-[11px] text-slate-600 mb-3">
            <div className="flex items-center gap-2">
              {place.accessibility.wheelchairAccessible && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-violet-50 text-[#6344e7] border border-violet-200 font-medium" title="Wheelchair Accessible">
                  <Accessibility className="w-3 h-3" /> Ramp
                </span>
              )}
              {place.accessibility.accessibleRestrooms && (
                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium border border-slate-200" title="Accessible Restrooms">
                  Restroom
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-500 font-semibold">Coverage: {place.evidenceCoverage}%</span>
          </div>

          {/* Source & Updated Info */}
          <div className="text-[10px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="truncate max-w-[150px]">Source: {place.dataSource}</span>
            <span className="shrink-0">{place.lastUpdated.split(' ')[0]}</span>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="grid grid-cols-3 gap-1.5 mt-4 pt-3 border-t border-slate-100">
          <button
            onClick={() => toggleComparePlace(place.id)}
            className={`py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
              isCompared
                ? 'bg-[#6344e7] text-white shadow-sm'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
            }`}
            title={isCompared ? 'Remove from comparison' : 'Compare with other places'}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>{isCompared ? 'Comparing' : 'Compare'}</span>
          </button>

          <button
            onClick={handleToggleItinerary}
            className={`py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
              isInItinerary
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
            }`}
            title="Add to Itinerary"
          >
            {isInItinerary ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <PlusCircle className="w-3.5 h-3.5 text-teal-600" />}
            <span>{isInItinerary ? 'Added' : 'Itinerary'}</span>
          </button>

          <button
            onClick={() => onViewOnMap ? onViewOnMap(place) : onViewDetails && onViewDetails(place)}
            className="py-1.5 px-2 rounded-xl text-xs font-bold bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 flex items-center justify-center gap-1 transition-all cursor-pointer"
            title="View details & map"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            <span>Details</span>
          </button>
        </div>
      </div>
    </div>
  );
};
