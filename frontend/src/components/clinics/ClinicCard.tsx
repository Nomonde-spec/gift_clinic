'use client';

import React from 'react';
import Link from 'next/link';
import { Clinic } from '../../types';
import { getQueueConfig, formatWaitTime, formatTimeAgo } from '../../lib/utils';
import { MapPin, Users, Clock, Pill, ChevronRight, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

interface ClinicCardProps {
  clinic: Clinic;
}

export const ClinicCard: React.FC<ClinicCardProps> = ({ clinic }) => {
  const queue = clinic.queueStatus;
  const queueConfig = getQueueConfig(queue?.status);
  const medSummary = clinic.medicationSummary;

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-md hover:border-sky-300 dark:hover:border-sky-800 transition-all duration-200">
      <div>
        {/* Header: Name and Open Status */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
              {clinic.name}
            </h3>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{clinic.suburb}, {clinic.city}</span>
            </p>
          </div>

          <span
            className={`px-2.5 py-1 text-[11px] font-bold rounded-full uppercase tracking-wider ${
              clinic.isOpen
                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
            }`}
          >
            {clinic.isOpen ? 'OPEN' : 'CLOSED'}
          </span>
        </div>

        {/* Queue Metrics */}
        <div className="mt-4 grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <div className="space-y-0.5">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Users className="w-3 h-3 text-sky-500" /> Waiting
            </span>
            <p className="text-lg font-bold text-slate-900 dark:text-white">
              {queue ? queue.peopleWaiting : 0} <span className="text-xs font-normal text-slate-500">people</span>
            </p>
          </div>

          <div className="space-y-0.5">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-sky-500" /> Est. Wait
            </span>
            <p className="text-lg font-bold text-slate-900 dark:text-white">
              {queue ? formatWaitTime(queue.estimatedWaitMinutes) : '0 mins'}
            </p>
          </div>
        </div>

        {/* Queue Status Badge */}
        <div className="mt-3 flex items-center justify-between">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${queueConfig.color}`}>
            <span>{queueConfig.indicator}</span>
            <span>{queueConfig.label}</span>
          </span>

          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            {formatTimeAgo(queue?.updatedAt)}
          </span>
        </div>

        {/* Medication Summary */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            <Pill className="w-3.5 h-3.5 text-sky-600" /> Medication Availability
          </div>

          <div className="space-y-1 text-xs">
            {medSummary ? (
              <>
                {medSummary.outOfStock === 0 && medSummary.lowStock === 0 ? (
                  <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>All essential medicines in stock ({medSummary.inStock})</span>
                  </div>
                ) : (
                  <>
                    {medSummary.inStock > 0 && (
                      <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>{medSummary.inStock} Available</span>
                      </div>
                    )}
                    {medSummary.lowStock > 0 && (
                      <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>{medSummary.lowStock} Low Stock</span>
                      </div>
                    )}
                    {medSummary.outOfStock > 0 && (
                      <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-medium">
                        <XCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{medSummary.outOfStock} Out of Stock</span>
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              <span className="text-slate-400 text-xs">Stock data pending</span>
            )}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-5 pt-3">
        <Link
          href={`/clinics/${clinic.id}`}
          className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 hover:bg-sky-600 hover:text-white dark:hover:bg-sky-600 dark:hover:text-white font-semibold text-xs transition-all duration-150"
        >
          View Clinic & Live Stock
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
