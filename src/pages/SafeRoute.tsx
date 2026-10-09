import React, { useState } from 'react';
import {
  ShieldAlert,
  MapPin,
  Navigation,
  Car,
  Footprints,
  Bus,
  Bike,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { useDemo } from '../context/DemoContext';
import { InteractiveMap } from '../components/map/InteractiveMap';
import type { RouteOption, TravelMode } from '../types';
import { DemoBadge } from '../components/ui/DemoBadge';

export const SafeRoute: React.FC = () => {
  const { places, reports } = useDemo();

  const [origin, setOrigin] = useState('Deccan Gymkhana, Pune');
  const [destination, setDestination] = useState('pune-shaniwar-wada');
  const [travelMode, setTravelMode] = useState<TravelMode>('Drive');
  const [avoidHazards, setAvoidHazards] = useState(true);
  const [preferAccessible, setPreferAccessible] = useState(false);

  const destPlace = places.find(p => p.id === destination) || places[0];

  const routeOptions: RouteOption[] = [
    {
      id: 'route-primary',
      name: 'Primary Direct Route (via Karve Rd & FC Rd)',
      distanceKm: 4.8,
      estimatedMinutes: travelMode === 'Walk' ? 45 : travelMode === 'Drive' ? 14 : 18,
      travelMode,
      reportedHazardsCount: 1,
      hazardsEnRoute: [reports[0]],
      safetyConfidence: 'Moderate',
      description: 'Fastest direct street segment. Passes through Goodluck Chowk where 1 road hazard (pothole) was reported.',
      coordinates: [
        [18.5180, 73.8402],
        [18.5218, 73.8420],
        [18.5196, 73.8553]
      ],
      isRecommended: !avoidHazards
    },
    {
      id: 'route-bypass',
      name: 'Hazard-Bypassing Alternate Route (via Laxmi Rd)',
      distanceKm: 5.4,
      estimatedMinutes: travelMode === 'Walk' ? 52 : travelMode === 'Drive' ? 18 : 22,
      travelMode,
      reportedHazardsCount: 0,
      hazardsEnRoute: [],
      safetyConfidence: 'High',
      description: 'Bypasses Goodluck Chowk hazard zone via paved Laxmi Road arterial. Clear path verified by recent citizen logs.',
      coordinates: [
        [18.5180, 73.8402],
        [18.5034, 73.8522],
        [18.5196, 73.8553]
      ],
      isRecommended: avoidHazards
    }
  ];

  const travelModes: { mode: TravelMode; icon: any }[] = [
    { mode: 'Drive', icon: Car },
    { mode: 'Two-wheeler', icon: Bike },
    { mode: 'Walk', icon: Footprints },
    { mode: 'Transit', icon: Bus },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-[#0d9488] border border-teal-200 text-xs font-black uppercase">
              HAZARD AVOIDANCE MAP
            </span>
            <DemoBadge label="SAFEROUTE LENS" size="sm" />
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-7 h-7 text-[#0d9488]" /> SafeRoute Lens
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Visualize Pune route alternatives, active citizen hazard alerts, road bottlenecks, and safe street corridors.
          </p>
        </div>
      </div>

      {/* Main Grid: Controls + Interactive Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Route Planning Inputs Panel (1 Col) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <Navigation className="w-4 h-4 text-[#6344e7]" /> Journey Parameters
          </h3>

          {/* Origin */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Origin Location</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:bg-white focus:border-[#6344e7] focus:outline-none"
              />
            </div>
          </div>

          {/* Destination Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Destination in Pune</label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full bg-slate-50 text-slate-900 text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:bg-white focus:border-[#6344e7] focus:outline-none font-bold cursor-pointer"
            >
              {places.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.area})
                </option>
              ))}
            </select>
          </div>

          {/* Travel Mode Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Travel Mode</label>
            <div className="grid grid-cols-2 gap-2">
              {travelModes.map((item) => {
                const Icon = item.icon;
                const isSel = travelMode === item.mode;
                return (
                  <button
                    key={item.mode}
                    onClick={() => setTravelMode(item.mode)}
                    className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                      isSel
                        ? 'bg-[#6344e7] text-white shadow-xs'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.mode}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preferences Checkboxes */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={avoidHazards}
                onChange={(e) => setAvoidHazards(e.target.checked)}
                className="rounded accent-[#0d9488]"
              />
              <span>Avoid Known Citizen Hazards</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={preferAccessible}
                onChange={(e) => setPreferAccessible(e.target.checked)}
                className="rounded accent-[#6344e7]"
              />
              <span>Prioritize Wheelchair & Paved Routes</span>
            </label>
          </div>
        </div>

        {/* Interactive Map Display (2 Cols) */}
        <div className="lg:col-span-2 space-y-3">
          <InteractiveMap
            places={[destPlace]}
            reports={reports}
            routes={routeOptions}
            heightClass="h-[460px]"
          />
        </div>
      </div>

      {/* Suggested Routes Comparison Cards */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 tracking-wide flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#0d9488]" /> Suggested Route Options
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {routeOptions.map((route) => (
            <div
              key={route.id}
              className={`p-5 rounded-3xl border transition-all ${
                route.isRecommended
                  ? 'bg-gradient-to-b from-white to-teal-50/40 border-teal-300 shadow-md'
                  : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    {route.isRecommended && (
                      <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-[#0d9488] border border-teal-300 text-[10px] font-black uppercase">
                        RECOMMENDED
                      </span>
                    )}
                    <span className="text-[10px] text-slate-500 font-bold">{route.travelMode}</span>
                  </div>
                  <h4 className="text-base font-black text-slate-900 mt-1">{route.name}</h4>
                </div>

                <div className="text-right">
                  <div className="text-lg font-black text-slate-900">{route.estimatedMinutes} min</div>
                  <div className="text-xs text-slate-500 font-medium">{route.distanceKm} km</div>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-4">{route.description}</p>

              {/* Hazard Count Pill */}
              <div className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className={`w-4 h-4 ${route.reportedHazardsCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`} />
                  <span className="font-bold text-slate-800">
                    {route.reportedHazardsCount > 0 ? `${route.reportedHazardsCount} Reported Hazard` : '0 Hazards En-Route'}
                  </span>
                </div>
                <span className={`font-bold ${route.safetyConfidence === 'High' ? 'text-emerald-700' : 'text-amber-800'}`}>
                  Confidence: {route.safetyConfidence}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trust & Safety Disclaimer Notice */}
      <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-amber-900 font-bold">Safety Advisory:</strong> CityPulse AI provides preference-driven route guidance based on available citizen reports and municipal data. Never guarantee a route is 100% safe. Always remain alert to changing street conditions.
        </p>
      </div>
    </div>
  );
};
