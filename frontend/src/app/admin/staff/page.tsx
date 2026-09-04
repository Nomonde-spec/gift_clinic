'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { adminApi, clinicApi } from '../../../lib/api';
import { User, Clinic } from '../../../types';
import {
  Users,
  UserPlus,
  Building2,
  Shield,
  Check,
  AlertCircle,
  X,
  ArrowLeft,
  RefreshCw,
  Mail,
  Phone,
} from 'lucide-react';

export default function AdminStaffPage() {
  const [staffList, setStaffList] = useState<User[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
    phone: '',
    clinicIds: [] as string[],
  });

  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [staffData, clinicData] = await Promise.all([
        adminApi.getStaffList(),
        clinicApi.getClinics({ limit: 50 }),
      ]);
      setStaffList(staffData || []);
      setClinics(clinicData.clinics || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleStaff = async (id: string) => {
    try {
      await adminApi.toggleStaff(id);
      fetchData();
      setNotice({ type: 'success', message: 'Staff active status updated.' });
    } catch (err) {
      setNotice({ type: 'error', message: 'Failed to update staff status.' });
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setNotice(null);

    try {
      await adminApi.createStaff(formData);
      setNotice({ type: 'success', message: 'Staff member provisioned successfully.' });
      setIsModalOpen(false);
      setFormData({
        name: '',
        surname: '',
        email: '',
        password: '',
        phone: '',
        clinicIds: [],
      });
      fetchData();
    } catch (err: any) {
      setNotice({
        type: 'error',
        message: err.response?.data?.message || 'Failed to create staff account.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleClinicSelect = (clinicId: string) => {
    setFormData((prev) => {
      const exists = prev.clinicIds.includes(clinicId);
      return {
        ...prev,
        clinicIds: exists
          ? prev.clinicIds.filter((id) => id !== clinicId)
          : [...prev.clinicIds, clinicId],
      };
    });
  };

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
            <Users className="w-6 h-6 text-teal-600" />
            Healthcare Staff & Clinic Tenancy
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Authorize healthcare staff accounts and bind them to their designated public clinic branches.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-sm transition-colors"
        >
          <UserPlus className="w-4 h-4" /> Provision New Staff Account
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

      {/* Staff Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-600 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Staff Member</th>
              <th className="px-4 py-3">Email & Contact</th>
              <th className="px-4 py-3">Assigned Clinics</th>
              <th className="px-4 py-3">Account Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {staffList.map((member) => (
              <tr key={member.id} className="hover:bg-slate-50/50">
                <td className="px-4 py-3.5">
                  <div className="font-bold text-slate-900 dark:text-white">
                    {member.name} {member.surname}
                  </div>
                  <div className="text-[11px] text-slate-400">Staff ID: {member.id.slice(0, 8)}...</div>
                </td>
                <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" /> {member.email}
                  </div>
                  {member.phone && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-400" /> {member.phone}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex flex-wrap gap-1.5">
                    {member.staffClinics && member.staffClinics.length > 0 ? (
                      member.staffClinics.map((sc) => (
                        <span
                          key={sc.id}
                          className="px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-[10px] font-semibold"
                        >
                          {sc.clinic.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 text-[11px]">No clinics assigned</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                      member.isActive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                  >
                    {member.isActive ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-right">
                  <button
                    onClick={() => handleToggleStaff(member.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                      member.isActive
                        ? 'border-rose-200 text-rose-700 hover:bg-rose-50'
                        : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                    }`}
                  >
                    {member.isActive ? 'Disable Account' : 'Reactivate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Provision Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Provision Healthcare Staff Account
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Thabo"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Surname
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.surname}
                    onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                    placeholder="Mokoena"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Official Staff Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="staff@soweto.clinic.gov.za"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Temporary Password
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+27 11 555 0101"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50"
                  />
                </div>
              </div>

              {/* Clinic Tenancy Multi-Select */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Assign to Clinic Facilities
                </label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 bg-slate-50 dark:bg-slate-800/40">
                  {clinics.map((c) => (
                    <label
                      key={c.id}
                      className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer p-1 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-md"
                    >
                      <input
                        type="checkbox"
                        checked={formData.clinicIds.includes(c.id)}
                        onChange={() => toggleClinicSelect(c.id)}
                        className="rounded text-teal-600 focus:ring-teal-500"
                      />
                      <span>{c.name} ({c.city})</span>
                    </label>
                  ))}
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
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold"
                >
                  {submitting ? 'Creating...' : 'Provision Staff Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
