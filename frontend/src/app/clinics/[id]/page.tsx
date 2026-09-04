'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { clinicApi, queueApi } from '../../../lib/api';
import { Clinic, QueueHistoryRecord } from '../../../types';
import { getQueueConfig, formatWaitTime, formatTimeAgo } from '../../../lib/utils';
import { MedicationStockTable } from '../../../components/clinics/MedicationStockTable';
import { QueueAnalyticsCharts } from '../../../components/charts/QueueAnalyticsCharts';
import { useAuth } from '../../../context/AuthContext';
import {
  Building2,
  MapPin,
  Phone,
  Clock,
  Users,
  Stethoscope,
  Calendar,
  AlertTriangle,
  Pill,
  BarChart3,
  Edit,
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

export default function ClinicDetailPage() {
  const { id } = useParams() as { id: string };
  const { user } = useAuth();

  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [history, setHistory] = useState<QueueHistoryRecord[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'medication' | 'analytics' | 'hours'>('medication');

  const fetchClinicData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [clinicData, historyData, analyticsData] = await Promise.all([
        clinicApi.getClinicById(id),
        queueApi.getQueueHistory(id, 7).catch(() => []),
        queueApi.getQueueAnalytics(id).catch(() => null),
      ]);

      if (!clinicData) {
        setError('Clinic not found.');
      } else {
        setClinic(clinicData);
        setHistory(historyData || []);
        setAnalytics(analyticsData);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve clinic information.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchClinicData();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="h-64 rounded-3xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse" />
      </div>
    );
  }

  if (error || !clinic) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <Building2 className="w-12 h-12 text-slate-400 mx-auto" />
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-200">
          Clinic Details Unavailable
        </h1>
        <p className="text-xs text-slate-500">{error || 'The requested facility could not be found.'}</p>
        <Link
          href="/clinics"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 text-white font-semibold text-xs"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Clinic Directory
        </Link>
      </div>
    );
  }

  const queue = clinic.queueStatus;
  const queueConfig = getQueueConfig(queue?.status);

  // Check if current user is an assigned staff member or admin
  const isAssignedStaff =
    user?.role === 'ADMIN' ||
    user?.staffClinics?.some((sc) => sc.clinicId === clinic.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button & Staff Action */}
      <div className="flex items-center justify-between">
        <Link
          href="/clinics"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-sky-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Directory
        </Link>

        {isAssignedStaff && (
          <div className="flex items-center gap-2">
            <Link
              href="/staff/queue"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs transition-colors shadow-sm"
            >
              <Edit className="w-3.5 h-3.5" /> Staff Queue Controls
            </Link>
            <Link
              href="/staff/stock"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition-colors shadow-sm"
            >
              <Pill className="w-3.5 h-3.5" /> Manage Inventory
            </Link>
          </div>
        )}
      </div>

      {/* Main Clinic Header Banner */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  clinic.isOpen
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                }`}
              >
                {clinic.isOpen ? 'OPEN FOR INTAKE' : 'FACILITY CLOSED'}
              </span>

              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${queueConfig.color}`}>
                <span>{queueConfig.indicator}</span>
                <span>{queueConfig.label}</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {clinic.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {clinic.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {clinic.address}, {clinic.suburb}, {clinic.city}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {clinic.phone}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Today: {clinic.openingTime} – {clinic.closingTime}
              </span>
            </div>
          </div>

          {/* Real-Time Queue Snapshot Box */}
          <div className="w-full md:w-80 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/80 dark:to-slate-800/40 border border-slate-200 dark:border-slate-700/60 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2.5">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Live Queue Snapshot
              </span>
              <span className="text-[11px] text-slate-400">
                {formatTimeAgo(queue?.updatedAt)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Users className="w-3 h-3 text-sky-500" /> Waiting Count
                </span>
                <p className="text-2xl font-black text-slate-900 dark:text-white">
                  {queue ? queue.peopleWaiting : 0}
                </p>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-sky-500" /> Consult Wait
                </span>
                <p className="text-2xl font-black text-slate-900 dark:text-white">
                  {queue ? formatWaitTime(queue.estimatedWaitMinutes) : '0 mins'}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Stethoscope className="w-3.5 h-3.5 text-teal-500" />
                Open Consultation Rooms:
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                {queue?.openConsultationRooms ?? 1}
              </span>
            </div>
          </div>
        </div>

        {/* High Queue Alert Notice */}
        {(queue?.status === 'VERY_BUSY' || (queue?.status === 'BUSY' && (queue?.estimatedWaitMinutes ?? 0) >= 60)) && (
          <div className="mt-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-xs flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Clinic is currently experiencing high demand</p>
              <p className="mt-0.5 text-amber-800 dark:text-amber-400">
                Estimated waiting time is currently <strong>{formatWaitTime(queue.estimatedWaitMinutes)}</strong> with <strong>{queue.peopleWaiting} patients</strong> waiting. Consider visiting during off-peak hours or checking adjacent community clinics.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Analytics Highlights (If Available) */}
      {analytics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
            <span className="text-[11px] text-slate-400 font-medium">Current Wait</span>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              {formatWaitTime(analytics.currentWait)}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
            <span className="text-[11px] text-slate-400 font-medium">Average Wait Today</span>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              {formatWaitTime(analytics.averageWaitToday)}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
            <span className="text-[11px] text-slate-400 font-medium">Peak Wait Today</span>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              {formatWaitTime(analytics.peakWaitToday)}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
            <span className="text-[11px] text-slate-400 font-medium">Busiest Hours Window</span>
            <p className="text-base font-bold text-slate-900 dark:text-white mt-1">
              {analytics.peakTime}
            </p>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('medication')}
            className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'medication'
                ? 'border-sky-600 text-sky-600 dark:border-sky-400 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Pill className="w-4 h-4" />
            Medication Stock ({clinic.medicationStock?.length ?? 0})
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'analytics'
                ? 'border-sky-600 text-sky-600 dark:border-sky-400 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Queue Trends & Analytics
          </button>

          <button
            onClick={() => setActiveTab('hours')}
            className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'hours'
                ? 'border-sky-600 text-sky-600 dark:border-sky-400 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Operating Schedule
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      {activeTab === 'medication' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Pharmacy & Essential Medicines Inventory
            </h2>
            <span className="text-xs text-slate-500">
              Live updates from clinic pharmacy dispensary
            </span>
          </div>

          <MedicationStockTable stockItems={clinic.medicationStock || []} />
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Queue Load & Waiting Time Fluctuations
            </h2>
            <span className="text-xs text-slate-500">
              Historical recordings over past 7 days
            </span>
          </div>

          <QueueAnalyticsCharts history={history} />
        </div>
      )}

      {activeTab === 'hours' && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">
            Weekly Operating Schedule
          </h2>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-w-xl">
            {clinic.operatingHours && clinic.operatingHours.length > 0 ? (
              clinic.operatingHours.map((h) => (
                <div key={h.id} className="py-2.5 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {h.dayOfWeek}
                  </span>
                  {h.isClosed ? (
                    <span className="text-rose-500 font-bold">Closed</span>
                  ) : (
                    <span className="text-slate-600 dark:text-slate-400">
                      {h.openTime} – {h.closeTime}
                    </span>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 py-4">Standard schedule: Mon–Fri 07:00–17:00, Sat 08:00–13:00.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
