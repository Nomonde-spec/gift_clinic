'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { clinicApi, queueApi } from '../../../lib/api';
import { Clinic, QueueStatus } from '../../../types';
import { StaffQueueForm } from '../../../components/staff/StaffQueueForm';
import { Building2, Clock, Users, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function StaffQueuePage() {
  const { user } = useAuth();
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [queue, setQueue] = useState<QueueStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchClinic = async () => {
    setLoading(true);
    try {
      const clinicId = user?.staffClinics?.[0]?.clinicId;
      if (clinicId) {
        const c = await clinicApi.getClinicById(clinicId);
        setClinic(c);
        setQueue(c.queueStatus || null);
      } else {
        // Fallback for demo: load first clinic
        const all = await clinicApi.getClinics({ limit: 1 });
        if (all.clinics[0]) {
          const c = await clinicApi.getClinicById(all.clinics[0].id);
          setClinic(c);
          setQueue(c.queueStatus || null);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClinic();
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/staff/dashboard"
            className="text-xs font-semibold text-slate-500 hover:text-sky-600 flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Staff Portal
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-6 h-6 text-sky-600" />
            Manage Clinic Queue & Triage Wait
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Updating waiting room numbers updates patient mobile search screens instantly.
          </p>
        </div>

        {clinic && (
          <div className="text-right">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {clinic.name}
            </span>
            <p className="text-[11px] text-slate-400">{clinic.suburb}, {clinic.city}</p>
          </div>
        )}
      </div>

      {loading ? (
        <div className="h-64 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse" />
      ) : clinic ? (
        <StaffQueueForm
          clinicId={clinic.id}
          initialQueue={queue || undefined}
          onUpdated={(updated) => setQueue(updated)}
        />
      ) : (
        <div className="p-8 text-center text-xs text-slate-500">
          No assigned clinic found for this staff member.
        </div>
      )}
    </div>
  );
}
