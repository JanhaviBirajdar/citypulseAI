import React, { useState } from 'react';
import {
  MapPin,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  Navigation,
  ExternalLink
} from 'lucide-react';
import type { Place, CitizenReport, RouteOption } from '../../types';
import { DemoBadge } from '../ui/DemoBadge';

interface InteractiveMapProps {
  places?: Place[];
  reports?: CitizenReport[];
  routes?: RouteOption[];
  selectedPlaceId?: string;
  selectedReportId?: string;
  onSelectPlace?: (place: Place) => void;
  onSelectReport?: (report: CitizenReport) => void;
  heightClass?: string;
  showLayersControl?: boolean;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  places = [],
  reports = [],
  routes = [],
  selectedPlaceId,
  selectedReportId,
  onSelectPlace,
  onSelectReport,
  heightClass = 'h-[500px]',
  showLayersControl = true
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(13);
  const [showPlaces, setShowPlaces] = useState<boolean>(true);
  const [showReports, setShowReports] = useState<boolean>(true);
  const [showRoutes, setShowRoutes] = useState<boolean>(true);
  const [activePopup, setActivePopup] = useState<{ type: 'place' | 'report'; item: any } | null>(null);

  // Convert lat/lng to SVG percentage coordinates inside Pune bounding box
  const getSvgCoordinates = (lat: number, lng: number) => {
    const minLat = 18.34;
    const maxLat = 18.62;
    const minLng = 73.72;
    const maxLng = 73.96;

    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = (1 - (lat - minLat) / (maxLat - minLat)) * 100;

    return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) };
  };

  return (
    <div className={`relative w-full ${heightClass} bg-[#f1f5f9] rounded-2xl border border-slate-200 overflow-hidden group shadow-md`}>
      {/* Map Control Bar */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 flex items-center gap-2 shadow-md">
          <Navigation className="w-3.5 h-3.5 text-[#0d9488]" />
          <span className="text-xs font-bold text-slate-800">Pune City Map ({zoomLevel}x)</span>
          <DemoBadge label="DEMO MAP" size="sm" />
        </div>
      </div>

      {/* Layer Toggles */}
      {showLayersControl && (
        <div className="absolute top-4 right-4 z-20 bg-white/95 backdrop-blur-md p-1.5 rounded-xl border border-slate-200 flex items-center gap-1 shadow-md text-xs">
          <button
            onClick={() => setShowPlaces(!showPlaces)}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
              showPlaces
                ? 'bg-[#6344e7] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Places ({places.length})
          </button>
          <button
            onClick={() => setShowReports(!showReports)}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
              showReports
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Hazards ({reports.length})
          </button>
          {routes.length > 0 && (
            <button
              onClick={() => setShowRoutes(!showRoutes)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                showRoutes
                  ? 'bg-[#0d9488] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Routes ({routes.length})
            </button>
          )}
        </div>
      )}

      {/* Zoom Controls */}
      <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-1.5">
        <button
          onClick={() => setZoomLevel(prev => Math.min(prev + 1, 16))}
          className="p-2 bg-white/95 backdrop-blur-md text-slate-700 hover:text-slate-950 rounded-xl border border-slate-200 hover:bg-slate-50 shadow-md transition-colors cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoomLevel(prev => Math.max(prev - 1, 10))}
          className="p-2 bg-white/95 backdrop-blur-md text-slate-700 hover:text-slate-950 rounded-xl border border-slate-200 hover:bg-slate-50 shadow-md transition-colors cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>

      {/* Interactive Map Visual Layer */}
      <div className="w-full h-full relative overflow-hidden bg-[#eef2f6]">
        {/* Light City Grid & Streets Vector Pattern */}
        <svg className="w-full h-full absolute inset-0 opacity-40 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="lightGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#cbd5e1" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#lightGrid)" />

          {/* Mula-Mutha River Vector Path */}
          <path
            d="M 5% 40% Q 25% 48%, 45% 42% T 85% 35% T 95% 55%"
            fill="none"
            stroke="#93c5fd"
            strokeWidth="14"
            strokeOpacity="0.7"
            strokeLinecap="round"
          />
          <path
            d="M 5% 40% Q 25% 48%, 45% 42% T 85% 35% T 95% 55%"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="4"
            strokeOpacity="0.8"
            strokeLinecap="round"
          />
        </svg>

        {/* Route Lines Overlay (SafeRoute Lens) */}
        {showRoutes && routes.length > 0 && (
          <svg className="w-full h-full absolute inset-0 z-10 pointer-events-none">
            {routes.map((route) => {
              const pointsStr = route.coordinates
                .map(coord => {
                  const pt = getSvgCoordinates(coord[0], coord[1]);
                  return `${pt.x}%,${pt.y}%`;
                })
                .join(' ');

              const isSelected = route.isRecommended;

              return (
                <g key={route.id}>
                  <polyline
                    points={pointsStr}
                    fill="none"
                    stroke={isSelected ? '#0d9488' : '#6344e7'}
                    strokeWidth={isSelected ? 6 : 3}
                    strokeOpacity={isSelected ? 0.95 : 0.6}
                    strokeDasharray={isSelected ? 'none' : '6 4'}
                    strokeLinecap="round"
                  />
                </g>
              );
            })}
          </svg>
        )}

        {/* Place Markers */}
        {showPlaces &&
          places.map((place) => {
            const { x, y } = getSvgCoordinates(place.lat, place.lng);
            const isSelected = selectedPlaceId === place.id || activePopup?.item?.id === place.id;

            return (
              <div
                key={place.id}
                style={{ left: `${x}%`, top: `${y}%` }}
                className="absolute z-15 -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                onClick={() => {
                  setActivePopup({ type: 'place', item: place });
                  if (onSelectPlace) onSelectPlace(place);
                }}
              >
                <div
                  className={`relative flex items-center justify-center transition-all duration-300 transform group-hover:scale-125 ${
                    isSelected ? 'scale-125 z-30' : 'scale-100'
                  }`}
                >
                  <span className="absolute w-8 h-8 rounded-full bg-[#6344e7]/20 animate-ping" />
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center shadow-md border transition-all ${
                      isSelected
                        ? 'bg-[#6344e7] text-white border-white ring-2 ring-[#6344e7]'
                        : 'bg-white text-[#6344e7] border-slate-300 hover:bg-[#6344e7] hover:text-white'
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                  </div>
                </div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-0.5 rounded-md bg-white border border-slate-200 shadow-md text-[10px] font-bold text-slate-800 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {place.name} (★{place.rating})
                </div>
              </div>
            );
          })}

        {/* Citizen Report / Hazard Markers */}
        {showReports &&
          reports.map((report) => {
            const { x, y } = getSvgCoordinates(report.lat, report.lng);
            const isSelected = selectedReportId === report.id || activePopup?.item?.id === report.id;

            return (
              <div
                key={report.id}
                style={{ left: `${x}%`, top: `${y}%` }}
                className="absolute z-16 -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                onClick={() => {
                  setActivePopup({ type: 'report', item: report });
                  if (onSelectReport) onSelectReport(report);
                }}
              >
                <div
                  className={`relative flex items-center justify-center transition-all duration-300 transform group-hover:scale-125 ${
                    isSelected ? 'scale-125 z-30' : 'scale-100'
                  }`}
                >
                  <span className="absolute w-7 h-7 rounded-full bg-amber-500/25 animate-pulse" />
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shadow-md border transition-all ${
                      report.status === 'Verified'
                        ? 'bg-amber-500 text-white border-amber-600 font-bold'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-0.5 rounded-md bg-white border border-amber-300 text-[10px] font-bold text-amber-900 shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  ⚠️ {report.title}
                </div>
              </div>
            );
          })}
      </div>

      {/* Active Interactive Popup Card */}
      {activePopup && (
        <div className="absolute bottom-4 left-4 right-4 md:left-4 md:right-auto md:max-w-sm z-30 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-xl animate-fade-in">
          {activePopup.type === 'place' && (activePopup.item as Place).imageUrl && (
            <div className="relative h-28 w-full rounded-xl overflow-hidden mb-3 bg-slate-100">
              <img
                src={(activePopup.item as Place).imageUrl}
                alt={(activePopup.item as Place).name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  if (!target.dataset.fallback) {
                    target.dataset.fallback = '1';
                    target.src = 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80';
                  }
                }}
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-xs text-[10px] font-bold text-[#0d9488]">
                {(activePopup.item as Place).category}
              </div>
            </div>
          )}

          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              {activePopup.type !== 'place' && (
                <span className="text-[10px] font-bold tracking-wider uppercase text-[#0d9488]">
                  {activePopup.item.category}
                </span>
              )}
              <h4 className="text-sm font-bold text-slate-900 leading-snug">
                {activePopup.type === 'place' ? (activePopup.item as Place).name : (activePopup.item as CitizenReport).title}
              </h4>
              {activePopup.type === 'place' && (activePopup.item as Place).area && (
                <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-[#6344e7]" />
                  <span>{(activePopup.item as Place).area}</span>
                </p>
              )}
            </div>
            <button
              onClick={() => setActivePopup(null)}
              className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>

          <p className="text-xs text-slate-600 mb-3 line-clamp-2">
            {activePopup.item.description}
          </p>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
            {activePopup.type === 'place' ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-amber-600 font-bold">★ {(activePopup.item as Place).rating}</span>
                  <span className="text-teal-700 font-bold">Safety: {(activePopup.item as Place).safetyEvidenceScore}%</span>
                </div>
                {(activePopup.item as Place).googleMapsUrl && (
                  <a
                    href={(activePopup.item as Place).googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] transition-colors"
                  >
                    <span>Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </>
            ) : (
              <>
                <span className="text-amber-800 font-bold">Status: {(activePopup.item as CitizenReport).status}</span>
                <span className="text-slate-500">{(activePopup.item as CitizenReport).timestamp}</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
