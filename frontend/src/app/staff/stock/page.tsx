'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { clinicApi, stockApi, staffApi } from '../../../lib/api';
import { Clinic, ClinicStockItem } from '../../../types';
import { StaffStockManager } from '../../../components/staff/StaffStockManager';
import { Pill, ArrowLeft, RefreshCw, Building2 } from 'lucide-react';

export default function StaffStockPage() {
  const { user, refreshUser, activeClinicId } = useAuth();

  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [stock, setStock] = useState<ClinicStockItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStockData = async () => {
    setLoading(true);
    try {
      const search = new URLSearchParams(window.location.search);
      const qClinicId = search.get('clinicId') || activeClinicId;
      if (qClinicId) {
        const s = await stockApi.getStock(qClinicId);
        const c = await clinicApi.getClinicById(qClinicId);
        setClinic(c);
        setStock(s.stock || []);
        setLoading(false);
        return;
      }
      try {
        const c = await staffApi.getMyClinic();
        if (c) {
          const s = await stockApi.getStock(c.id);
          setClinic(c);
          setStock(s.stock || []);
          return;
        }
      } catch (err) {
        console.warn('staffApi.getMyClinic failed, falling back to local user assignment', err);
      }

      try {
        const clinicId = user?.staffClinics?.[0]?.clinicId;
        let targetClinicId = clinicId;

        if (!targetClinicId) {
          const all = await clinicApi.getClinics({ limit: 1 });
          if (all.clinics[0]) targetClinicId = all.clinics[0].id;
        }

        if (targetClinicId) {
          const [c, s] = await Promise.all([
            clinicApi.getClinicById(targetClinicId),
            stockApi.getStock(targetClinicId),
          ]);
          setClinic(c);
          setStock(s.stock || []);
        }
      } catch (err) {
        console.error(err);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockData();
  }, [user]);

  const handleRefreshAssignment = async () => {
    try {
      await refreshUser();
      await fetchStockData();
    } catch (err) {
      console.error('Failed to refresh assignment', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/staff/dashboard"
            className="text-xs font-semibold text-slate-500 hover:text-sky-600 flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Staff Overview
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Pill className="w-6 h-6 text-teal-600" />
            Clinic Medication Inventory Manager
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Adjust medicine quantities. Thresholds automatically mark items as In Stock, Low Stock, or Out of Stock.
          </p>
        </div>

        {clinic && (
          <div className="text-right">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {clinic.name}
            </span>
            <p className="text-[11px] text-slate-400">{clinic.city}</p>
          </div>
        )}
      </div>

      {loading ? (
        <div className="h-64 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse" />
      ) : clinic ? (
        <StaffStockManager clinicId={clinic.id} initialStock={stock} />
      ) : (
        <div className="p-8 text-center text-xs text-slate-500 space-y-3">
          <div>No clinic found to manage.</div>
          <div>If you are running locally, ensure demo data is seeded and your staff account is assigned to a clinic.</div>
          <div className="text-[11px] text-slate-400">Local seed command: <code>cd backend && npm run prisma:seed</code></div>
          <div className="flex items-center justify-center gap-2">
            <button onClick={handleRefreshAssignment} className="px-3 py-1.5 rounded bg-sky-600 text-white text-xs">Refresh Assignment</button>
            <button onClick={() => window.location.href = '/staff/dashboard'} className="px-3 py-1.5 rounded border text-xs">Back to Dashboard</button>
          </div>
          <div className="text-[11px] text-slate-400">Demo staff credentials: <strong>staff@soweto.clinic.gov.za</strong> / <strong>StaffPass123!</strong></div>
        </div>
      )}
    </div>
  );
}
