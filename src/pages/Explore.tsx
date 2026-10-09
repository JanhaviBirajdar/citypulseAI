import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Grid,
  Map as MapIcon,
  Compass,
  Accessibility,
  ArrowUpDown,
  RotateCcw
} from 'lucide-react';
import { useDemo } from '../context/DemoContext';
import { PlaceCard } from '../components/cards/PlaceCard';
import { InteractiveMap } from '../components/map/InteractiveMap';
import { PlaceDetailModal } from '../components/cards/PlaceDetailModal';
import type { Place } from '../types';
import { calculateCityMatch } from '../services/scoringEngine';

export const Explore: React.FC = () => {
  const { places, userPreferences, matchWeights } = useDemo();
  const [searchParams] = useSearchParams();

  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || 'All';

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  // Filters State
  const [maxBudget, setMaxBudget] = useState<number>(1000);
  const [minRating, setMinRating] = useState<number>(0);
  const [requireWheelchair, setRequireWheelchair] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'match' | 'rating' | 'price' | 'safety'>('match');

  const categories = ['All', 'Attractions', 'Food', 'Heritage', 'Parks', 'Shopping', 'Culture'];

  const filteredPlaces = useMemo(() => {
    return places
      .filter((place) => {
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchName = place.name.toLowerCase().includes(q);
          const matchCat = place.category.toLowerCase().includes(q);
          const matchArea = place.area.toLowerCase().includes(q);
          const matchTags = place.tags.some(t => t.toLowerCase().includes(q));
          if (!matchName && !matchCat && !matchArea && !matchTags && place.id !== searchTerm) return false;
        }

        if (selectedCategory !== 'All' && place.category !== selectedCategory) {
          if (selectedCategory === 'Budget Friendly' && place.estimatedPriceINR > 100) {
            return false;
          } else if (selectedCategory !== 'Budget Friendly') {
            return false;
          }
        }

        if (place.estimatedPriceINR > maxBudget && maxBudget < 1000) {
          return false;
        }

        if (place.rating < minRating) {
          return false;
        }

        if (requireWheelchair && !place.accessibility.wheelchairAccessible) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'match') {
          const scoreA = calculateCityMatch(a, userPreferences.budgetMaxINR, matchWeights).score;
          const scoreB = calculateCityMatch(b, userPreferences.budgetMaxINR, matchWeights).score;
          return scoreB - scoreA;
        }
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'price') return a.estimatedPriceINR - b.estimatedPriceINR;
        if (sortBy === 'safety') return b.safetyEvidenceScore - a.safetyEvidenceScore;
        return 0;
      });
  }, [places, searchTerm, selectedCategory, maxBudget, minRating, requireWheelchair, sortBy, userPreferences, matchWeights]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setMaxBudget(1000);
    setMinRating(0);
    setRequireWheelchair(false);
    setSortBy('match');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Compass className="w-7 h-7 text-[#0d9488]" /> Explore Pune
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Search attractions, food spots, heritage sites, and local experiences with verified safety data
          </p>
        </div>

        {/* View Switch Buttons (Grid vs Map) */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-[#6344e7] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>Grid View</span>
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              viewMode === 'map'
                ? 'bg-[#6344e7] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapIcon className="w-4 h-4" />
            <span>Map View</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Search & Category Pills */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative w-full lg:flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by place name, tag, or area (e.g. Shaniwar, FC Road, Fort)..."
              className="w-full bg-slate-50 text-slate-900 placeholder-slate-400 text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:bg-white focus:border-[#6344e7] focus:outline-none"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="w-full lg:w-auto flex items-center gap-2">
            <span className="text-xs text-slate-500 font-bold whitespace-nowrap flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#6344e7]" /> Sort by:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-50 text-slate-800 text-xs px-3 py-2 rounded-xl border border-slate-200 focus:bg-white focus:border-[#6344e7] focus:outline-none font-bold cursor-pointer"
            >
              <option value="match">CityMatch Score</option>
              <option value="rating">Rating (Highest)</option>
              <option value="price">Price (Lowest)</option>
              <option value="safety">Safety Evidence</option>
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#6344e7] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Additional Filters Row */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-700">
          <div className="flex flex-wrap items-center gap-4">
            {/* Budget Slider */}
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Max Budget:</span>
              <span className="font-extrabold text-[#0d9488]">₹{maxBudget}</span>
              <input
                type="range"
                min="0"
                max="1000"
                step="50"
                value={maxBudget}
                onChange={(e) => setMaxBudget(Number(e.target.value))}
                className="w-24 accent-[#0d9488]"
              />
            </div>

            {/* Min Rating Filter */}
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Min Rating:</span>
              <select
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="bg-slate-50 text-amber-700 text-xs px-2 py-1 rounded-lg border border-slate-200 font-bold"
              >
                <option value={0}>All Ratings</option>
                <option value={4.0}>★ 4.0+</option>
                <option value={4.5}>★ 4.5+</option>
              </select>
            </div>

            {/* Wheelchair Accessible Toggle */}
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={requireWheelchair}
                onChange={(e) => setRequireWheelchair(e.target.checked)}
                className="rounded accent-[#6344e7]"
              />
              <Accessibility className="w-3.5 h-3.5 text-[#6344e7]" />
              <span>Wheelchair Accessible Only</span>
            </label>
          </div>

          <button
            onClick={resetFilters}
            className="text-[11px] font-bold text-slate-500 hover:text-[#6344e7] flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" /> Reset Filters
          </button>
        </div>
      </div>

      {/* Main View Display */}
      {viewMode === 'grid' ? (
        filteredPlaces.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlaces.map((place) => (
              <PlaceCard
                key={place.id}
                place={place}
                onViewDetails={(p) => setSelectedPlace(p)}
                onViewOnMap={() => setViewMode('map')}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3 shadow-xs">
            <Compass className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No Pune Places Match Your Filter Criteria</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your max budget slider, clearing category selections, or searching for broader terms.
            </p>
            <button
              onClick={resetFilters}
              className="px-4 py-2 rounded-xl bg-[#6344e7] text-white text-xs font-bold mt-2 cursor-pointer shadow-xs"
            >
              Reset All Filters
            </button>
          </div>
        )
      ) : (
        <div className="space-y-4">
          <InteractiveMap
            places={filteredPlaces}
            heightClass="h-[600px]"
            onSelectPlace={(p) => setSelectedPlace(p)}
          />
        </div>
      )}

      {/* Place Detail Modal */}
      <PlaceDetailModal
        place={selectedPlace}
        onClose={() => setSelectedPlace(null)}
      />
    </div>
  );
};
