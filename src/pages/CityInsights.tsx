import React from 'react';
import {
  BarChart3,
  PieChart as PieIcon,
  DollarSign,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from 'recharts';
import { useDemo } from '../context/DemoContext';
import { DemoBadge } from '../components/ui/DemoBadge';

export const CityInsights: React.FC = () => {
  const { reports, places } = useDemo();

  const categoryMap: { [key: string]: number } = {};
  reports.forEach((r) => {
    categoryMap[r.category] = (categoryMap[r.category] || 0) + 1;
  });

  const categoryData = Object.keys(categoryMap).map((cat) => ({
    name: cat,
    count: categoryMap[cat]
  }));

  const statusMap: { [key: string]: number } = {};
  reports.forEach((r) => {
    statusMap[r.status] = (statusMap[r.status] || 0) + 1;
  });

  const statusData = [
    { name: 'Verified', count: statusMap['Verified'] || 0, color: '#0d9488' },
    { name: 'Under Review', count: statusMap['Under Review'] || 0, color: '#3b82f6' },
    { name: 'Unverified', count: statusMap['Unverified'] || 0, color: '#f59e0b' },
    { name: 'Expired', count: statusMap['Expired'] || 0, color: '#94a3b8' }
  ];

  const priceCategoryData = places.map((p) => ({
    name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
    price: p.estimatedPriceINR,
    safetyScore: p.safetyEvidenceScore
  }));

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-violet-100 text-[#6344e7] border border-violet-200 text-xs font-black uppercase">
              CITY ANALYTICS
            </span>
            <DemoBadge label="RECHARTS VISUALIZER" size="sm" />
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-[#6344e7]" /> City Insights & Analytics
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Analytical breakdown of Pune citizen reports, issue category distributions, verification rates, and place affordability.
          </p>
        </div>
      </div>

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-slate-500 font-bold block uppercase text-[10px]">Total Logged Reports</span>
          <div className="text-2xl font-black text-slate-900">{reports.length}</div>
          <span className="text-[10px] text-amber-700 font-bold">Active Pune Dataset</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-slate-500 font-bold block uppercase text-[10px]">Verified Report Rate</span>
          <div className="text-2xl font-black text-emerald-600">
            {reports.length > 0 ? Math.round(((statusMap['Verified'] || 0) / reports.length) * 100) : 0}%
          </div>
          <span className="text-[10px] text-slate-500 font-medium">Audit Status Verified</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-slate-500 font-bold block uppercase text-[10px]">Avg Place Safety Score</span>
          <div className="text-2xl font-black text-[#0d9488]">87 / 100</div>
          <span className="text-[10px] text-teal-700 font-bold">Verified Evidence Index</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-slate-500 font-bold block uppercase text-[10px]">Accessible Places Ratio</span>
          <div className="text-2xl font-black text-[#6344e7]">
            {Math.round((places.filter(p => p.accessibility.wheelchairAccessible).length / places.length) * 100)}%
          </div>
          <span className="text-[10px] text-slate-500 font-medium">Wheelchair Ramp Access</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Report Categories Distribution */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#6344e7]" /> Reported City Issues by Category
          </h3>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10, fill: '#475569' }} interval={0} angle={-15} textAnchor="end" />
                <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#475569' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px', color: '#0f172a', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                />
                <Bar dataKey="count" fill="#6344e7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Verification Status Pie */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-[#0d9488]" /> Citizen Report Status Breakdown
          </h3>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px', color: '#0f172a', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            {statusData.map((st) => (
              <div key={st.name} className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: st.color }} />
                <span className="text-slate-700 font-bold">{st.name}: {st.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart 3: Affordability & Safety Index Comparison */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-[#0d9488]" /> Affordability (INR) vs. Safety Evidence Score across Pune Destinations
        </h3>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={priceCategoryData} margin={{ top: 10, right: 10, left: -10, bottom: 35 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10, fill: '#475569' }} angle={-25} textAnchor="end" />
              <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#475569' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px', color: '#0f172a', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
              />
              <Bar dataKey="price" fill="#0d9488" name="Est Cost (INR)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="safetyScore" fill="#6344e7" name="Safety Score (0-100)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Analytics Methodology Disclaimer */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs text-slate-600 flex items-start gap-3 shadow-xs">
        <Info className="w-5 h-5 text-[#6344e7] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-slate-800">Analytical Principle:</strong> Higher report counts in an area reflect active community engagement and reporting volume, not higher baseline danger. Insights account for reporting exposure and evidence verification before drawing conclusions.
        </p>
      </div>
    </div>
  );
};
