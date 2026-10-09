import React from 'react';
import { motion } from 'framer-motion';
import { CloudSun, Compass, ShieldAlert, Activity, X } from 'lucide-react';
import type { MarkerInfo } from './Hero3DCity';
import { DemoBadge } from '../ui/DemoBadge';

interface FloatingGlassCardsProps {
  selectedMarker: MarkerInfo | null;
  onCloseMarker: () => void;
  onCardClick?: (cardType: string) => void;
  prefersReducedMotion?: boolean;
}

export const FloatingGlassCards: React.FC<FloatingGlassCardsProps> = ({
  selectedMarker,
  onCloseMarker,
  onCardClick,
  prefersReducedMotion = false
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
      {/* Card 1: Top-Right Weather Card */}
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.9 }}
        animate={{
          opacity: 1,
          y: prefersReducedMotion ? 0 : [0, -6, 0],
          scale: 1,
          rotate: prefersReducedMotion ? 0 : [0, 0.8, 0]
        }}
        transition={{
          duration: prefersReducedMotion ? 0.3 : 4,
          repeat: prefersReducedMotion ? 0 : Infinity,
          ease: 'easeInOut',
          delay: 0.2
        }}
        className="absolute top-4 right-4 pointer-events-auto cursor-pointer"
        onClick={() => onCardClick && onCardClick('weather')}
      >
        <div className="bg-white/85 backdrop-blur-md p-3 rounded-2xl border border-slate-200/90 shadow-lg hover:shadow-xl hover:border-[#6344e7]/40 transition-all duration-300 max-w-[190px]">
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[9px] font-black tracking-wider uppercase text-[#0d9488] flex items-center gap-1">
              <CloudSun className="w-3 h-3 text-amber-500" /> WEATHER
            </span>
            <DemoBadge size="sm" label="DEMO" />
          </div>
          <div className="text-sm font-black text-slate-900">28°C • Partly Cloudy</div>
          <div className="text-[10px] text-slate-500 font-medium mt-0.5">AQI 72 (Moderate) • Pune Node</div>
        </div>
      </motion.div>

      {/* Card 2: Top-Left Route Insight Card */}
      <motion.div
        initial={{ opacity: 0, x: -20, scale: 0.9 }}
        animate={{
          opacity: 1,
          x: prefersReducedMotion ? 0 : [0, 4, 0],
          y: prefersReducedMotion ? 0 : [0, 5, 0],
          scale: 1
        }}
        transition={{
          duration: prefersReducedMotion ? 0.3 : 4.6,
          repeat: prefersReducedMotion ? 0 : Infinity,
          ease: 'easeInOut',
          delay: 0.4
        }}
        className="absolute top-8 left-2 pointer-events-auto cursor-pointer"
        onClick={() => onCardClick && onCardClick('route')}
      >
        <div className="bg-white/85 backdrop-blur-md p-3 rounded-2xl border border-slate-200/90 shadow-lg hover:shadow-xl hover:border-[#0d9488]/40 transition-all duration-300 max-w-[200px]">
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[9px] font-black tracking-wider uppercase text-[#6344e7] flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-[#6344e7]" /> ROUTE INSIGHT
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="text-xs font-black text-slate-900">Laxmi Road Bypass</div>
          <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">0 Active Hazards • 18 min</div>
        </div>
      </motion.div>

      {/* Card 3: Bottom-Right City Discovery Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{
          opacity: 1,
          y: prefersReducedMotion ? 0 : [0, -7, 0],
          scale: 1,
          rotate: prefersReducedMotion ? 0 : [0, -0.6, 0]
        }}
        transition={{
          duration: prefersReducedMotion ? 0.3 : 5.2,
          repeat: prefersReducedMotion ? 0 : Infinity,
          ease: 'easeInOut',
          delay: 0.6
        }}
        className="absolute bottom-6 right-4 pointer-events-auto cursor-pointer"
        onClick={() => onCardClick && onCardClick('places')}
      >
        <div className="bg-white/85 backdrop-blur-md p-3 rounded-2xl border border-slate-200/90 shadow-lg hover:shadow-xl hover:border-[#6344e7]/40 transition-all duration-300 max-w-[210px]">
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[9px] font-black tracking-wider uppercase text-indigo-600 flex items-center gap-1">
              <Compass className="w-3 h-3 text-[#6344e7]" /> DISCOVERY
            </span>
            <span className="text-[9px] font-bold text-amber-600">★ 4.7 Match</span>
          </div>
          <div className="text-xs font-black text-slate-900">Shaniwar Wada & FC Road</div>
          <div className="text-[10px] text-slate-500 font-medium mt-0.5">Heritage Fort & Culinary Trail</div>
        </div>
      </motion.div>

      {/* Card 4: Bottom-Left City Status Card */}
      <motion.div
        initial={{ opacity: 0, x: -20, scale: 0.9 }}
        animate={{
          opacity: 1,
          y: prefersReducedMotion ? 0 : [0, 6, 0],
          scale: 1
        }}
        transition={{
          duration: prefersReducedMotion ? 0.3 : 4.4,
          repeat: prefersReducedMotion ? 0 : Infinity,
          ease: 'easeInOut',
          delay: 0.8
        }}
        className="absolute bottom-4 left-3 pointer-events-auto cursor-pointer hidden sm:block"
        onClick={() => onCardClick && onCardClick('status')}
      >
        <div className="bg-white/85 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-200/90 shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-[#0d9488]" />
          <div>
            <div className="text-[9px] font-black uppercase tracking-wider text-slate-500">CITY STATUS</div>
            <div className="text-xs font-black text-slate-900">6 Verified Safety Logs</div>
          </div>
        </div>
      </motion.div>

      {/* Interactive Detail Modal if 3D marker is clicked */}
      {selectedMarker && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          className="absolute inset-x-6 bottom-16 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:bottom-8 pointer-events-auto z-30"
        >
          <div className="bg-white/95 backdrop-blur-xl p-4 rounded-2xl border border-violet-300 shadow-2xl max-w-sm w-full animate-fade-in">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <span
                  className="w-3.5 h-3.5 rounded-full shadow-sm"
                  style={{ backgroundColor: selectedMarker.color }}
                />
                <div>
                  <span className="text-[10px] font-black uppercase text-[#6344e7] tracking-wider block">
                    {selectedMarker.category}
                  </span>
                  <h4 className="text-sm font-black text-slate-900 leading-snug">
                    {selectedMarker.name}
                  </h4>
                </div>
              </div>
              <button
                onClick={onCloseMarker}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
                aria-label="Close Marker Details"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600 mb-2">
              Interactive 3D Point: <strong className="text-slate-800">{selectedMarker.tag}</strong>. Mapped with verified safety evidence and community reports.
            </p>
            <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-100">
              <span className="text-slate-500 font-medium">Simulated Smart City Sector</span>
              <DemoBadge size="sm" label="VERIFIED NODE" />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
