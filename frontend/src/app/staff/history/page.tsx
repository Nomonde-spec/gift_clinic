'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { clinicApi, queueApi, stockApi } from '../../../lib/api';
import { QueueHistoryRecord, StockHistoryRecord } from '../../../types';
import { QueueAnalyticsCharts } from '../../../components/charts/QueueAnalyticsCharts';
import { getStockConfig, getQueueConfig, formatTimeAgo } from '../../../lib/utils';
import { History, ArrowLeft, Clock, Pill, RefreshCw } from 'lucide-react';

export default function StaffHistoryPage() {
  const { user } = useAuth();

  const [queueHistory, setQueueHistory] = useState<QueueHistoryRecord[]>([]);
  const [stockHistory, setStockHistory] = useState<StockHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'queue' | 'stock'>('queue');

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const clinicId = user?.staffClinics?.[0]?.clinicId;
      let targetClinicId = clinicId;

      if (!targetClinicId) {
        const all = await clinicApi.getClinics({ limit: 1 });
        if (all.clinics[0]) targetClinicId = all.clinics[0].id;
      }

      if (targetClinicId) {
        const [q, s] = await Promise.all([
          queueApi.getQueueHistory(targetClinicId, 7),
          stockApi.getStockHistory(targetClinicId),
        ]);
        setQueueHistory(q || []);
        setStockHistory(s || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <Link
          href="/staff/dashboard"
          className="text-xs font-semibold text-slate-500 hover:text-sky-600 flex items-center gap-1 mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Staff Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <History className="w-6 h-6 text-purple-600" />
          Clinic Queue & Stock History Logs
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Complete audit trail of all queue triage and pharmaceutical inventory adjustments.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('queue')}
          className={`pb-3 text-xs font-bold border-b-2 flex items-center gap-1.5 ${
            activeTab === 'queue'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Clock className="w-4 h-4" /> Queue History ({queueHistory.length})
        </button>
        <button
          onClick={() => setActiveTab('stock')}
          className={`pb-3 text-xs font-bold border-b-2 flex items-center gap-1.5 ${
            activeTab === 'stock'
              ? 'border-teal-600 text-teal-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Pill className="w-4 h-4" /> Stock Transaction Logs ({stockHistory.length})
        </button>
      </div>

      {loading ? (
        <div className="h-64 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse" />
      ) : activeTab === 'queue' ? (
        <div className="space-y-6">
          <QueueAnalyticsCharts history={queueHistory} />

          {/* Queue History Table */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-600 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">People Waiting</th>
                  <th className="px-4 py-3">Estimated Wait</th>
                  <th className="px-4 py-3">Consultation Rooms</th>
                  <th className="px-4 py-3">Queue Status</th>
                  <th className="px-4 py-3">Logged By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {queueHistory.map((q) => {
                  const cfg = getQueueConfig(q.status);
                  return (
                    <tr key={q.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 text-slate-400">
                        {new Date(q.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                        {q.peopleWaiting}
                      </td>
                      <td className="px-4 py-3">{q.estimatedWaitMinutes} mins</td>
                      <td className="px-4 py-3">{q.openConsultationRooms}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${cfg.color}`}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {q.updatedBy ? `${q.updatedBy.name} ${q.updatedBy.surname}` : 'System'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Stock History Table */
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-600 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Medication</th>
                <th className="px-4 py-3">Previous Qty</th>
                <th className="px-4 py-3">New Qty</th>
                <th className="px-4 py-3">Status Transition</th>
                <th className="px-4 py-3">Updated By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {stockHistory.map((s) => {
                const prevCfg = getStockConfig(s.previousStatus);
                const nextCfg = getStockConfig(s.newStatus);
                return (
                  <tr key={s.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 text-slate-400">
                      {new Date(s.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                      {s.medication?.name || 'Medication'}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{s.previousQuantity}</td>
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                      {s.newQuantity} {s.medication?.unit}
                    </td>
                    <td className="px-4 py-3 flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${prevCfg.color}`}>
                        {prevCfg.label}
                      </span>
                      <span className="text-slate-400">→</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${nextCfg.color}`}>
                        {nextCfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {s.updatedBy ? `${s.updatedBy.name} ${s.updatedBy.surname}` : 'Staff'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
