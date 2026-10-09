import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  MapPin,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';
import type { ReportCategory } from '../../types';
import { useDemo } from '../../context/DemoContext';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const { addReport } = useDemo();

  const [category, setCategory] = useState<ReportCategory>('Road hazard');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('');
  const [reporterAlias, setReporterAlias] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const categories: ReportCategory[] = [
    'Road hazard',
    'Accident',
    'Traffic disruption',
    'Flooding or waterlogging',
    'Cleanliness concern',
    'Accessibility problem',
    'Public infrastructure issue',
    'Other city concern'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !locationName.trim()) {
      setErrorMsg('Please complete all required fields (Title, Description, and Location).');
      return;
    }

    const lat = 18.5204 + (Math.random() - 0.5) * 0.05;
    const lng = 73.8567 + (Math.random() - 0.5) * 0.05;

    addReport({
      category,
      title: title.trim(),
      description: description.trim(),
      locationName: locationName.trim(),
      lat,
      lng,
      reporterAlias: reporterAlias.trim() || 'Anonymous_Citizen',
      additionalContext: additionalContext.trim() || undefined
    });

    setSubmittedSuccess(true);
    setTimeout(() => {
      setSubmittedSuccess(false);
      onClose();
      setTitle('');
      setDescription('');
      setLocationName('');
      setAdditionalContext('');
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-6 animate-fade-in">
        {/* Header */}
        <div className="h-16 px-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Log Citizen Report</h3>
              <p className="text-[10px] text-slate-500">Public Safety & City Issue Tracker</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {submittedSuccess ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Report Submitted Successfully!</h4>
              <p className="text-xs text-slate-600 max-w-xs mx-auto">
                Your report has been logged under status <strong className="text-amber-800 font-bold">Unverified</strong>. It is now stored in local browser storage and visible to fellow Pune commuters.
              </p>
            </div>
          ) : (
            <>
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                  {errorMsg}
                </div>
              )}

              {/* Category Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Issue Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ReportCategory)}
                  className="w-full bg-slate-50 text-slate-900 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:bg-white focus:border-[#6344e7] focus:outline-none"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Report Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Unlit Pothole on FC Road near Goodluck Chowk"
                  className="w-full bg-slate-50 text-slate-900 placeholder-slate-400 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:bg-white focus:border-[#6344e7] focus:outline-none"
                />
              </div>

              {/* Location Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Location / Area in Pune <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-amber-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    placeholder="e.g. Goodluck Chowk, FC Road, Shivajinagar"
                    className="w-full bg-slate-50 text-slate-900 placeholder-slate-400 text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:bg-white focus:border-[#6344e7] focus:outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Detailed Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the hazard, time observed, lane blockage, or accessibility obstacle..."
                  className="w-full bg-slate-50 text-slate-900 placeholder-slate-400 text-xs p-3 rounded-xl border border-slate-200 focus:bg-white focus:border-[#6344e7] focus:outline-none"
                />
              </div>

              {/* Reporter Alias */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Your Alias / Reporter Name (Optional)
                </label>
                <input
                  type="text"
                  value={reporterAlias}
                  onChange={(e) => setReporterAlias(e.target.value)}
                  placeholder="e.g. Citizen_Pune411 (Private details strictly protected)"
                  className="w-full bg-slate-50 text-slate-900 placeholder-slate-400 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:bg-white focus:border-[#6344e7] focus:outline-none"
                />
              </div>

              {/* Trust Policy Note */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Trust Policy:</strong> All citizen submissions are initially marked <em>Unverified</em>. Misleading or fabricated reports will be flagged during moderation review.
                </span>
              </div>

              {/* Action Submit */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#6344e7] hover:bg-indigo-700 text-white shadow-md shadow-violet-500/20 transition-all cursor-pointer"
                >
                  Submit Citizen Report
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};
