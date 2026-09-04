'use client';

import React, { useState } from 'react';
import { ClinicStockItem, StockStatusType } from '../../types';
import { stockApi } from '../../lib/api';
import { getStockConfig, formatTimeAgo } from '../../lib/utils';
import {
  Search,
  Filter,
  Save,
  Check,
  AlertTriangle,
  History,
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

interface StaffStockManagerProps {
  clinicId: string;
  initialStock: ClinicStockItem[];
}

export const StaffStockManager: React.FC<StaffStockManagerProps> = ({
  clinicId,
  initialStock,
}) => {
  const [stockList, setStockList] = useState<ClinicStockItem[]>(initialStock);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Local state for quantity edits before saving
  const [editedQuantities, setEditedQuantities] = useState<Record<string, number>>({});

  const handleQuantityChange = (medicationId: string, value: number) => {
    const valid = Math.max(0, value);
    setEditedQuantities((prev) => ({
      ...prev,
      [medicationId]: valid,
    }));
  };

  const handleStep = (medicationId: string, currentQty: number, delta: number) => {
    const active = editedQuantities[medicationId] !== undefined ? editedQuantities[medicationId] : currentQty;
    const nextVal = Math.max(0, active + delta);
    handleQuantityChange(medicationId, nextVal);
  };

  const saveStock = async (item: ClinicStockItem) => {
    const newQty =
      editedQuantities[item.medicationId] !== undefined
        ? editedQuantities[item.medicationId]
        : item.quantity;

    if (newQty < 0) {
      setNotice({ type: 'error', message: 'Quantity cannot be negative' });
      return;
    }

    setUpdatingId(item.medicationId);
    setNotice(null);

    try {
      const res = await stockApi.updateStock(clinicId, item.medicationId, {
        quantity: newQty,
      });

      if (res.data?.stock) {
        setStockList((prev) =>
          prev.map((s) =>
            s.medicationId === item.medicationId ? res.data.stock : s
          )
        );
        // Clean edited map
        setEditedQuantities((prev) => {
          const updated = { ...prev };
          delete updated[item.medicationId];
          return updated;
        });

        setNotice({
          type: 'success',
          message: `${item.medication.name} updated to ${newQty} ${item.medication.unit}. Status: ${res.data.stock.status}`,
        });
      }
    } catch (err: any) {
      setNotice({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update stock.',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = stockList.filter((item) => {
    const matchesSearch =
      item.medication.name.toLowerCase().includes(search.toLowerCase()) ||
      item.medication.category.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === 'ALL' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {notice && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
            notice.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {notice.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            )}
            <span>{notice.message}</span>
          </div>
          <button
            onClick={() => setNotice(null)}
            className="text-[11px] font-bold text-slate-400 hover:text-slate-600"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search medicine to update..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
        >
          <option value="ALL">All Stock Statuses</option>
          <option value="IN_STOCK">🟢 In Stock</option>
          <option value="LOW_STOCK">🟠 Low Stock Warnings</option>
          <option value="OUT_OF_STOCK">🔴 Out of Stock Alerts</option>
        </select>
      </div>

      {/* Stock Management Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">Medication</th>
              <th className="px-4 py-3">Threshold</th>
              <th className="px-4 py-3">Adjust Quantity</th>
              <th className="px-4 py-3">Current Status</th>
              <th className="px-4 py-3">Last Updated</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  No medications found matching your criteria.
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const currentEditVal =
                  editedQuantities[item.medicationId] !== undefined
                    ? editedQuantities[item.medicationId]
                    : item.quantity;
                const isModified = currentEditVal !== item.quantity;
                const statusConfig = getStockConfig(item.status);

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {item.medication.name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {item.medication.category} • {item.medication.unit}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400">
                      <span className="font-mono">{item.medication.lowStockThreshold}</span> {item.medication.unit}
                    </td>

                    {/* Stepper + Direct input */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center w-36">
                        <button
                          type="button"
                          onClick={() => handleStep(item.medicationId, item.quantity, -5)}
                          className="px-2 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-l-lg font-bold text-xs"
                          title="-5"
                        >
                          -5
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStep(item.medicationId, item.quantity, -1)}
                          className="px-2 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 border-l border-slate-200 dark:border-slate-700 font-bold text-xs"
                          title="-1"
                        >
                          -1
                        </button>
                        <input
                          type="number"
                          min="0"
                          value={currentEditVal}
                          onChange={(e) =>
                            handleQuantityChange(
                              item.medicationId,
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="w-full text-center py-1 border-y border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold font-mono text-slate-900 dark:text-white focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleStep(item.medicationId, item.quantity, 1)}
                          className="px-2 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 font-bold text-xs"
                          title="+1"
                        >
                          +1
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStep(item.medicationId, item.quantity, 5)}
                          className="px-2 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-r-lg font-bold text-xs"
                          title="+5"
                        >
                          +5
                        </button>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-[11px] border ${statusConfig.color}`}
                      >
                        <span>{statusConfig.indicator}</span>
                        <span>{statusConfig.label}</span>
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-slate-400 dark:text-slate-500 text-[11px]">
                      {formatTimeAgo(item.updatedAt)}
                      {item.lastUpdatedBy && (
                        <div className="text-[10px] text-slate-500">
                          by {item.lastUpdatedBy.name}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => saveStock(item)}
                        disabled={updatingId === item.medicationId || !isModified}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          isModified
                            ? 'bg-sky-600 hover:bg-sky-700 text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        {updatingId === item.medicationId ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Save className="w-3.5 h-3.5" />
                        )}
                        <span>Save</span>
                      </button>
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
};
