'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { clinicApi } from '../../lib/api';
import { Clinic } from '../../types';
import { ClinicCard } from '../../components/clinics/ClinicCard';
import { ClinicFilters } from '../../components/clinics/ClinicFilters';
import { Building2, RefreshCw, AlertCircle } from 'lucide-react';

function ClinicsContent() {
  const searchParams = useSearchParams();

  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [city, setCity] = useState('');
  const [isOpen, setIsOpen] = useState('');
  const [queueStatus, setQueueStatus] = useState('');
  const [sortBy, setSortBy] = useState('waitAsc');

  const fetchClinics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await clinicApi.getClinics({
        search: search.trim() || undefined,
        city: city || undefined,
        isOpen: isOpen || undefined,
        queueStatus: queueStatus || undefined,
        sortBy,
      });
      setClinics(data.clinics || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load clinic directory.');
    } finally {
      setLoading(false);
    }
  }, [search, city, isOpen, queueStatus, sortBy]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchClinics();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchClinics]);

  const handleReset = () => {
    setSearch('');
    setCity('');
    setIsOpen('');
    setQueueStatus('');
    setSortBy('waitAsc');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-sky-600" />
            Public Clinic Directory & Live Queues
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time triage queue updates, wait estimations, and medication availability across public healthcare facilities.
          </p>
        </div>

        <button
          onClick={fetchClinics}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Filter Component */}
      <ClinicFilters
        search={search}
        setSearch={setSearch}
        city={city}
        setCity={setCity}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        queueStatus={queueStatus}
        setQueueStatus={setQueueStatus}
        sortBy={sortBy}
        setSortBy={setSortBy}
        onReset={handleReset}
      />

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Clinics Results Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 space-y-4 animate-pulse"
            >
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
              <div className="h-16 bg-slate-100 dark:bg-slate-800/60 rounded-xl" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : clinics.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
          <Building2 className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            No clinics found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Try adjusting your search criteria, clearing your filter selections, or selecting another city.
          </p>
          <button
            onClick={handleReset}
            className="mt-2 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline"
          >
            Reset all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clinics.map((clinic) => (
            <ClinicCard key={clinic.id} clinic={clinic} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ClinicsPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-12 text-center text-xs text-slate-400">Loading clinic directory...</div>}>
      <ClinicsContent />
    </Suspense>
  );
}
