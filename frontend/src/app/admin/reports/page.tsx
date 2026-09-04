'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { reportApi } from '../../../lib/api';
import {
  FileText,
  Clock,
  Pill,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Building2,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { formatWaitTime } from '../../../lib/utils';

export default function AdminReportsPage() {
  const [queueReport, setQueueReport] = useState<any>(null);
  const [stockReport, setStockReport] = useState<any>(null);
  const [clinicPerformance, setClinicPerformance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState<'queue' | 'stock' | 'performance'>('queue');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [q, s, p] = await Promise.all([
        reportApi.getQueueReports(7),
        reportApi.getStockReports(),
        reportApi.getClinicPerformance(),
      ]);
      setQueueReport(q);
      setStockReport(s);
      setClinicPerformance(p || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
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
            <BarChart3 className="w-6 h-6 text-purple-600" />
            Healthcare Operations Intelligence & Reports
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Aggregate clinical metrics: consultation wait distributions, pharmacy out-of-stock indices, and clinic benchmarks.
          </p>
        </div>

        <button
          onClick={fetchReports}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Regenerate Reports</span>
        </button>
      </div>

      {/* Report Tabs */}
      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setReportType('queue')}
          className={`pb-3 text-xs font-bold border-b-2 flex items-center gap-2 ${
            reportType === 'queue'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Clock className="w-4 h-4" />
          Queue & Wait Time Report
        </button>
        <button
          onClick={() => setReportType('stock')}
          className={`pb-3 text-xs font-bold border-b-2 flex items-center gap-2 ${
            reportType === 'stock'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Pill className="w-4 h-4" />
          Pharmacy Stock & Shortage Report
        </button>
        <button
          onClick={() => setReportType('performance')}
          className={`pb-3 text-xs font-bold border-b-2 flex items-center gap-2 ${
            reportType === 'performance'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Clinic Performance Benchmarks
        </button>
      </div>

      {loading ? (
        <div className="h-72 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse" />
      ) : reportType === 'queue' ? (
        <div className="space-y-6">
          {/* Queue KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Avg Wait</span>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {formatWaitTime(queueReport?.averageWaitTime ?? 0)}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Max Wait Recorded</span>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {formatWaitTime(queueReport?.maxWaitTime ?? 0)}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Avg Queue Size</span>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {queueReport?.averageQueue ?? 0} patients
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Peak Queue</span>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {queueReport?.peakQueue ?? 0} patients
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Busiest Clinic</span>
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {queueReport?.busiestClinic ?? 'N/A'}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Busiest Hours</span>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                {queueReport?.busiestTime ?? 'N/A'}
              </p>
            </div>
          </div>

          {/* Average Wait Time by Clinic Chart */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Average Waiting Time by Facility (Minutes)
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={queueReport?.clinicAverages || []}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      color: '#fff',
                      borderRadius: '8px',
                      border: 'none',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="averageWaitMinutes" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Avg Wait (Mins)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : reportType === 'stock' ? (
        <div className="space-y-6">
          {/* Stock KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] text-slate-400 font-semibold uppercase">Overall Availability</span>
              <p className="text-2xl font-black text-emerald-600">
                {stockReport?.stockAvailabilityRate ?? 100}%
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] text-slate-400 font-semibold uppercase">In Stock Items</span>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {stockReport?.inStockItems ?? 0}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] text-amber-600 font-semibold uppercase">Low Stock Warnings</span>
              <p className="text-2xl font-bold text-amber-600">
                {stockReport?.lowStockItems ?? 0}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] text-rose-600 font-semibold uppercase">Critical Out of Stock</span>
              <p className="text-2xl font-bold text-rose-600">
                {stockReport?.outOfStockItems ?? 0}
              </p>
            </div>
          </div>

          {/* Frequently Out of Stock Medications */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              Frequently Out-of-Stock Medication Shortages
            </h3>
            <p className="text-xs text-slate-400">
              Ranked by frequency of reaching zero stock across all public dispensaries.
            </p>

            <div className="space-y-2">
              {stockReport?.frequentlyOutOfStock?.length > 0 ? (
                stockReport.frequentlyOutOfStock.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-xs"
                  >
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {item.name}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 font-bold border border-rose-200">
                      {item.count} stockout incidents
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-4">No recurring stockouts recorded.</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Clinic Performance Benchmarks Table */
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-600 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Facility</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Current Wait</th>
                <th className="px-4 py-3">Avg Wait Time</th>
                <th className="px-4 py-3">Avg Queue</th>
                <th className="px-4 py-3">Peak Queue</th>
                <th className="px-4 py-3 text-right">Stock Availability Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {clinicPerformance.map((c) => (
                <tr key={c.clinicId} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                    {c.name}
                  </td>
                  <td className="px-4 py-3.5 text-slate-400">
                    {c.suburb}, {c.city}
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-slate-800 dark:text-slate-200">
                    {formatWaitTime(c.currentWait)}
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                    {formatWaitTime(c.averageWait)}
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                    {c.averageQueue}
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                    {c.peakQueue}
                  </td>
                  <td className="px-4 py-3.5 text-right font-bold text-emerald-600">
                    {c.stockAvailability}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
