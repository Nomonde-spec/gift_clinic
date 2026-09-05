'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { clinicApi, staffApi } from '../../../lib/api';
import { Clinic, QueueStatus } from '../../../types';
import { StaffQueueForm } from '../../../components/staff/StaffQueueForm';
import { Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function StaffQueuePageContent() {
  const searchParams = useSearchParams();
  const { user, activeClinicId, setActiveClinicId } = useAuth();
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [queue, setQueue] = useState<QueueStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [availableClinics, setAvailableClinics] = useState<Clinic[]>([]);
  const [canManage, setCanManage] = useState<boolean>(false);

  const fetchClinic = async () => {
    setLoading(true);

    if (!user) {
      setClinic(null);
      setQueue(null);
      setAvailableClinics([]);
      setCanManage(false);
      setLoading(false);
      return;
    }

    try {
      const qClinicId = searchParams.get('clinicId') || activeClinicId;
      let targetClinicId: string | null = qClinicId || null;

      if (!targetClinicId && user?.staffClinics && user.staffClinics.length > 0) {
        targetClinicId = user.staffClinics[0].clinicId;
      }

      if (!targetClinicId && user?.role === 'STAFF') {
        try {
          const my = await staffApi.getMyClinic();
          if (my && my.id) targetClinicId = my.id;
        } catch {
          // ignore
        }
      }

      if (!targetClinicId && user?.role === 'ADMIN') {
        try {
          const all = await clinicApi.getClinics({ limit: 20 });
          const firstClinic = all.clinics?.[0];
          if (firstClinic) targetClinicId = firstClinic.id;
        } catch {
          // ignore
        }
      }

      if (targetClinicId) {
        const c = await clinicApi.getClinicById(targetClinicId);
        setClinic(c);
        setQueue(c.queueStatus || null);

        const assigned = user?.staffClinics?.some((sc) => sc.clinicId === c.id) || user?.role === 'ADMIN';
        setCanManage(assigned);

        if (assigned && activeClinicId !== c.id) {
          setActiveClinicId && setActiveClinicId(c.id);
        }

        setLoading(false);
        return;
      }

      if (user?.staffClinics && user.staffClinics.length > 0) {
        setAvailableClinics(user.staffClinics.map((sc) => sc.clinic).filter(Boolean) as Clinic[]);
      } else {
        const all = await clinicApi.getClinics({ limit: 200 });
        setAvailableClinics(all.clinics || []);
      }

      setClinic(null);
      setQueue(null);
      setCanManage(false);
    } catch (err) {
      console.error('Failed to resolve clinic for staff queue page', err);
      setClinic(null);
      setQueue(null);
      setCanManage(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClinic();
  }, [user, activeClinicId, searchParams]);

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Manage Clinic Queue & Triage Wait</h1>
          <p className="mt-3 text-sm text-slate-600">
            Please sign in to manage queue updates for a clinic.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-xs font-semibold text-white"
          >
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  if (user.role !== 'STAFF' && user.role !== 'ADMIN') {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Manage Clinic Queue & Triage Wait</h1>
          <p className="mt-3 text-sm text-slate-600">
            This page is only available to staff and administrators.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-xs font-semibold text-white"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

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

        {/* Clinic picker for when user is unassigned or wants to switch */}
        <div className="flex items-center gap-3">
          {availableClinics.length > 0 && (
            <select
              value={clinic?.id || ''}
              onChange={async (e) => {
                const id = e.target.value;
                if (!id) return;
                setActiveClinicId && setActiveClinicId(id);
                const c = await clinicApi.getClinicById(id);
                setClinic(c);
                setQueue(c.queueStatus || null);
                setCanManage(Boolean(user?.staffClinics?.some((sc) => sc.clinicId === c.id) || user?.role === 'ADMIN'));
              }}
              className="px-3 py-2 rounded-xl bg-slate-800 text-white text-sm"
            >
              <option value="">Select clinic to view/manage</option>
              {availableClinics.map((c) => (
                <option key={c.id} value={c.id}>{c.name} {c.city ? `(${c.city})` : ''}</option>
              ))}
            </select>
          )}

          {clinic && (
          <div className="text-right">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {clinic.name}
            </span>
            <p className="text-[11px] text-slate-400">{clinic.suburb}, {clinic.city}</p>
          </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="h-64 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse" />
      ) : clinic ? (
        // Allow read-only view when user is not assigned to this clinic
        <StaffQueueForm
          clinicId={clinic.id}
          initialQueue={queue || undefined}
          onUpdated={(updated) => setQueue(updated)}
          readOnly={!canManage}
        />
      ) : (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center text-sm text-amber-800">
          No assigned clinic was found for this staff member. Please assign a clinic to the account or select one from the staff dashboard.
        </div>
      )}
    </div>
  );
}

export default function StaffQueuePage() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto px-4 py-12 text-center text-xs text-slate-400">Loading queue manager...</div>}>
      <StaffQueuePageContent />
    </Suspense>
  );
}
