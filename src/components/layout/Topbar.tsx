import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  CloudSun,
  Bell,
  PlayCircle,
  Menu,
  User,
  X
} from 'lucide-react';
import { useDemo } from '../../context/DemoContext';
import { DemoBadge } from '../ui/DemoBadge';

interface TopbarProps {
  onMenuClick: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onMenuClick }) => {
  const { city, weather, loadDemoScenario, places } = useDemo();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const filteredPlaces = searchQuery.trim()
    ? places.filter(
        p =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.area.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleSelectSearchResult = (placeId: string) => {
    setSearchQuery('');
    setShowSearchResults(false);
    navigate(`/explore?search=${placeId}`);
  };

  const handleDemoClick = () => {
    loadDemoScenario();
    navigate('/itinerary');
  };

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 lg:px-6">
      {/* Left section: Mobile menu & City Selector */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-slate-600 hover:text-slate-900 p-2 rounded-lg hover:bg-slate-100"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* City Selector */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200">
          <MapPin className="w-4 h-4 text-[#0d9488]" />
          <span className="text-xs font-bold text-slate-800 tracking-wide">{city}</span>
          <span className="text-[10px] bg-violet-100 text-[#6344e7] font-bold px-1.5 py-0.5 rounded">
            DEMO CITY
          </span>
        </div>
      </div>

      {/* Center Search Bar */}
      <div className="relative hidden md:block flex-1 max-w-md mx-6">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(true);
            }}
            placeholder="Search Pune attractions, cafes, heritage, food..."
            className="w-full bg-slate-50 text-slate-900 placeholder-slate-400 text-xs pl-10 pr-8 py-2 rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:border-[#6344e7] focus:ring-1 focus:ring-[#6344e7] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Instant Search Dropdown */}
        {showSearchResults && searchQuery.trim() !== '' && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50">
            {filteredPlaces.length > 0 ? (
              <div className="max-h-60 overflow-y-auto py-1">
                {filteredPlaces.map(place => (
                  <button
                    key={place.id}
                    onClick={() => handleSelectSearchResult(place.id)}
                    className="w-full px-4 py-2.5 text-left hover:bg-slate-50 flex items-center justify-between transition-colors border-b border-slate-100 last:border-0"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-800">{place.name}</div>
                      <div className="text-[10px] text-slate-500">{place.category} • {place.area}</div>
                    </div>
                    <span className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                      ★ {place.rating}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-slate-500">
                No matching Pune places found. Try "Food", "Shaniwar", "Fort", or "Heritage".
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Section: Weather, Load Demo Scenario CTA, Notifications, Profile */}
      <div className="flex items-center gap-2 lg:gap-3">
        {/* Weather Summary */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200">
          <CloudSun className="w-4 h-4 text-amber-500" />
          <div className="text-left leading-none">
            <div className="text-xs font-bold text-slate-800">{weather.temperatureC}°C</div>
            <div className="text-[9px] text-slate-500 font-medium">AQI {weather.aqi} ({weather.aqiStatus})</div>
          </div>
          <DemoBadge label="DEMO" size="sm" />
        </div>

        {/* Load Demo Scenario CTA */}
        <button
          onClick={handleDemoClick}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#6344e7] to-indigo-600 hover:from-indigo-600 hover:to-[#6344e7] text-white text-xs font-bold shadow-md shadow-violet-500/20 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
          title="Run 1-click Hackathon Demonstration Flow"
        >
          <PlayCircle className="w-4 h-4 text-teal-200" />
          <span className="hidden sm:inline">Load Demo Scenario</span>
          <span className="sm:hidden">Demo</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-600 hover:text-slate-900 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 transition-colors relative cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#0d9488] animate-ping" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#0d9488]" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-50">
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
                <h4 className="text-xs font-bold text-slate-800">City Safety Advisories</h4>
                <span className="text-[10px] text-teal-600 font-bold">Live Feed</span>
              </div>
              <div className="space-y-2">
                <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900">
                  <div className="font-bold text-amber-900">FC Road Road Hazard</div>
                  <div>Pothole report near Goodluck Chowk verified by citizens 2h ago.</div>
                </div>
                <div className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-[11px] text-blue-900">
                  <div className="font-bold text-blue-900">Weather Alert</div>
                  <div>Mild afternoon sunshine. Stay hydrated during heritage walking tours.</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-2 pl-1">
          <div className="w-8 h-8 rounded-xl bg-violet-50 border border-violet-200 flex items-center justify-center text-[#6344e7] text-xs font-bold">
            <User className="w-4 h-4" />
          </div>
        </div>
      </div>
    </header>
  );
};
