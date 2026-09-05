'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { clinicApi, stockApi } from '../../../lib/api';
import { Clinic } from '../../../types';
import { getQueueConfig, formatWaitTime, formatTimeAgo } from '../../../lib/utils';
import {
  Building2,
  Users,
  Clock,
  Stethoscope,
  Pill,
  AlertTriangle,
  AlertCircle,
  ArrowRight,
  Edit,
  History,
  CheckCircle2,
} from 'lucide-react';

function StaffDashboardContent() {
  const { user, activeClinicId, setActiveClinicId } = useAuth();

  const [assignedClinic, setAssignedClinic] = useState<Clinic | null>(null);
  const [accessibleClinics, setAccessibleClinics] = useState<Clinic[]>([]);
  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(activeClinicId || null);
  const [stockSummary, setStockSummary] = useState<{
    total: number;
    inStock: number;
    lowStock: number;
    outOfStock: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStaffData = async () => {
    setLoading(true);
    try {
      // Build accessible clinics list from user assignment or fallback to all clinics
      if (user?.staffClinics && user.staffClinics.length > 0) {
        const list = user.staffClinics.map((sc) => sc.clinic).filter(Boolean) as Clinic[];
        setAccessibleClinics(list);
        // choose selected id: query param -> preserved selection -> first assigned
        const initialId = selectedClinicId || (list[0] && list[0].id) || null;
        if (initialId) setSelectedClinicId(initialId);
      } else {
        const all = await clinicApi.getClinics({ limit: 50 });
        setAccessibleClinics(all.clinics || []);
        if (!selectedClinicId && all.clinics[0]) setSelectedClinicId(all.clinics[0].id);
      }

      // If we have a selectedClinicId, load its details
      if (selectedClinicId) {
        const clinicData = await clinicApi.getClinicById(selectedClinicId);
        setAssignedClinic(clinicData);

        const stockData = await stockApi.getStock(selectedClinicId);
        if (stockData?.summary) {
          setStockSummary({
            total: stockData.summary.total,
            inStock: stockData.summary.inStockCount,
            lowStock: stockData.summary.lowStockCount,
            outOfStock: stockData.summary.outOfStockCount,
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const search = useSearchParams();

  // respect clinicId query param when present
  useEffect(() => {
    const q = search.get('clinicId');
    if (q) {
      setSelectedClinicId(q);
      setActiveClinicId && setActiveClinicId(q);
    }
  }, [search, setActiveClinicId]);

  useEffect(() => {
    fetchStaffData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, selectedClinicId]);

  const queue = assignedClinic?.queueStatus;
  const queueConfig = getQueueConfig(queue?.status);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Staff Header */}
      <div className="rounded-3xl bg-slate-900 text-white p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-950 text-teal-300 text-xs font-semibold border border-teal-800">
            <span>Healthcare Staff Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name} {user?.surname}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Assigned Facility:{' '}
            <strong className="text-white">
              {assignedClinic?.name || 'Assigned Health Facility'}
            </strong>{' '}
            ({assignedClinic?.city || 'South Africa'})
          </p>
          {/* Clinic selector for staff who have access to multiple clinics */}
          {accessibleClinics.length > 0 && (
            <div className="mt-3">
              <label className="block text-[11px] text-slate-400 mb-1">Active Clinic</label>
              <select
                value={selectedClinicId || ''}
                onChange={(e) => {
                  const id = e.target.value || null;
                  setSelectedClinicId(id);
                  setActiveClinicId && setActiveClinicId(id);
                }}
                className="px-3 py-2 rounded-xl bg-slate-800 text-white text-sm"
              >
                {accessibleClinics.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} {c.city ? `(${c.city})` : ''}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2.5">
          <Link
            href={assignedClinic ? `/staff/queue?clinicId=${assignedClinic.id}` : '/staff/queue'}
            className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Edit className="w-3.5 h-3.5" /> Update Queue
          </Link>
          <Link
            href={assignedClinic ? `/staff/stock?clinicId=${assignedClinic.id}` : '/staff/stock'}
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Pill className="w-3.5 h-3.5" /> Update Stock
          </Link>
          <Link
            href={assignedClinic ? `/staff/history?clinicId=${assignedClinic.id}` : '/staff/history'}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <History className="w-3.5 h-3.5" /> View History
          </Link>
        </div>
      </div>

      {/* Live Queue Status Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Current Queue Metrics ({assignedClinic?.name})
          </h2>
          <span className="text-xs text-slate-400">
            Updated {formatTimeAgo(queue?.updatedAt)}
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-sky-500" /> People Waiting
            </span>
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              {queue ? queue.peopleWaiting : 0}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-sky-500" /> Estimated Wait
            </span>
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              {queue ? formatWaitTime(queue.estimatedWaitMinutes) : '0 mins'}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Stethoscope className="w-3.5 h-3.5 text-teal-500" /> Consult Rooms
            </span>
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              {queue ? queue.openConsultationRooms : 1}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-1">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Queue Severity
            </span>
            <div className="pt-1">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border ${queueConfig.color}`}>
                <span>{queueConfig.indicator}</span>
                <span>{queueConfig.label}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Medication Stock Overview Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Pharmacy Dispensary Status
          </h2>
          <Link
            href="/staff/stock"
            className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
          >
            Manage inventory <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
            <span className="text-xs text-slate-500 font-medium">Total Tracked Meds</span>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              {stockSummary?.total ?? 12}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Sufficient Stock
            </span>
            <p className="text-xl font-bold text-emerald-600 mt-1">
              {stockSummary?.inStock ?? 0}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
            <span className="text-xs text-amber-600 font-medium flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Low Stock
            </span>
            <p className="text-xl font-bold text-amber-600 mt-1">
              {stockSummary?.lowStock ?? 0}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
            <span className="text-xs text-rose-600 font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> Out of Stock
            </span>
            <p className="text-xl font-bold text-rose-600 mt-1">
              {stockSummary?.outOfStock ?? 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StaffDashboard() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-12 text-center text-xs text-slate-400">Loading staff dashboard...</div>}>
      <StaffDashboardContent />
    </Suspense>
  );
}
