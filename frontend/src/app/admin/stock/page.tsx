'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { clinicApi, stockApi } from '../../../lib/api';
import { Clinic, ClinicStockItem } from '../../../types';
import { getStockConfig } from '../../../lib/utils';
import {
  Package,
  Building2,
  Pill,
  Search,
  Filter,
  AlertTriangle,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';

export default function AdminCrossStockPage() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [selectedClinicId, setSelectedClinicId] = useState<string>('');
  const [stockItems, setStockItems] = useState<ClinicStockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const res = await clinicApi.getClinics({ limit: 50 });
        setClinics(res.clinics || []);
        if (res.clinics?.[0]) {
          setSelectedClinicId(res.clinics[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchClinics();
  }, []);

  useEffect(() => {
    if (!selectedClinicId) return;

    const fetchStock = async () => {
      setLoading(true);
      try {
        const res = await stockApi.getStock(selectedClinicId);
        setStockItems(res.stock || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStock();
  }, [selectedClinicId]);

  const filtered = stockItems.filter((item) => {
    const matchesSearch =
      item.medication.name.toLowerCase().includes(search.toLowerCase()) ||
      item.medication.category.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === 'ALL' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
            <Package className="w-6 h-6 text-purple-600" />
            Cross-Facility Stock & Inventory Monitor
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            System-wide inventory levels, stockout frequency alerts, and dispensary reserves.
          </p>
        </div>
      </div>

      {/* Facility Selector & Filter Bar */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">
            Select Clinic Facility
          </label>
          <select
            value={selectedClinicId}
            onChange={(e) => setSelectedClinicId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
          >
            {clinics.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.city})
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">
            Search Medication
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search medicine name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">
            Status Filter
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs"
          >
            <option value="ALL">All Items</option>
            <option value="IN_STOCK">🟢 In Stock</option>
            <option value="LOW_STOCK">🟠 Low Stock</option>
            <option value="OUT_OF_STOCK">🔴 Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Stock Matrix Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-600 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Medication</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Current Quantity</th>
              <th className="px-4 py-3">Warning Threshold</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Last Updated By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  Loading stock data...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  No stock records match the selected filters.
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const cfg = getStockConfig(item.status);
                return (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                      {item.medication.name}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">
                      {item.medication.category}
                    </td>
                    <td className="px-4 py-3.5 font-bold font-mono text-slate-900 dark:text-white">
                      {item.quantity} {item.medication.unit}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 font-mono">
                      {item.medication.lowStockThreshold} {item.medication.unit}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] border ${cfg.color}`}>
                        {cfg.indicator} {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-400">
                      {item.lastUpdatedBy ? item.lastUpdatedBy.name : 'System Initialized'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
