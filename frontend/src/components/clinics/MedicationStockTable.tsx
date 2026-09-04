'use client';

import React, { useState } from 'react';
import { ClinicStockItem } from '../../types';
import { getStockConfig } from '../../lib/utils';
import { Search, Filter, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

interface MedicationStockTableProps {
  stockItems: ClinicStockItem[];
}

export const MedicationStockTable: React.FC<MedicationStockTableProps> = ({ stockItems }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const categories = Array.from(
    new Set(stockItems.map((item) => item.medication.category).filter(Boolean))
  );

  const filteredItems = stockItems.filter((item) => {
    const matchesSearch =
      item.medication.name.toLowerCase().includes(search.toLowerCase()) ||
      item.medication.description.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || item.status === statusFilter;

    const matchesCategory =
      categoryFilter === 'ALL' || item.medication.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search medicine (e.g., Amoxicillin, Insulin, Paracetamol)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="IN_STOCK">🟢 In Stock</option>
            <option value="LOW_STOCK">🟠 Low Stock</option>
            <option value="OUT_OF_STOCK">🔴 Out of Stock</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stock Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">Medication Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Dosage / Unit</th>
              <th className="px-4 py-3 text-right">Availability Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                  No medications found matching your filter criteria.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => {
                const stockConfig = getStockConfig(item.status);
                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                      <div>{item.medication.name}</div>
                      <div className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                        {item.medication.description}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                        {item.medication.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      {item.medication.unit}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-[11px] border ${stockConfig.color}`}
                      >
                        <span>{stockConfig.indicator}</span>
                        <span>{stockConfig.label}</span>
                      </span>
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
