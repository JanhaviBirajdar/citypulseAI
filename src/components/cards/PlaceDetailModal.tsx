import React from 'react';
import {
  X,
  MapPin,
  Star,
  Accessibility,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Scale,
  ExternalLink,
  Globe,
  Navigation,
  BookOpen
} from 'lucide-react';
import type { Place } from '../../types';
import { useDemo } from '../../context/DemoContext';
import { DemoBadge } from '../ui/DemoBadge';
import { calculateCityMatch } from '../../services/scoringEngine';

interface PlaceDetailModalProps {
  place: Place | null;
  onClose: () => void;
}

export const PlaceDetailModal: React.FC<PlaceDetailModalProps> = ({ place, onClose }) => {
  const {
    comparePlaceIds,
    toggleComparePlace,
    userPreferences,
    matchWeights,
    reports
  } = useDemo();

  if (!place) return null;

  const isCompared = comparePlaceIds.includes(place.id);
  const matchResult = calculateCityMatch(place, userPreferences.budgetMaxINR, matchWeights);

  const nearbyReports = reports.filter(r => {
    const latDiff = Math.abs(r.lat - place.lat);
    const lngDiff = Math.abs(r.lng - place.lng);
    return latDiff < 0.03 && lngDiff < 0.03;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-8 animate-fade-in">
        {/* Header Image Banner */}
        <div className="relative h-64 w-full bg-slate-100">
          <img
            src={place.imageUrl}
            alt={place.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              if (!target.dataset.fallback) {
                target.dataset.fallback = '1';
                target.src = 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80';
              }
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/90 text-slate-800 flex items-center justify-center hover:bg-white shadow-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title & Category inside image */}
          <div className="absolute bottom-4 left-6 right-6 flex flex-col md:flex-row md:items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-md bg-[#6344e7] text-xs font-bold text-white shadow-sm">
                  {place.category}
                </span>
                <DemoBadge size="sm" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-wide drop-shadow-sm">{place.name}</h2>
              <p className="text-xs text-slate-200 flex items-center gap-1 mt-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-teal-300" />
                <span>{place.area} • Pune, MH</span>
              </p>
            </div>

            {/* CityMatch Score Gauge */}
            <div className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-200 flex items-center gap-3 shadow-lg">
              <Sparkles className="w-5 h-5 text-[#6344e7]" />
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">CityMatch Score</span>
                <span className="text-lg font-black text-slate-900">{matchResult.score} / 100</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Verified Real Links & Navigation Banner */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#6344e7] block">
                  Verified Real Landmark Links
                </span>
                <h4 className="text-sm font-bold text-slate-900">
                  {place.address || `${place.area}, Pune, Maharashtra`}
                </h4>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {place.googleMapsUrl && (
                <a
                  href={place.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-slate-800 hover:text-rose-600 border border-slate-200 text-xs font-bold shadow-xs transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5 text-rose-500" />
                  <span>Google Maps Directions</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              )}

              {place.wikiUrl && (
                <a
                  href={place.wikiUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-blue-50 text-slate-800 hover:text-blue-600 border border-slate-200 text-xs font-bold shadow-xs transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                  <span>Wikipedia Article</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              )}

              {place.officialUrl && (
                <a
                  href={place.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-slate-800 hover:text-emerald-700 border border-slate-200 text-xs font-bold shadow-xs transition-colors"
                >
                  <Globe className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Official Website / Guide</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Overview</h4>
            <p className="text-sm text-slate-700 leading-relaxed">{place.description}</p>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Est. Cost</span>
              <span className="text-sm font-bold text-slate-900">
                {place.estimatedPriceINR === 0 ? 'Free Entry' : `₹${place.estimatedPriceINR} INR`}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Rating</span>
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span className="text-sm font-bold text-slate-900">{place.rating}</span>
                <span className="text-[10px] text-slate-500">({place.reviewCount})</span>
              </div>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Safety Evidence</span>
              <span className="text-sm font-bold text-emerald-600">{place.safetyEvidenceScore}/100</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Best Visit Time</span>
              <span className="text-xs font-semibold text-slate-800 truncate block">{place.bestTime}</span>
            </div>
          </div>

          {/* Accessibility & Facilities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0d9488] flex items-center gap-1.5 mb-3">
                <Accessibility className="w-4 h-4" /> Accessibility Facilities
              </h4>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className={`w-4 h-4 ${place.accessibility.wheelchairAccessible ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>Wheelchair Ramp & Access: {place.accessibility.wheelchairAccessible ? 'Available' : 'Limited Steps'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className={`w-4 h-4 ${place.accessibility.accessibleRestrooms ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>Accessible Restrooms: {place.accessibility.accessibleRestrooms ? 'Yes' : 'None nearby'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className={`w-4 h-4 ${place.accessibility.audioAssistance || place.accessibility.brailleSignage ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>Audio/Braille Guidance: {place.accessibility.audioAssistance ? 'Audio Available' : 'Standard Signage'}</span>
                </li>
              </ul>
              {place.accessibility.notes && (
                <p className="text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-200 italic">
                  Note: {place.accessibility.notes}
                </p>
              )}
            </div>

            {/* General Facilities & Amenities */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#6344e7] mb-3">
                On-Site Facilities
              </h4>
              <div className="flex flex-wrap gap-2">
                {place.facilities.map((fac, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-white text-xs font-medium text-slate-700 border border-slate-200 shadow-xs">
                    {fac}
                  </span>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-500">
                Opening Hours: <span className="text-slate-800 font-semibold">{place.openingHours}</span>
              </div>
            </div>
          </div>

          {/* Citizen Reports Nearby Section */}
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" /> Citizen Reports & Safety Logs Nearby ({nearbyReports.length})
            </h4>
            {nearbyReports.length > 0 ? (
              <div className="space-y-2 mt-2">
                {nearbyReports.map((rep) => (
                  <div key={rep.id} className="p-2.5 rounded-xl bg-white border border-amber-200 text-xs flex items-start justify-between gap-3 shadow-xs">
                    <div>
                      <div className="font-bold text-amber-900">{rep.title}</div>
                      <div className="text-[11px] text-slate-600">{rep.description}</div>
                      <div className="text-[10px] text-slate-500 mt-1">{rep.timestamp} • {rep.reporterAlias}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 shrink-0">
                      {rep.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-600">No active hazard reports logged within 2km of this location.</p>
            )}
          </div>

          {/* Evidence Trust Footer */}
          <div className="p-3 rounded-xl bg-slate-50 text-[11px] text-slate-600 flex items-center justify-between border border-slate-200">
            <span>Data Source: <strong className="text-slate-800">{place.dataSource}</strong></span>
            <span>Last Audit: <strong className="text-slate-800">{place.lastUpdated}</strong></span>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => toggleComparePlace(place.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              isCompared
                ? 'bg-[#6344e7] text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 shadow-xs'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>{isCompared ? 'In Face-Off Comparison' : 'Add to Compare'}</span>
          </button>

          <div className="flex items-center gap-2">
            {place.googleMapsUrl && (
              <a
                href={place.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <Navigation className="w-3.5 h-3.5 text-rose-500" />
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            )}

            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-[#6344e7] hover:bg-indigo-700 text-white shadow-sm transition-colors cursor-pointer"
            >
              Close Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
