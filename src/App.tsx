import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DemoProvider } from './context/DemoContext';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { Dashboard } from './pages/Dashboard';
import { Explore } from './pages/Explore';
import { CityFaceOff } from './pages/CityFaceOff';
import { SafeRoute } from './pages/SafeRoute';
import { SmartItinerary } from './pages/SmartItinerary';
import { CitizenReports } from './pages/CitizenReports';
import { CityInsights } from './pages/CityInsights';
import { Settings } from './pages/Settings';

export const AppContent: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8f9fc] text-slate-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Container */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        {/* Top Header */}
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        {/* Dynamic Page Router Body */}
        <main className="flex-1 px-4 lg:px-8 pt-6 pb-12 max-w-7xl w-full mx-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/map" element={<SafeRoute />} />
            <Route path="/faceoff" element={<CityFaceOff />} />
            <Route path="/saferoute" element={<SafeRoute />} />
            <Route path="/itinerary" element={<SmartItinerary />} />
            <Route path="/reports" element={<CitizenReports />} />
            <Route path="/insights" element={<CityInsights />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export function App() {
  return (
    <BrowserRouter>
      <DemoProvider>
        <AppContent />
      </DemoProvider>
    </BrowserRouter>
  );
}

export default App;
