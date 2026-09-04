'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Clock,
  Pill,
  Users,
  Search,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Building2,
  ShieldCheck,
  TrendingDown,
  ArrowRight,
} from 'lucide-react';

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/clinics?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      router.push('/clinics');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sky-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 border-b border-slate-200 dark:border-slate-800 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 text-xs font-semibold mb-6">
              <span className="flex h-2 w-2 rounded-full bg-sky-500 animate-ping" />
              Live Public Clinic Queue & Stock Transparency
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight sm:leading-none">
              Check Waiting Times & Medication Stock{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-teal-600 dark:from-sky-400 dark:to-teal-400">
                Before You Travel
              </span>
            </h1>

            <p className="mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Eliminate wasted journeys and painful waiting. Verify live queue lengths,
              estimated consult waits, and essential medicine availability across public health clinics.
            </p>

            {/* Quick Search Box */}
            <form
              onSubmit={handleSearchSubmit}
              className="mt-8 max-w-xl mx-auto flex flex-col sm:flex-row gap-2.5 p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg shadow-sky-500/5"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Enter clinic name, suburb, or city..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm shadow-md shadow-sky-600/20 transition-all flex items-center justify-center gap-1.5"
              >
                Find Clinics
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>

            {/* Demo Quick Access Callout */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Quick Demo Portals:
              </span>
              <Link
                href="/login?role=patient"
                className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:text-sky-600 font-medium"
              >
                Patient Portal
              </Link>
              <Link
                href="/login?role=staff"
                className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:text-sky-600 font-medium"
              >
                Clinic Staff Portal
              </Link>
              <Link
                href="/login?role=admin"
                className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:text-sky-600 font-medium"
              >
                Admin Console
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Core Value Pillars */}
      <section className="py-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Solving Everyday Healthcare Frustrations
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Transforming how communities access public clinics through data transparency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-600 flex items-center justify-center mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Live Queue & Waiting Times
              </h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Clinic triage staff update patient numbers and active consultation rooms continuously, giving you real estimates before you commute.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 flex items-center justify-center mb-4">
                <Pill className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Medication Stock Visibility
              </h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Clear alerts for in-stock, low-stock, and out-of-stock chronic and acute medications, preventing wasted visits when supplies run short.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Audit Logs & Analytics
              </h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Every queue update and inventory shift is immutably logged with actor timestamps, generating historical wait-time trend reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-14 bg-gradient-to-r from-sky-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold">
            Ready to find your nearest open clinic?
          </h2>
          <p className="mt-2 text-sm text-sky-100 max-w-xl mx-auto">
            Check real-time queue lengths, view current consultation capacity, and check essential medicine stocks in seconds.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/clinics"
              className="px-6 py-3 rounded-xl bg-white text-sky-700 font-bold text-xs shadow-lg hover:bg-slate-50 transition-colors"
            >
              Browse Public Clinics
            </Link>
            <Link
              href="/register"
              className="px-6 py-3 rounded-xl bg-sky-700 text-white font-bold text-xs hover:bg-sky-800 transition-colors"
            >
              Create Free Patient Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
