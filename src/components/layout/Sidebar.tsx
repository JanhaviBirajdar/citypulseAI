import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  MapPin,
  Scale,
  ShieldAlert,
  Route,
  FileText,
  BarChart3,
  Settings,
  Sparkles,
  X
} from 'lucide-react';
import { useDemo } from '../../context/DemoContext';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const { comparePlaceIds, reports } = useDemo();

  const unverifiedCount = reports.filter(r => r.status === 'Unverified' || r.status === 'Under Review').length;

  const navItems = [
    { name: 'Overview', path: '/', icon: LayoutDashboard },
    { name: 'Explore City', path: '/explore', icon: Compass },
    { name: 'Smart Map', path: '/map', icon: MapPin },
    {
      name: 'City Face-Off',
      path: '/faceoff',
      icon: Scale,
      badge: comparePlaceIds.length > 0 ? comparePlaceIds.length : undefined,
      badgeColor: 'bg-[#6344e7] text-white shadow-sm'
    },
    { name: 'SafeRoute Lens', path: '/saferoute', icon: ShieldAlert },
    { name: 'Smart Itinerary', path: '/itinerary', icon: Route },
    {
      name: 'Citizen Reports',
      path: '/reports',
      icon: FileText,
      badge: unverifiedCount > 0 ? unverifiedCount : undefined,
      badgeColor: 'bg-amber-100 text-amber-800 border border-amber-300 font-bold'
    },
    { name: 'City Insights', path: '/insights', icon: BarChart3 },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-sm ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center shadow-md shadow-violet-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg text-slate-900 tracking-wide flex items-center gap-1.5 font-['Space_Grotesk']">
                CITYPULSE <span className="text-[#0d9488] text-xs font-bold px-1.5 py-0.5 rounded bg-teal-50 border border-teal-200">AI</span>
              </h1>
              <p className="text-[10px] text-slate-500 font-medium tracking-tight">Explore Smart. Travel Aware.</p>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="lg:hidden text-slate-500 hover:text-slate-800 p-1 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) onToggle();
                }}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#6344e7]/10 text-[#6344e7] border border-[#6344e7]/25 shadow-sm font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-[#6344e7]' : 'text-slate-500'}`} />
                      <span>{item.name}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Demo Status Banner */}
        <div className="p-4 m-3 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-800">Pune City Node</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Hackathon Live Environment. All simulated sensors & reports labeled demo mode.
          </p>
        </div>
      </aside>
    </>
  );
};
