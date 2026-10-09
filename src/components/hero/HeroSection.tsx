import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  Sparkles,
  ArrowRight,
  Route,
  PlayCircle,
  Pause,
  Play,
  RotateCcw
} from 'lucide-react';
import { Hero3DCity } from './Hero3DCity';
import type { MarkerInfo } from './Hero3DCity';
import { FloatingGlassCards } from './FloatingGlassCards';
import { DemoBadge } from '../ui/DemoBadge';

interface HeroSectionProps {
  onSearchSubmit: (query: string) => void;
  onLoadDemoScenario: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onSearchSubmit,
  onLoadDemoScenario
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const [resetSignal, setResetSignal] = useState(0);
  const [selectedMarker, setSelectedMarker] = useState<MarkerInfo | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check user prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    if (mediaQuery.matches) setIsPaused(true);

    const listener = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
      if (e.matches) setIsPaused(true);
    };
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearchSubmit(searchQuery.trim());
    }
  };

  const handleCardClick = (cardType: string) => {
    if (cardType === 'weather') navigate('/insights');
    else if (cardType === 'route') navigate('/saferoute');
    else if (cardType === 'places') navigate('/explore');
    else if (cardType === 'status') navigate('/reports');
  };

  return (
    <div className="relative rounded-3xl bg-gradient-to-r from-white via-violet-50/40 to-teal-50/40 border border-slate-200 overflow-hidden shadow-sm">
      {/* Background ambient radial gradients */}
      <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-gradient-to-br from-[#6344e7]/10 via-[#0d9488]/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-violet-100/40 rounded-full blur-3xl pointer-events-none" />

      {/* Main Grid: Left Column Text & CTAs / Right Column 3D Smart City */}
      <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-8 p-6 sm:p-8 lg:p-10 relative z-10">
        
        {/* Left Column (Content, Search & Actions) - 6 or 7 cols */}
        <motion.div
          initial={{ opacity: 0, x: -25 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="lg:col-span-6 xl:col-span-6 space-y-4"
        >
          {/* Tagline Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex items-center gap-2"
          >
            <span className="px-3 py-1 rounded-full bg-violet-100 text-[#6344e7] border border-violet-200 text-xs font-black tracking-wider uppercase flex items-center gap-1.5 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#6344e7]" /> PUNE DECISION ENGINE
            </span>
            <DemoBadge label="DEMO ENVIRONMENT" size="sm" />
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight"
          >
            Your city, <span className="gradient-text">understood.</span>
          </motion.h1>

          {/* Supporting Text */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed max-w-xl"
          >
            Explore Pune's top heritage sites, street food trails, and budget destinations while staying informed about real-time traffic bottlenecks, weather conditions, and citizen hazard reports.
          </motion.p>

          {/* Search Bar Input */}
          <motion.form
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            onSubmit={handleFormSubmit}
            className="pt-2 flex flex-col sm:flex-row items-center gap-3"
          >
            <div className="relative w-full flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Where do you want to explore? (e.g. Shaniwar Wada, FC Road, Cafes)"
                className="w-full bg-white text-slate-900 placeholder-slate-400 text-sm pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:border-[#6344e7] focus:outline-none focus:ring-2 focus:ring-[#6344e7]/20 transition-all shadow-xs"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#6344e7] hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-violet-500/20 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <span>Explore</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.form>

          {/* Quick CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="pt-2 flex flex-wrap items-center gap-3"
          >
            <button
              onClick={() => navigate('/itinerary')}
              className="px-4 py-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-[#0d9488] border border-teal-200 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Route className="w-4 h-4" />
              <span>Plan My Journey</span>
            </button>
            <button
              onClick={onLoadDemoScenario}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#6344e7] to-indigo-600 hover:from-indigo-600 hover:to-[#6344e7] text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <PlayCircle className="w-4 h-4 text-teal-200" />
              <span>Load 1-Click Demo Scenario</span>
            </button>
          </motion.div>
        </motion.div>

        {/* Right Column (Interactive 3D Smart City Canvas) - 6 cols */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 0.3, ease: 'easeOut' }}
          className="lg:col-span-6 xl:col-span-6 h-[420px] sm:h-[460px] lg:h-[490px] relative rounded-3xl overflow-hidden border border-slate-200/80 bg-gradient-to-b from-white/90 via-slate-50/60 to-violet-50/40 shadow-inner group"
        >
          {/* Floating Glassmorphism Cards */}
          <FloatingGlassCards
            selectedMarker={selectedMarker}
            onCloseMarker={() => setSelectedMarker(null)}
            onCardClick={handleCardClick}
            prefersReducedMotion={prefersReducedMotion}
          />

          {/* 3D Canvas Scene */}
          <Hero3DCity
            isPaused={isPaused}
            selectedMarkerId={selectedMarker?.id}
            onSelectMarker={(m) => setSelectedMarker(m)}
            resetSignal={resetSignal}
          />

          {/* 3D Motion Toolbar Overlay (Bottom Center) */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 shadow-md text-xs">
            <span className="text-[10px] text-slate-500 font-semibold hidden sm:inline">
              Drag to orbit • Click pins to inspect
            </span>

            {/* Pause / Resume Button */}
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              title={isPaused ? 'Resume 3D Rotation' : 'Pause 3D Rotation'}
              aria-label={isPaused ? 'Resume 3D Rotation' : 'Pause 3D Rotation'}
            >
              {isPaused ? <Play className="w-3.5 h-3.5 text-[#6344e7]" /> : <Pause className="w-3.5 h-3.5" />}
            </button>

            {/* Reset Camera Button */}
            <button
              onClick={() => {
                setResetSignal(prev => prev + 1);
                setSelectedMarker(null);
              }}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Reset 3D Camera View"
              aria-label="Reset 3D Camera View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>

      </div>
    </div>
  );
};
