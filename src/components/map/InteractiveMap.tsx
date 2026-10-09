import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
  MapPin,
  AlertTriangle,
  Navigation,
  ExternalLink,
  Globe,
  CheckCircle2,
  Key
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
  // Read token from environment variable or localStorage
  const envToken = (import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '').trim();
  const [activeToken, setActiveToken] = useState<string>(() => {
    return localStorage.getItem('citypulse_mapbox_token') || envToken;
  });
  const [tokenInput, setTokenInput] = useState<string>(activeToken);
  const [showTokenModal, setShowTokenModal] = useState<boolean>(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const hasMapbox = Boolean(activeToken && activeToken.startsWith('pk.'));

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  const [mapStyle, setMapStyle] = useState<'streets-v12' | 'light-v11' | 'outdoors-v12' | 'satellite-streets-v12'>('streets-v12');
  const [showPlaces, setShowPlaces] = useState<boolean>(true);
  const [showReports, setShowReports] = useState<boolean>(true);
  const [showRoutes, setShowRoutes] = useState<boolean>(true);
  const [activePopup, setActivePopup] = useState<{ type: 'place' | 'report'; item: any } | null>(null);
  const [mapboxLoaded, setMapboxLoaded] = useState<boolean>(false);

  // Initialize Mapbox GL when token is provided
  useEffect(() => {
    if (!hasMapbox || !mapContainerRef.current) return;

    try {
      mapboxgl.accessToken = activeToken;

      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: `mapbox://styles/mapbox/${mapStyle}`,
        center: [73.8567, 18.5204], // Pune Center
        zoom: 12.2,
        pitch: 25,
        attributionControl: true
      });

      map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'bottom-right');

      map.on('load', () => {
        mapInstanceRef.current = map;
        setMapboxLoaded(true);
        setTokenError(null);
        map.resize();
      });

      map.on('error', (e) => {
        // Catch auth or tile errors gracefully
        if (e && (e.error?.message?.includes('401') || e.error?.message?.includes('Forbidden') || e.error?.message?.includes('token'))) {
          setTokenError('Mapbox Token rejected or unauthorized. Switched to smart vector view.');
        }
      });

      // Handle resize trigger after layout stabilizes
      const timer = setTimeout(() => {
        map.resize();
      }, 300);

      return () => {
        clearTimeout(timer);
        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];
        map.remove();
        mapInstanceRef.current = null;
        setMapboxLoaded(false);
      };
    } catch (err: any) {
      console.warn('Mapbox initialization fallback:', err);
      setTokenError(err?.message || 'Could not initialize WebGL Mapbox context');
    }
  }, [hasMapbox, activeToken, mapStyle]);

  // Update Mapbox Markers when places/reports/toggles change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapboxLoaded) return;

    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // 1. Add Place Markers
    if (showPlaces) {
      places.forEach(place => {
        const isSelected = place.id === selectedPlaceId;
        const el = document.createElement('div');
        el.className = 'cursor-pointer transform hover:scale-110 transition-transform';
        el.innerHTML = `
          <div class="relative flex items-center justify-center">
            <div class="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg border-2 ${
              isSelected
                ? 'bg-[#6344e7] text-white border-white ring-4 ring-[#6344e7]/30 scale-125'
                : 'bg-white text-[#6344e7] border-slate-300 hover:bg-[#6344e7] hover:text-white'
            }">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-white/95 border border-slate-200 text-[10px] font-black text-slate-800 whitespace-nowrap shadow-md pointer-events-none">
              ${place.name.split(' ')[0]} (★${place.rating})
            </div>
          </div>
        `;

        el.addEventListener('click', () => {
          setActivePopup({ type: 'place', item: place });
          if (onSelectPlace) onSelectPlace(place);
        });

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([place.lng, place.lat])
          .addTo(map);

        markersRef.current.push(marker);
      });
    }

    // 2. Add Citizen Hazard Markers
    if (showReports) {
      reports.forEach(report => {
        const isSelected = report.id === selectedReportId;
        const el = document.createElement('div');
        el.className = 'cursor-pointer transform hover:scale-125 transition-transform';
        el.innerHTML = `
          <div class="relative flex items-center justify-center">
            <span class="absolute w-8 h-8 rounded-full bg-amber-500/25 animate-ping"></span>
            <div class="w-7 h-7 rounded-lg flex items-center justify-center shadow-lg border-2 ${
              report.status === 'Verified'
                ? 'bg-amber-500 text-white border-amber-600 font-bold'
                : 'bg-amber-100 text-amber-800 border-amber-300'
            } ${isSelected ? 'ring-4 ring-amber-500/30 scale-125' : ''}">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
          </div>
        `;

        el.addEventListener('click', () => {
          setActivePopup({ type: 'report', item: report });
          if (onSelectReport) onSelectReport(report);
        });

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([report.lng, report.lat])
          .addTo(map);

        markersRef.current.push(marker);
      });
    }

    // 3. Add SafeRoute Layers
    if (showRoutes && routes.length > 0) {
      routes.forEach((route, idx) => {
        const sourceId = `route-source-${route.id || idx}`;
        const layerId = `route-layer-${route.id || idx}`;

        if (map.getSource(sourceId)) {
          map.removeLayer(layerId);
          map.removeSource(sourceId);
        }

        const geojson: any = {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: route.coordinates.map(c => [c[1], c[0]]) // Mapbox expects [lng, lat]
              }
            }
          ]
        };

        map.addSource(sourceId, {
          type: 'geojson',
          data: geojson
        });

        map.addLayer({
          id: layerId,
          type: 'line',
          source: sourceId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': route.isRecommended ? '#6344e7' : '#0d9488',
            'line-width': route.isRecommended ? 5 : 3.5,
            'line-opacity': 0.85
          }
        });
      });
    }
  }, [places, reports, routes, showPlaces, showReports, showRoutes, selectedPlaceId, selectedReportId, mapboxLoaded, onSelectPlace, onSelectReport]);

  // Center on selected place
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedPlaceId) return;
    const targetPlace = places.find(p => p.id === selectedPlaceId);
    if (targetPlace) {
      mapInstanceRef.current.flyTo({
        center: [targetPlace.lng, targetPlace.lat],
        zoom: 14.5,
        essential: true
      });
      setActivePopup({ type: 'place', item: targetPlace });
    }
  }, [selectedPlaceId, places]);

  // Fallback SVG coordinate mapper for non-Mapbox mode
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
    <div className={`relative w-full ${heightClass} bg-[#eef2f6] rounded-2xl border border-slate-200 overflow-hidden group shadow-md`}>
      {/* Top Map Control Bar */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
        <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 flex items-center gap-2 shadow-md">
          <Navigation className="w-3.5 h-3.5 text-[#0d9488]" />
          <span className="text-xs font-bold text-slate-800">Pune City Map</span>
          {hasMapbox ? (
            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-300 flex items-center gap-1">
              <Globe className="w-3 h-3 text-emerald-600" /> MAPBOX GL LIVE
            </span>
          ) : (
            <DemoBadge label="OSM VECTOR GRID" size="sm" />
          )}
        </div>

        {hasMapbox ? (
          <div className="flex items-center gap-2">
            <div className="bg-white/95 backdrop-blur-md p-1 rounded-xl border border-slate-200 flex items-center gap-1 shadow-md text-xs">
              <button
                onClick={() => setMapStyle('streets-v12')}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  mapStyle === 'streets-v12' ? 'bg-[#6344e7] text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Streets
              </button>
              <button
                onClick={() => setMapStyle('light-v11')}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  mapStyle === 'light-v11' ? 'bg-[#6344e7] text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Light
              </button>
              <button
                onClick={() => setMapStyle('satellite-streets-v12')}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  mapStyle === 'satellite-streets-v12' ? 'bg-[#6344e7] text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Satellite
              </button>
              <button
                onClick={() => setMapStyle('outdoors-v12')}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  mapStyle === 'outdoors-v12' ? 'bg-[#6344e7] text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Terrain
              </button>
            </div>

            <button
              onClick={() => setShowTokenModal(true)}
              title="Mapbox Token Status & Settings"
              className="bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-200 flex items-center gap-1.5 shadow-md text-slate-700 hover:text-[#6344e7] text-xs font-bold transition-colors cursor-pointer"
            >
              <Key className="w-3.5 h-3.5 text-[#6344e7]" />
              <span className="text-[11px] hidden sm:inline">Token Active</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowTokenModal(true)}
            className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-amber-200 text-amber-800 flex items-center gap-1.5 shadow-md hover:bg-amber-50 text-xs font-bold transition-colors cursor-pointer"
          >
            <Key className="w-3.5 h-3.5 text-amber-600" />
            <span>Connect Mapbox Token</span>
          </button>
        )}
      </div>

      {/* Token Error Warning Banner if any */}
      {tokenError && (
        <div className="absolute top-16 left-4 right-4 md:right-auto md:max-w-md z-30 bg-amber-50 border border-amber-200 text-amber-900 px-3 py-2 rounded-xl text-xs shadow-md flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{tokenError}</span>
          </div>
          <button
            onClick={() => setShowTokenModal(true)}
            className="text-[11px] font-bold underline text-[#6344e7] hover:text-[#4f32c9] cursor-pointer"
          >
            Update Token
          </button>
        </div>
      )}

      {/* Mapbox Token Modal */}
      {showTokenModal && (
        <div className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full shadow-2xl border border-slate-200 animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#6344e7]/10 flex items-center justify-center text-[#6344e7]">
                  <Key className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Mapbox Access Token</h3>
              </div>
              <button
                onClick={() => setShowTokenModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-3">
              Enter your Mapbox public token starting with <code className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded font-mono text-[11px]">pk.eyJ...</code>. This enables live high-resolution street, satellite, and terrain tiles.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Access Token</label>
                <input
                  type="text"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value.trim())}
                  placeholder="pk.eyJ1Ijo..."
                  className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-[#6344e7] focus:ring-2 focus:ring-[#6344e7]/20"
                />
              </div>

              {activeToken && (
                <div className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-2 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Currently using token: <strong className="font-mono">{activeToken.slice(0, 14)}...{activeToken.slice(-6)}</strong></span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem('citypulse_mapbox_token');
                    setActiveToken(envToken);
                    setTokenInput(envToken);
                    setShowTokenModal(false);
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Reset to .env
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (tokenInput) {
                      localStorage.setItem('citypulse_mapbox_token', tokenInput);
                      setActiveToken(tokenInput);
                    } else {
                      localStorage.removeItem('citypulse_mapbox_token');
                      setActiveToken('');
                    }
                    setShowTokenModal(false);
                  }}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#6344e7] hover:bg-[#5233d6] text-white transition-all shadow-md cursor-pointer"
                >
                  Save & Apply Live
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Layer Toggles */}
      {showLayersControl && (
        <div className="absolute top-4 right-4 z-20 bg-white/95 backdrop-blur-md p-1.5 rounded-xl border border-slate-200 flex items-center gap-1 shadow-md text-xs">
          <button
            onClick={() => setShowPlaces(!showPlaces)}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              showPlaces
                ? 'bg-[#6344e7] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Places ({places.length})
          </button>
          <button
            onClick={() => setShowReports(!showReports)}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
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
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
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

      {/* Main Map Canvas: Mapbox GL Instance OR Vector SVG Fallback */}
      {hasMapbox ? (
        <div ref={mapContainerRef} className="w-full h-full" />
      ) : (
        /* Fallback Vector Map Layer when token is absent */
        <div className="w-full h-full relative overflow-hidden bg-[#eef2f6]">
          {/* Light Grid Pattern & River */}
          <svg className="w-full h-full absolute inset-0 opacity-40 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="lightGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#cbd5e1" strokeWidth="0.8" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#lightGrid)" />
            <path
              d="M 5% 40% Q 25% 48%, 45% 42% T 85% 35% T 95% 55%"
              fill="none"
              stroke="#93c5fd"
              strokeWidth="14"
              strokeOpacity="0.7"
              strokeLinecap="round"
            />
          </svg>

          {/* Fallback Route Lines */}
          {showRoutes && routes.length > 0 && (
            <svg className="w-full h-full absolute inset-0 z-10 pointer-events-none">
              {routes.map((route) => {
                const pointsStr = route.coordinates
                  .map(coord => {
                    const pt = getSvgCoordinates(coord[0], coord[1]);
                    return `${pt.x}%,${pt.y}%`;
                  })
                  .join(' ');

                return (
                  <polyline
                    key={route.id}
                    points={pointsStr}
                    fill="none"
                    stroke={route.isRecommended ? '#6344e7' : '#0d9488'}
                    strokeWidth={route.isRecommended ? '4' : '2.5'}
                    strokeDasharray={route.isRecommended ? 'none' : '6 4'}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-all"
                  />
                );
              })}
            </svg>
          )}

          {/* Fallback Place Markers */}
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
                  <div className={`relative flex items-center justify-center transition-all ${isSelected ? 'scale-125 z-30' : 'scale-100'}`}>
                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center shadow-md border ${isSelected ? 'bg-[#6344e7] text-white border-white' : 'bg-white text-[#6344e7] border-slate-300'}`}>
                      <MapPin className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-0.5 rounded-md bg-white border border-slate-200 shadow-md text-[10px] font-bold text-slate-800 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {place.name} (★{place.rating})
                  </div>
                </div>
              );
            })}

          {/* Fallback Report Markers */}
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
                  <div className={`relative flex items-center justify-center transition-all ${isSelected ? 'scale-125 z-30' : 'scale-100'}`}>
                    <span className="absolute w-7 h-7 rounded-full bg-amber-500/25 animate-pulse" />
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shadow-md border ${report.status === 'Verified' ? 'bg-amber-500 text-white border-amber-600' : 'bg-amber-100 text-amber-800 border-amber-300'}`}>
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}

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
