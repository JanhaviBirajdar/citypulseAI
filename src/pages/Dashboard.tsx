import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  MapPin,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Utensils,
  Landmark,
  Trees,
  DollarSign
} from 'lucide-react';
import { useDemo } from '../context/DemoContext';
import { InteractiveMap } from '../components/map/InteractiveMap';
import { PlaceCard } from '../components/cards/PlaceCard';
import { PlaceDetailModal } from '../components/cards/PlaceDetailModal';
import { DemoBadge } from '../components/ui/DemoBadge';
import { HeroSection } from '../components/hero/HeroSection';
import type { Place } from '../types';

export const Dashboard: React.FC = () => {
  const { places, reports, weather, loadDemoScenario } = useDemo();
  const navigate = useNavigate();

  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  const categories = [
    { name: 'Heritage', icon: Landmark, color: 'text-amber-700 bg-amber-50 border-amber-200' },
    { name: 'Food', icon: Utensils, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    { name: 'Attractions', icon: Compass, color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
    { name: 'Parks', icon: Trees, color: 'text-teal-700 bg-teal-50 border-teal-200' },
    { name: 'Budget Friendly', icon: DollarSign, color: 'text-[#0d9488] bg-teal-50 border-teal-200' },
  ];

  const topRecommended = places.slice(0, 3);
  const recentReports = reports.slice(0, 4);

  const handleDemoClick = () => {
    loadDemoScenario();
    navigate('/itinerary');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Upgraded 3D Smart City Hero Banner */}
      <HeroSection
        onSearchSubmit={(query) => navigate(`/explore?search=${encodeURIComponent(query)}`)}
        onLoadDemoScenario={handleDemoClick}
      />

      {/* Category Pills Row */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 tracking-wide">Explore Categories</h2>
          <button
            onClick={() => navigate('/explore')}
            className="text-xs font-bold text-[#6344e7] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.name}
                onClick={() => navigate(`/explore?category=${encodeURIComponent(cat.name)}`)}
                className="bg-white p-4 rounded-2xl cursor-pointer flex items-center gap-3 group border border-slate-200 shadow-xs hover:shadow-md hover:border-[#6344e7]/40 transition-all duration-200"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${cat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-800 group-hover:text-[#6344e7] transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-[10px] text-slate-500 font-medium">Pune Highlights</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Map & Conditions Dual Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Map Card (2 Cols) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#6344e7]" /> Pune Live Exploration Map
            </h2>
            <button
              onClick={() => navigate('/map')}
              className="text-xs font-bold text-[#6344e7] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Full Screen Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <InteractiveMap
            places={places}
            reports={reports}
            heightClass="h-[420px]"
            onSelectPlace={(p) => setSelectedPlace(p)}
          />
        </div>

        {/* City Conditions & Citizen Reports Sidebar (1 Col) */}
        <div className="space-y-6">
          {/* City Conditions Summary Widget */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#0d9488]" /> City Health Index
              </h3>
              <DemoBadge size="sm" />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Temperature</div>
                <div className="text-lg font-black text-amber-600">{weather.temperatureC}°C</div>
                <div className="text-[10px] text-slate-500 font-medium">{weather.condition}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Air Quality</div>
                <div className="text-lg font-black text-teal-700">AQI {weather.aqi}</div>
                <div className="text-[10px] text-teal-700 font-bold">{weather.aqiStatus}</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Traffic Conditions:</span>
                <span className="text-emerald-700 font-bold">Normal Flow</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Active Hazards:</span>
                <span className="text-amber-700 font-bold">{reports.length} Reported</span>
              </div>
            </div>
          </div>

          {/* Recent Citizen Safety Feed */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> Recent Citizen Reports
              </h3>
              <button
                onClick={() => navigate('/reports')}
                className="text-[11px] font-bold text-[#6344e7] hover:underline cursor-pointer"
              >
                View All
              </button>
            </div>

            <div className="space-y-2.5 max-h-[220px] overflow-y-auto">
              {recentReports.map((rep) => (
                <div
                  key={rep.id}
                  onClick={() => navigate('/reports')}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-amber-400 cursor-pointer transition-colors space-y-1"
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-amber-800 uppercase">{rep.category}</span>
                    <span className={`px-1.5 py-0.5 rounded font-bold ${
                      rep.status === 'Verified'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {rep.status}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{rep.title}</h4>
                  <p className="text-[10px] text-slate-500 flex items-center justify-between pt-1 font-medium">
                    <span>📍 {rep.locationName}</span>
                    <span>{rep.timestamp.split(' ')[1]}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Destinations Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-wide">Top Recommended Destinations</h2>
            <p className="text-xs text-slate-500 font-medium">Scored dynamically using preference weights and safety evidence</p>
          </div>
          <button
            onClick={() => navigate('/explore')}
            className="text-xs font-bold text-[#6344e7] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Explore All Places</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topRecommended.map((place) => (
            <PlaceCard
              key={place.id}
              place={place}
              onViewDetails={(p) => setSelectedPlace(p)}
              onViewOnMap={() => navigate('/map')}
            />
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      <PlaceDetailModal
        place={selectedPlace}
        onClose={() => setSelectedPlace(null)}
      />
    </div>
  );
};
