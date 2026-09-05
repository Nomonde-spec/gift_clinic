'use client';

import React, { useState } from 'react';
import { QueueStatus, QueueLevelType } from '../../types';
import { queueApi } from '../../lib/api';
import { Users, Clock, Stethoscope, AlertTriangle, Check, RefreshCw } from 'lucide-react';
import { getQueueConfig } from '../../lib/utils';

interface StaffQueueFormProps {
  clinicId: string;
  initialQueue?: QueueStatus;
  onUpdated?: (updated: QueueStatus) => void;
  readOnly?: boolean;
}

export const StaffQueueForm: React.FC<StaffQueueFormProps> = ({
  clinicId,
  initialQueue,
  onUpdated,
  readOnly = false,
}) => {
  const [peopleWaiting, setPeopleWaiting] = useState<number>(
    initialQueue?.peopleWaiting ?? 0
  );
  const [estimatedWaitMinutes, setEstimatedWaitMinutes] = useState<number>(
    initialQueue?.estimatedWaitMinutes ?? 0
  );
  const [openConsultationRooms, setOpenConsultationRooms] = useState<number>(
    initialQueue?.openConsultationRooms ?? 2
  );
  const [status, setStatus] = useState<QueueLevelType>(
    initialQueue?.status ?? 'LOW'
  );

  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) return;
    setIsLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    // Validation
    if (peopleWaiting < 0) {
      setErrorMessage('People waiting cannot be negative');
      setIsLoading(false);
      return;
    }
    if (estimatedWaitMinutes < 0) {
      setErrorMessage('Estimated wait time cannot be negative');
      setIsLoading(false);
      return;
    }
    if (openConsultationRooms < 0) {
      setErrorMessage('Consultation rooms cannot be negative');
      setIsLoading(false);
      return;
    }

    try {
      const res = await queueApi.updateQueue(clinicId, {
        peopleWaiting,
        estimatedWaitMinutes,
        openConsultationRooms,
        status,
      });

      setSuccessMessage('Queue status successfully broadcasted and logged.');
      if (onUpdated && res.queue) {
        onUpdated(res.queue);
      }
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || 'Failed to update queue status. Verify your clinic permissions.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const currentConfig = getQueueConfig(status);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Live Queue Controls
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Changes update patient dashboards immediately and create an audit log record.
          </p>
        </div>
        <div className={`px-3 py-1 rounded-lg border text-xs font-bold ${currentConfig.color}`}>
          {currentConfig.indicator} {currentConfig.label}
        </div>
      </div>

      {successMessage && (
        <div className="mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {readOnly && (
        <div className="mt-4 p-3 rounded-xl bg-yellow-50 dark:bg-yellow-950/40 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-yellow-600 shrink-0" />
          <span>This is a read-only view for this clinic. You are not assigned to manage this facility.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* People Waiting */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-sky-600" /> People Waiting
            </label>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setPeopleWaiting((p) => Math.max(0, p - 1))}
                className="px-3 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-l-xl font-bold text-sm"
                disabled={readOnly}
              >
                -
              </button>
              <input
                type="number"
                min="0"
                value={peopleWaiting}
                onChange={(e) => setPeopleWaiting(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full text-center py-2 border-y border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-base focus:outline-none"
                disabled={readOnly}
              />
              <button
                type="button"
                onClick={() => setPeopleWaiting((p) => p + 1)}
                className="px-3 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-r-xl font-bold text-sm"
                disabled={readOnly}
              >
                +
              </button>
            </div>
          </div>

          {/* Estimated Wait Minutes */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-sky-600" /> Estimated Wait Time (Mins)
            </label>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setEstimatedWaitMinutes((w) => Math.max(0, w - 5))}
                className="px-3 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-l-xl font-bold text-sm"
                disabled={readOnly}
              >
                -5
              </button>
              <input
                type="number"
                min="0"
                step="5"
                value={estimatedWaitMinutes}
                onChange={(e) => setEstimatedWaitMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full text-center py-2 border-y border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-base focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setEstimatedWaitMinutes((w) => w + 5)}
                className="px-3 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-r-xl font-bold text-sm"
                disabled={readOnly}
              >
                +5
              </button>
            </div>
          </div>

          {/* Open Consultation Rooms */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4 text-teal-600" /> Open Consultation Rooms
            </label>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setOpenConsultationRooms((r) => Math.max(0, r - 1))}
                className="px-3 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-l-xl font-bold text-sm"
                disabled={readOnly}
              >
                -
              </button>
              <input
                type="number"
                min="0"
                value={openConsultationRooms}
                onChange={(e) => setOpenConsultationRooms(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full text-center py-2 border-y border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-base focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setOpenConsultationRooms((r) => r + 1)}
                className="px-3 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-r-xl font-bold text-sm"
                disabled={readOnly}
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Queue Status Level Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Queue Severity Classification
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { id: 'LOW', label: 'Low', desc: '< 30m', color: 'peer-checked:border-emerald-500 peer-checked:bg-emerald-50 dark:peer-checked:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400' },
              { id: 'MODERATE', label: 'Moderate', desc: '30m – 1h', color: 'peer-checked:border-blue-500 peer-checked:bg-blue-50 dark:peer-checked:bg-blue-950/50 text-blue-700 dark:text-blue-400' },
              { id: 'BUSY', label: 'Busy', desc: '1h – 2h', color: 'peer-checked:border-amber-500 peer-checked:bg-amber-50 dark:peer-checked:bg-amber-950/50 text-amber-700 dark:text-amber-400' },
              { id: 'VERY_BUSY', label: 'Very Busy', desc: '> 2h wait', color: 'peer-checked:border-rose-500 peer-checked:bg-rose-50 dark:peer-checked:bg-rose-950/50 text-rose-700 dark:text-rose-400' },
              { id: 'CLOSED', label: 'Closed', desc: 'No intake', color: 'peer-checked:border-slate-500 peer-checked:bg-slate-100 dark:peer-checked:bg-slate-800 text-slate-700 dark:text-slate-300' },
            ].map((item) => (
              <label
                key={item.id}
                className="relative flex flex-col p-3 border rounded-xl cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-all text-center border-slate-200 dark:border-slate-800"
              >
                <input
                  type="radio"
                  name="queueLevel"
                  value={item.id}
                  checked={status === item.id}
                  onChange={() => setStatus(item.id as QueueLevelType)}
                  className="sr-only peer"
                />
                <span className={`text-xs font-bold ${item.color.split(' ').pop()}`}>
                  {item.label}
                </span>
                <span className="text-[10px] text-slate-400">{item.desc}</span>
                <div className={`absolute inset-0 rounded-xl border-2 pointer-events-none transition-all ${status === item.id ? item.color : 'border-transparent'}`} />
              </label>
            ))}
          </div>
        </div>

        {/* Warning Notification Preview */}
        {(status === 'VERY_BUSY' || (status === 'BUSY' && estimatedWaitMinutes >= 60)) && (
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Automated Alert Trigger:</strong> Setting status to <strong>{status}</strong> with {estimatedWaitMinutes} minutes estimated wait will automatically broadcast high-queue warning notifications to staff and patients.
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs tracking-wide shadow-md shadow-sky-600/20 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Broadcasting Live Update...
            </>
          ) : (
            'Publish Queue Update'
          )}
        </button>
      </form>
    </div>
  );
};
