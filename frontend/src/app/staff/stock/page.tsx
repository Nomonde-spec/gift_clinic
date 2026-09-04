'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { clinicApi, stockApi } from '../../../lib/api';
import { Clinic, ClinicStockItem } from '../../../types';
import { StaffStockManager } from '../../../components/staff/StaffStockManager';
import { Pill, ArrowLeft, RefreshCw, Building2 } from 'lucide-react';

export default function StaffStockPage() {
  const { user } = useAuth();

  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [stock, setStock] = useState<ClinicStockItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStockData = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockData();
  }, [user]);

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
        <div className="p-8 text-center text-xs text-slate-500">
          No clinic found to manage.
        </div>
      )}
    </div>
  );
}
