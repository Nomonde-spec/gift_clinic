'use client';

import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { QueueHistoryRecord } from '../../types';

interface QueueAnalyticsChartsProps {
  history: QueueHistoryRecord[];
}

export const QueueAnalyticsCharts: React.FC<QueueAnalyticsChartsProps> = ({ history }) => {
  if (!history || history.length === 0) {
    return (
      <div className="p-8 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-400 text-xs">
        No historical queue recordings available yet for chart visualization.
      </div>
    );
  }

  const chartData = history.map((record) => {
    const d = new Date(record.createdAt);
    const timeStr = `${d.getHours().toString().padStart(2, '0')}:${d
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;
    return {
      time: timeStr,
      peopleWaiting: record.peopleWaiting,
      waitMinutes: record.estimatedWaitMinutes,
    };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* People Waiting Over Time */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
          Queue Size (People Waiting) Over Time
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Tracks changes in patient load throughout the day.
        </p>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="queueColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  color: '#fff',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="peopleWaiting"
                stroke="#0284c7"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#queueColor)"
                name="People Waiting"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Estimated Wait Time Over Time */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
          Estimated Wait Time (Minutes)
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Fluctuation in patient consultation waiting times.
        </p>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  color: '#fff',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '12px',
                }}
              />
              <Bar
                dataKey="waitMinutes"
                fill="#0d9488"
                radius={[4, 4, 0, 0]}
                name="Wait (Minutes)"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
