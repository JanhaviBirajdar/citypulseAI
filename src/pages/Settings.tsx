import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Key,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  Info,
  Globe,
  Sparkles
} from 'lucide-react';
import { useDemo } from '../context/DemoContext';
import { DemoBadge } from '../components/ui/DemoBadge';

export const Settings: React.FC = () => {
  const { resetAllData, adminModerationMode, setAdminModerationMode } = useDemo();

  const [geminiKey, setGeminiKey] = useState('');
  const [mapsKey, setMapsKey] = useState('');
  const [mapboxKey, setMapboxKey] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const savedGemini = localStorage.getItem('citypulse_gemini_api_key') || '';
    const savedMaps = localStorage.getItem('citypulse_maps_api_key') || '';
    const savedMapbox = localStorage.getItem('citypulse_mapbox_token') || import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';
    setGeminiKey(savedGemini);
    setMapsKey(savedMaps);
    setMapboxKey(savedMapbox);
  }, []);

  const handleSaveKeys = (e: React.FormEvent) => {
    e.preventDefault();
    if (geminiKey.trim()) {
      localStorage.setItem('citypulse_gemini_api_key', geminiKey.trim());
    } else {
      localStorage.removeItem('citypulse_gemini_api_key');
    }

    if (mapsKey.trim()) {
      localStorage.setItem('citypulse_maps_api_key', mapsKey.trim());
    } else {
      localStorage.removeItem('citypulse_maps_api_key');
    }

    if (mapboxKey.trim()) {
      localStorage.setItem('citypulse_mapbox_token', mapboxKey.trim());
    } else {
      localStorage.removeItem('citypulse_mapbox_token');
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleResetData = () => {
    if (window.confirm('Reset all citizen reports, comparison selections, and itinerary data back to demo defaults?')) {
      resetAllData();
      alert('Demo datasets successfully reset to defaults.');
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full bg-violet-100 text-[#6344e7] border border-violet-200 text-xs font-black uppercase">
            APPLICATION CONFIGURATION
          </span>
          <DemoBadge label="SECURE ADAPTERS" size="sm" />
        </div>
        <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-7 h-7 text-[#6344e7]" /> Platform Settings & Credentials
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Configure Mapbox GL, Google Gemini AI, and external services, toggle reviewer moderation mode, or reset demo state.
        </p>
      </div>

      {/* API Keys Configuration Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Key className="w-4 h-4 text-[#0d9488]" /> API Key Credentials Configuration
          </h3>
          <span className="text-[11px] text-slate-500 font-medium">Stored locally in browser</span>
        </div>

        {savedSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>API Credentials saved successfully! Active services will prioritize these keys.</span>
          </div>
        )}

        <form onSubmit={handleSaveKeys} className="space-y-4 text-xs">
          {/* Mapbox Token */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-600" /> Mapbox Public Access Token
            </label>
            <input
              type="text"
              value={mapboxKey}
              onChange={(e) => setMapboxKey(e.target.value)}
              placeholder="pk.eyJ1Ijo... (Enables live Mapbox GL Streets, Satellite, & 3D Terrain)"
              className="w-full bg-slate-50 text-slate-900 font-mono text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:bg-white focus:border-[#6344e7] focus:outline-none"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Provides vector tile layers, 3D building pitch, satellite photography, and custom interactive markers.
            </p>
          </div>

          {/* Gemini API Key */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#6344e7]" /> Google Gemini API Key
            </label>
            <input
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="AIzaSy... (Leave empty to use deterministic City Decision Engine)"
              className="w-full bg-slate-50 text-slate-900 placeholder-slate-400 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:bg-white focus:border-[#6344e7] focus:outline-none"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Powers Gemini 1.5 Flash natural-language contextual explanations and itinerary synthesis.
            </p>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#6344e7] hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-violet-500/20 transition-all cursor-pointer"
            >
              Save Credentials
            </button>
          </div>
        </form>
      </div>

      {/* Reviewer Moderation & Local Demo Data Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600" /> Moderation & Data Maintenance
          </h3>
        </div>

        {/* Reviewer Mode Toggle */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div>
            <div className="text-xs font-bold text-slate-900">Reviewer Moderation Interface</div>
            <div className="text-[11px] text-slate-500 font-medium">
              Allows authorized reviewers to mark citizen reports as Verified, Expired, or Rejected.
            </div>
          </div>
          <button
            onClick={() => setAdminModerationMode(!adminModerationMode)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              adminModerationMode
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            {adminModerationMode ? 'Moderator Mode ON' : 'Turn ON'}
          </button>
        </div>

        {/* Reset Demo Data Button */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-red-50/60 border border-red-200">
          <div>
            <div className="text-xs font-bold text-slate-900">Reset Demo Storage</div>
            <div className="text-[11px] text-slate-500 font-medium">
              Clear custom citizen reports, comparison arrays, and reset to default Pune hackathon dataset.
            </div>
          </div>
          <button
            onClick={handleResetData}
            className="px-4 py-2 rounded-xl bg-white hover:bg-red-50 text-red-600 border border-red-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* Environment Security Note */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs text-slate-600 flex items-start gap-3 shadow-xs">
        <Info className="w-5 h-5 text-[#6344e7] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-slate-800">Security Guarantee:</strong> CITYPULSE AI never exposes secret API keys in client bundles. API keys entered in Settings are kept only in your local browser storage.
        </p>
      </div>
    </div>
  );
};
