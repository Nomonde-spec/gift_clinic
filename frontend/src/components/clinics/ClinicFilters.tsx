'use client';

import React from 'react';
import { Search, Filter, ArrowDownAZ, Clock, RotateCcw } from 'lucide-react';

interface ClinicFiltersProps {
  search: string;
  setSearch: (val: string) => void;
  city: string;
  setCity: (val: string) => void;
  isOpen: string;
  setIsOpen: (val: string) => void;
  queueStatus: string;
  setQueueStatus: (val: string) => void;
  sortBy: string;
  setSortBy: (val: string) => void;
  onReset: () => void;
}

export const ClinicFilters: React.FC<ClinicFiltersProps> = ({
  search,
  setSearch,
  city,
  setCity,
  isOpen,
  setIsOpen,
  queueStatus,
  setQueueStatus,
  sortBy,
  setSortBy,
  onReset,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm space-y-4">
      {/* Search Input Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by clinic name, suburb, or street address..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
        />
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* City Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
            City / Region
          </label>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
          >
            <option value="">All Cities</option>
            <option value="Johannesburg">Johannesburg</option>
            <option value="Cape Town">Cape Town</option>
            <option value="Pretoria">Pretoria</option>
            <option value="Durban">Durban</option>
          </select>
        </div>

        {/* Operating Status */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Status
          </label>
          <select
            value={isOpen}
            onChange={(e) => setIsOpen(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
          >
            <option value="">All Facilities</option>
            <option value="true">Open Now Only</option>
            <option value="false">Closed Only</option>
          </select>
        </div>

        {/* Queue Severity */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Queue Severity
          </label>
          <select
            value={queueStatus}
            onChange={(e) => setQueueStatus(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
          >
            <option value="">All Queue Levels</option>
            <option value="LOW">🟢 Low Queue</option>
            <option value="MODERATE">🔵 Moderate</option>
            <option value="BUSY">🟠 Busy</option>
            <option value="VERY_BUSY">🔴 Very Busy</option>
          </select>
        </div>

        {/* Sort Options */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
          >
            <option value="waitAsc">Shortest Wait Time</option>
            <option value="waitDesc">Longest Wait Time</option>
            <option value="nameAsc">Clinic Name (A-Z)</option>
            <option value="nameDesc">Clinic Name (Z-A)</option>
            <option value="createdDesc">Newest</option>
          </select>
        </div>
      </div>

      {/* Quick Chips & Reset */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-[11px]">Quick filters:</span>
          <button
            type="button"
            onClick={() => {
              setIsOpen('true');
              setQueueStatus('LOW');
            }}
            className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-medium hover:bg-emerald-100"
          >
            ⚡ Open & Low Wait
          </button>
          <button
            type="button"
            onClick={() => setSortBy('waitAsc')}
            className="px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 font-medium hover:bg-sky-100"
          >
            ⏱ Shortest Queue
          </button>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium"
        >
          <RotateCcw className="w-3 h-3" /> Reset Filters
        </button>
      </div>
    </div>
  );
};
