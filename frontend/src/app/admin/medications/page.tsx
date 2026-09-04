'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { medicationApi } from '../../../lib/api';
import { Medication } from '../../../types';
import {
  Pill,
  Plus,
  Edit,
  Power,
  Search,
  Check,
  AlertCircle,
  X,
  ArrowLeft,
  AlertTriangle,
} from 'lucide-react';

export default function AdminMedicationsPage() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Analgesic',
    unit: 'tablets',
    lowStockThreshold: 50,
    isActive: true,
  });

  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchMeds = async () => {
    setLoading(true);
    try {
      const data = await medicationApi.getMedications();
      setMedications(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeds();
  }, []);

  const openCreateModal = () => {
    setEditingMed(null);
    setFormData({
      name: '',
      description: '',
      category: 'Analgesic',
      unit: 'tablets',
      lowStockThreshold: 50,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (med: Medication) => {
    setEditingMed(med);
    setFormData({
      name: med.name,
      description: med.description,
      category: med.category,
      unit: med.unit,
      lowStockThreshold: med.lowStockThreshold,
      isActive: med.isActive,
    });
    setIsModalOpen(true);
  };

  const handleToggle = async (id: string) => {
    try {
      await medicationApi.toggleMedication(id);
      fetchMeds();
      setNotice({ type: 'success', message: 'Medication status updated.' });
    } catch (err) {
      setNotice({ type: 'error', message: 'Failed to toggle medication status.' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setNotice(null);

    try {
      if (editingMed) {
        await medicationApi.updateMedication(editingMed.id, formData);
        setNotice({ type: 'success', message: 'Medication catalogue entry updated.' });
      } else {
        await medicationApi.createMedication(formData);
        setNotice({ type: 'success', message: 'New medication added to national catalogue.' });
      }
      setIsModalOpen(false);
      fetchMeds();
    } catch (err: any) {
      setNotice({
        type: 'error',
        message: err.response?.data?.message || 'Failed to save medication entry.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = medications.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.category.toLowerCase().includes(search.toLowerCase())
  );

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
            <Pill className="w-6 h-6 text-sky-600" />
            Central Medication Catalogue
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure essential drugs, dispensing units, and baseline low-stock threshold triggers.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Medication to Catalogue
        </button>
      </div>

      {notice && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
            notice.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {notice.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>{notice.message}</span>
          </div>
          <button onClick={() => setNotice(null)} className="text-slate-400 font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Search Filter */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Filter catalogue by drug name or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
        />
      </div>

      {/* Medications Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-600 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Medication Name</th>
              <th className="px-4 py-3">Therapeutic Category</th>
              <th className="px-4 py-3">Unit</th>
              <th className="px-4 py-3">Low-Stock Alert Threshold</th>
              <th className="px-4 py-3">Catalogue Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((med) => (
              <tr key={med.id} className="hover:bg-slate-50/50">
                <td className="px-4 py-3.5">
                  <div className="font-bold text-slate-900 dark:text-white">
                    {med.name}
                  </div>
                  <div className="text-[11px] text-slate-500 max-w-sm truncate">
                    {med.description}
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                    {med.category}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400">
                  {med.unit}
                </td>
                <td className="px-4 py-3.5 text-slate-800 dark:text-slate-200 font-mono font-bold">
                  {med.lowStockThreshold} {med.unit}
                </td>
                <td className="px-4 py-3.5">
                  <button
                    onClick={() => handleToggle(med.id)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors ${
                      med.isActive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                  >
                    {med.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </button>
                </td>
                <td className="px-4 py-3.5 text-right">
                  <button
                    onClick={() => openEditModal(med)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingMed ? 'Edit Medication' : 'Add Medication to Catalogue'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Drug / Medication Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Amoxicillin"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Dosage
                </label>
                <textarea
                  required
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g., Broad-spectrum penicillin antibiotic (500mg capsules)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Therapeutic Category
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Antibiotic"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Dispensing Unit
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="e.g., tablets, vials, inhalers"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Low-Stock Warning Threshold
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.lowStockThreshold}
                  onChange={(e) =>
                    setFormData({ ...formData, lowStockThreshold: parseInt(e.target.value) || 20 })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Clinics falling below this unit count will automatically show a LOW STOCK warning.
                </p>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold"
                >
                  {submitting ? 'Saving...' : 'Save Medication'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
