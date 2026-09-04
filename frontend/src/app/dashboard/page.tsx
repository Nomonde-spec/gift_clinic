'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { clinicApi, notificationApi } from '../../lib/api';
import { Clinic, NotificationItem } from '../../types';
import { ClinicCard } from '../../components/clinics/ClinicCard';
import {
  Building2,
  Clock,
  AlertTriangle,
  Pill,
  Search,
  Bell,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

export default function PatientDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const clinicData = await clinicApi.getClinics({ limit: 6, sortBy: 'waitAsc' });
      if (clinicData?.clinics) {
        setClinics(clinicData.clinics);
      }

      const notifData = await notificationApi.getNotifications();
      if (notifData?.notifications) {
        setNotifications(notifData.notifications.slice(0, 3));
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/clinics?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/clinics');
    }
  };

  // Quick stats calculations
  const totalClinics = clinics.length;
  const busyClinics = clinics.filter(
    (c) => c.queueStatus?.status === 'BUSY' || c.queueStatus?.status === 'VERY_BUSY'
  ).length;
  const lowStockClinics = clinics.filter(
    (c) => (c.medicationSummary?.lowStock ?? 0) > 0
  ).length;
  const outOfStockClinics = clinics.filter(
    (c) => (c.medicationSummary?.outOfStock ?? 0) > 0
  ).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-sky-600 via-sky-700 to-teal-700 p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-sky-200">
            Patient Health Companion
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            {getGreeting()}, {user?.name || 'Patient'}
          </h1>
          <p className="text-sm text-sky-100 leading-relaxed">
            Check clinic queues, consultation capacities, and medication availability before you travel.
          </p>

          {/* Inline Quick Search */}
          <form onSubmit={handleSearch} className="pt-3 max-w-lg flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search clinics by name, suburb, or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white text-slate-900 placeholder-slate-400 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-sky-950 hover:bg-black text-white text-xs font-bold transition-colors"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Quick Statistics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-600 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Clinics Monitored
            </p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {totalClinics}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Currently Busy
            </p>
            <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
              {busyClinics}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950 text-orange-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Low Stock Alerts
            </p>
            <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
              {lowStockClinics}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Out of Stock Notice
            </p>
            <p className="text-xl font-bold text-rose-600 dark:text-rose-400">
              {outOfStockClinics}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Alerts Feed (If Any) */}
      {notifications.length > 0 && (
        <div className="rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-300">
              <Bell className="w-4 h-4 text-amber-600" />
              <span>Important System & Stock Advisories</span>
            </div>
            <Link
              href="/notifications"
              className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            {notifications.map((n) => (
              <div
                key={n.id}
                className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-amber-200/60 dark:border-slate-800 shadow-xs"
              >
                <p className="font-semibold text-slate-900 dark:text-white truncate">
                  {n.title}
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 line-clamp-2">
                  {n.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Popular / Recommended Clinics */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Public Clinics (Shortest Wait Times First)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live consultation wait times and medication availability
            </p>
          </div>
          <Link
            href="/clinics"
            className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
          >
            Explore all clinics <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-64 rounded-2xl bg-slate-100 dark:bg-slate-800/50 animate-pulse"
              />
            ))}
          </div>
        ) : clinics.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-500 text-sm">
            No clinics found. Please refresh or check back shortly.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clinics.map((clinic) => (
              <ClinicCard key={clinic.id} clinic={clinic} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
