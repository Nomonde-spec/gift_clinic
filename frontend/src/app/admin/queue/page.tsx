'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { clinicApi } from '../../../lib/api';
import { Clinic } from '../../../types';
import { getQueueConfig, formatWaitTime, formatTimeAgo } from '../../../lib/utils';
import {
  Clock,
  Building2,
  Users,
  Stethoscope,
  AlertTriangle,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';

export default function AdminQueueMonitorPage() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClinics = async () => {
    setLoading(true);
    try {
      const res = await clinicApi.getClinics({ limit: 50, sortBy: 'waitDesc' });
      setClinics(res.clinics || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClinics();
    const interval = setInterval(fetchClinics, 30000); // 30s auto polling
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/dashboard"
            className="text-xs font-semibold text-slate-500 hover:text-purple-600 flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Admin Console
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-6 h-6 text-purple-600" />
            System-Wide Queue & Triage Monitor
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time cross-facility queue load. Sorted with longest waiting times first for immediate triage response.
          </p>
        </div>

        <button
          onClick={fetchClinics}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queues</span>
        </button>
      </div>

      {/* Queue Monitor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clinics.map((clinic) => {
          const queue = clinic.queueStatus;
          const cfg = getQueueConfig(queue?.status);
          const isOverloaded =
            queue?.status === 'VERY_BUSY' || (queue?.estimatedWaitMinutes ?? 0) >= 60;

          return (
            <div
              key={clinic.id}
              className={`rounded-2xl border bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4 ${
                isOverloaded
                  ? 'border-amber-300 dark:border-amber-800/80 shadow-amber-500/5'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {clinic.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {clinic.suburb}, {clinic.city}
                  </p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${cfg.color}`}>
                  {cfg.indicator} {cfg.label}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">
                    Waiting
                  </span>
                  <p className="text-lg font-black text-slate-900 dark:text-white">
                    {queue?.peopleWaiting ?? 0}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">
                    Wait Time
                  </span>
                  <p className="text-lg font-black text-slate-900 dark:text-white">
                    {queue ? formatWaitTime(queue.estimatedWaitMinutes) : '0m'}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">
                    Rooms
                  </span>
                  <p className="text-lg font-black text-slate-900 dark:text-white">
                    {queue?.openConsultationRooms ?? 1}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                <span>Updated: {formatTimeAgo(queue?.updatedAt)}</span>
                <Link
                  href={`/clinics/${clinic.id}`}
                  className="font-semibold text-purple-600 dark:text-purple-400 hover:underline"
                >
                  View details →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
