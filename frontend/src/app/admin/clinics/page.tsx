'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { clinicApi } from '../../../lib/api';
import { Clinic } from '../../../types';
import {
  Building2,
  Plus,
  Edit,
  Power,
  Search,
  Check,
  AlertCircle,
  X,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';

export default function AdminClinicsPage() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClinic, setEditingClinic] = useState<Clinic | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    suburb: '',
    city: '',
    province: 'Gauteng',
    phone: '',
    openingTime: '07:00',
    closingTime: '17:00',
    isOpen: true,
  });

  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchClinics = async () => {
    setLoading(true);
    try {
      const res = await clinicApi.getClinics({ limit: 50 });
      setClinics(res.clinics || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClinics();
  }, []);

  const openCreateModal = () => {
    setEditingClinic(null);
    setFormData({
      name: '',
      description: '',
      address: '',
      suburb: '',
      city: '',
      province: 'Gauteng',
      phone: '',
      openingTime: '07:00',
      closingTime: '17:00',
      isOpen: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (clinic: Clinic) => {
    setEditingClinic(clinic);
    setFormData({
      name: clinic.name,
      description: clinic.description,
      address: clinic.address,
      suburb: clinic.suburb,
      city: clinic.city,
      province: clinic.province,
      phone: clinic.phone,
      openingTime: clinic.openingTime,
      closingTime: clinic.closingTime,
      isOpen: clinic.isOpen,
    });
    setIsModalOpen(true);
  };

  const handleToggle = async (id: string) => {
    try {
      await clinicApi.toggleClinicStatus(id);
      fetchClinics();
      setNotice({ type: 'success', message: 'Clinic status updated successfully.' });
    } catch (err) {
      setNotice({ type: 'error', message: 'Failed to update clinic status.' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setNotice(null);

    try {
      if (editingClinic) {
        await clinicApi.updateClinic(editingClinic.id, formData);
        setNotice({ type: 'success', message: 'Clinic updated successfully.' });
      } else {
        await clinicApi.createClinic(formData);
        setNotice({ type: 'success', message: 'New clinic facility created.' });
      }
      setIsModalOpen(false);
      fetchClinics();
    } catch (err: any) {
      setNotice({
        type: 'error',
        message: err.response?.data?.message || 'Failed to save clinic details.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = clinics.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase()) ||
      c.suburb.toLowerCase().includes(search.toLowerCase())
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
            <Building2 className="w-6 h-6 text-purple-600" />
            Clinic Facility Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Provision public healthcare facilities, adjust operating hours, and toggle intake status.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> Add New Clinic
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
          placeholder="Filter clinics by name or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
        />
      </div>

      {/* Clinics Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-600 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Clinic Name</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Operating Hours</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((clinic) => (
              <tr key={clinic.id} className="hover:bg-slate-50/50">
                <td className="px-4 py-3.5">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {clinic.name}
                  </span>
                  <p className="text-[11px] text-slate-500 max-w-xs truncate">
                    {clinic.description}
                  </p>
                </td>
                <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400">
                  {clinic.suburb}, {clinic.city}
                </td>
                <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400">
                  {clinic.phone}
                </td>
                <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400">
                  {clinic.openingTime} – {clinic.closingTime}
                </td>
                <td className="px-4 py-3.5">
                  <button
                    onClick={() => handleToggle(clinic.id)}
                    title="Click to toggle Open / Closed"
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors ${
                      clinic.isOpen
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                    }`}
                  >
                    {clinic.isOpen ? 'OPEN' : 'CLOSED'}
                  </button>
                </td>
                <td className="px-4 py-3.5 text-right space-x-2">
                  <button
                    onClick={() => openEditModal(clinic)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                    title="Edit clinic details"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Dialog for Create/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingClinic ? 'Edit Clinic Details' : 'Add New Public Clinic'}
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
                  Clinic Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Soweto Community Clinic"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  required
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Summary of healthcare services provided..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Suburb
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.suburb}
                    onChange={(e) => setFormData({ ...formData, suburb: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Opening Time (HH:MM)
                  </label>
                  <input
                    type="text"
                    required
                    pattern="^([01]\d|2[0-3]):([0-5]\d)$"
                    value={formData.openingTime}
                    onChange={(e) => setFormData({ ...formData, openingTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Closing Time (HH:MM)
                  </label>
                  <input
                    type="text"
                    required
                    pattern="^([01]\d|2[0-3]):([0-5]\d)$"
                    value={formData.closingTime}
                    onChange={(e) => setFormData({ ...formData, closingTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50"
                  />
                </div>
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
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold"
                >
                  {submitting ? 'Saving...' : 'Save Clinic'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
