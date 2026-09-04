'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, PhoneCall, HeartPulse } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-sm">
                <HeartPulse className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-900 dark:text-white">
                Public Clinic Queue & Stock Tracker
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-md">
              Improving healthcare access by providing real-time visibility into public clinic queues,
              estimated waiting times, and essential medication availability before you travel.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 p-2.5 rounded-lg">
              <Shield className="w-4 h-4 shrink-0" />
              <span>
                <strong>Medical Disclaimer:</strong> This portal provides logistical queue and stock estimates only. In a life-threatening medical emergency, call 112 or 10177 immediately.
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Emergency Hotlines
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2">
                <PhoneCall className="w-3.5 h-3.5 text-rose-500" />
                <span>National Emergency: <strong>112</strong> / <strong>10177</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <PhoneCall className="w-3.5 h-3.5 text-sky-500" />
                <span>Health Information: <strong>0800 029 999</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <PhoneCall className="w-3.5 h-3.5 text-teal-500" />
                <span>Suicide Crisis Helpline: <strong>0800 567 567</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <PhoneCall className="w-3.5 h-3.5 text-purple-500" />
                <span>Poison Info Centre: <strong>0861 555 777</strong></span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Platform Links
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/clinics" className="hover:text-sky-600 dark:hover:text-sky-400">
                  Find Nearest Clinic
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-sky-600 dark:hover:text-sky-400">
                  Patient Portal
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-sky-600 dark:hover:text-sky-400">
                  Healthcare Staff Login
                </Link>
              </li>
              <li>
                <span className="text-slate-400 dark:text-slate-500">
                  System Version 1.0.0 (Production)
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Public Clinic Queue & Stock Tracker. Designed for public health equity and transparent service delivery.
        </div>
      </div>
    </footer>
  );
};
