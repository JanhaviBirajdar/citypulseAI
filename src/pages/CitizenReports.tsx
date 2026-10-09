import React, { useState } from 'react';
import {
  FileText,
  PlusCircle,
  ThumbsUp,
  Search,
  UserCheck
} from 'lucide-react';
import { useDemo } from '../context/DemoContext';
import { ReportModal } from '../components/cards/ReportModal';
import type { VerificationStatus } from '../types';
import { DemoBadge } from '../components/ui/DemoBadge';

export const CitizenReports: React.FC = () => {
  const {
    reports,
    updateReportStatus,
    upvoteReport,
    adminModerationMode,
    setAdminModerationMode
  } = useDemo();

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredReports = reports.filter((rep) => {
    if (selectedStatus !== 'All' && rep.status !== selectedStatus) return false;
    if (selectedCategory !== 'All' && rep.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = rep.title.toLowerCase().includes(q);
      const matchDesc = rep.description.toLowerCase().includes(q);
      const matchLoc = rep.locationName.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchLoc) return false;
    }
    return true;
  });

  const getStatusBadge = (status: VerificationStatus) => {
    switch (status) {
      case 'Verified':
        return <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold">Verified</span>;
      case 'Under Review':
        return <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 border border-blue-300 text-xs font-bold">Under Review</span>;
      case 'Unverified':
        return <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold">Unverified</span>;
      case 'Expired':
        return <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 border border-slate-300 text-xs font-bold">Expired</span>;
      case 'Rejected':
        return <span className="px-2.5 py-1 rounded-lg bg-red-100 text-red-800 border border-red-300 text-xs font-bold">Rejected</span>;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black uppercase">
              COMMUNITY SAFETY FEED
            </span>
            <DemoBadge label="PERSISTENT LOCAL STORAGE" size="sm" />
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-7 h-7 text-amber-600" /> Citizen Reports & Trust
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Submit public safety, road hazard, flooding, and infrastructure reports to keep Pune commuters aware.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Admin Moderation Toggle */}
          <button
            onClick={() => setAdminModerationMode(!adminModerationMode)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              adminModerationMode
                ? 'bg-amber-500 text-white shadow-md'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-xs'
            }`}
            title="Toggle Reviewer Moderation Mode to verify or reject reports"
          >
            <UserCheck className="w-4 h-4" />
            <span>{adminModerationMode ? 'Moderator Mode ON' : 'Reviewer Mode'}</span>
          </button>

          {/* Submit Report Button */}
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-[#6344e7] hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-violet-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-teal-200" />
            <span>Submit Report</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative w-full md:flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports by hazard title, area, or description..."
              className="w-full bg-slate-50 text-slate-900 placeholder-slate-400 text-xs pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:bg-white focus:border-[#6344e7] focus:outline-none"
            />
          </div>

          {/* Category & Status Filter */}
          <div className="w-full md:w-auto flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500 font-bold">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-50 text-slate-800 text-xs px-3 py-2 rounded-xl border border-slate-200 font-bold cursor-pointer"
            >
              <option value="All">All Categories</option>
              <option value="Road hazard">Road hazard</option>
              <option value="Accident">Accident</option>
              <option value="Traffic disruption">Traffic disruption</option>
              <option value="Flooding or waterlogging">Flooding / Waterlogging</option>
              <option value="Cleanliness concern">Cleanliness concern</option>
              <option value="Accessibility problem">Accessibility problem</option>
              <option value="Public infrastructure issue">Infrastructure issue</option>
            </select>

            <span className="text-xs text-slate-500 font-bold ml-2">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-50 text-slate-800 text-xs px-3 py-2 rounded-xl border border-slate-200 font-bold cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Verified">Verified</option>
              <option value="Under Review">Under Review</option>
              <option value="Unverified">Unverified</option>
              <option value="Expired">Expired</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports Feed Grid */}
      <div className="space-y-4">
        {filteredReports.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredReports.map((rep) => (
              <div
                key={rep.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-3 hover:border-amber-400 hover:shadow-md transition-all duration-200"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                      ⚠️ {rep.category}
                    </span>
                    {getStatusBadge(rep.status)}
                  </div>

                  <h3 className="text-sm font-black text-slate-900 leading-snug">{rep.title}</h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-medium">{rep.description}</p>

                  {rep.additionalContext && (
                    <div className="mt-2 p-2.5 rounded-xl bg-slate-50 text-[11px] text-slate-600 border border-slate-200">
                      Context: {rep.additionalContext}
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-2 font-medium">
                    <span>📍 {rep.locationName}</span>
                    <span>• {rep.timestamp}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Upvote Button */}
                    <button
                      onClick={() => upvoteReport(rep.id)}
                      className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Upvote / Mark Helpful"
                    >
                      <ThumbsUp className="w-3.5 h-3.5 text-teal-600" />
                      <span>{rep.upvotes}</span>
                    </button>

                    {/* Admin Moderation Actions */}
                    {adminModerationMode && (
                      <div className="flex items-center gap-1 pl-2 border-l border-slate-200">
                        <button
                          onClick={() => updateReportStatus(rep.id, 'Verified')}
                          className="px-2 py-1 rounded bg-emerald-100 text-emerald-800 hover:bg-emerald-200 text-[10px] font-bold cursor-pointer"
                          title="Mark Verified"
                        >
                          Verify
                        </button>
                        <button
                          onClick={() => updateReportStatus(rep.id, 'Expired')}
                          className="px-2 py-1 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 text-[10px] font-bold cursor-pointer"
                          title="Mark Expired"
                        >
                          Expire
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-500 text-xs shadow-xs">
            No citizen reports found matching the selected status or search filter.
          </div>
        )}
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
};
