'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { adminApi, clinicApi, reportApi } from '../../../lib/api';
import {
  Building2,
  Users,
  Clock,
  AlertTriangle,
  AlertCircle,
  FileText,
  Shield,
  Pill,
  ArrowRight,
  TrendingUp,
  Activity,
  Layers,
} from 'lucide-react';

export default function AdminDashboard() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      try {
        const data = await adminApi.getDashboardSummary();
        setSummary(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Header */}
      <div className="rounded-3xl bg-slate-900 text-white p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950 text-purple-300 text-xs font-semibold border border-purple-800">
            <Shield className="w-3.5 h-3.5" />
            <span>Health System Administration Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            System Operations & Clinic Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Real-time public clinic capacity, medication stockout tracking, and staff tenancy management.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/clinics"
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            Manage Clinics
          </Link>
          <Link
            href="/admin/staff"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            Manage Staff
          </Link>
          <Link
            href="/admin/reports"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            System Reports
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm space-y-1">
          <span className="text-[11px] text-slate-400 font-semibold uppercase">Total Clinics</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {summary?.totalClinics ?? 5}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm space-y-1">
          <span className="text-[11px] text-emerald-600 font-semibold uppercase">Open Clinics</span>
          <p className="text-2xl font-bold text-emerald-600">
            {summary?.openClinics ?? 4}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm space-y-1">
          <span className="text-[11px] text-amber-600 font-semibold uppercase">Busy Queues</span>
          <p className="text-2xl font-bold text-amber-600">
            {summary?.busyClinics ?? 2}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm space-y-1">
          <span className="text-[11px] text-purple-600 font-semibold uppercase">Staff Users</span>
          <p className="text-2xl font-bold text-purple-600">
            {summary?.totalStaff ?? 2}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm space-y-1">
          <span className="text-[11px] text-orange-600 font-semibold uppercase">Low Stock</span>
          <p className="text-2xl font-bold text-orange-600">
            {summary?.lowStockCount ?? 0}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm space-y-1">
          <span className="text-[11px] text-rose-600 font-semibold uppercase">Out of Stock</span>
          <p className="text-2xl font-bold text-rose-600">
            {summary?.outOfStockCount ?? 0}
          </p>
        </div>
      </div>

      {/* Admin Modules Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/admin/clinics"
          className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-purple-300 dark:hover:border-purple-700 shadow-sm transition-all group"
        >
          <Building2 className="w-6 h-6 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Clinics Directory</h3>
          <p className="text-xs text-slate-500 mt-1">Create facilities, toggle operating status, and manage opening hours.</p>
        </Link>

        <Link
          href="/admin/staff"
          className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-purple-300 dark:hover:border-purple-700 shadow-sm transition-all group"
        >
          <Users className="w-6 h-6 text-teal-600 mb-2 group-hover:scale-110 transition-transform" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Staff Management</h3>
          <p className="text-xs text-slate-500 mt-1">Provision staff credentials and assign staff to specific clinic branches.</p>
        </Link>

        <Link
          href="/admin/medications"
          className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-purple-300 dark:hover:border-purple-700 shadow-sm transition-all group"
        >
          <Pill className="w-6 h-6 text-sky-600 mb-2 group-hover:scale-110 transition-transform" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Medication Catalogue</h3>
          <p className="text-xs text-slate-500 mt-1">Add essential medicines, configure categories, and adjust low-stock thresholds.</p>
        </Link>

        <Link
          href="/admin/reports"
          className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-purple-300 dark:hover:border-purple-700 shadow-sm transition-all group"
        >
          <FileText className="w-6 h-6 text-amber-600 mb-2 group-hover:scale-110 transition-transform" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Reports & Analytics</h3>
          <p className="text-xs text-slate-500 mt-1">Comprehensive wait time distributions, stockout rates, and peak hour trends.</p>
        </Link>
      </div>

      {/* Recent Audit Activities Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-600" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Recent System Audit Activity
            </h2>
          </div>
          <Link
            href="/admin/audit-logs"
            className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
          >
            View all logs <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">User</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Entity</th>
                <th className="py-2.5 px-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {summary?.recentAudits?.length > 0 ? (
                summary.recentAudits.map((a: any) => (
                  <tr key={a.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 text-slate-400">
                      {new Date(a.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                      {a.user ? `${a.user.name} (${a.user.role})` : 'System'}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold">
                        {a.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">{a.entity}</td>
                    <td className="py-2.5 px-3 text-slate-400 max-w-xs truncate font-mono text-[11px]">
                      {a.details}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400">
                    No recent audit activity records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
