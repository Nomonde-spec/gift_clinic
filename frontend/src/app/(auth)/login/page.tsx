'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { LogIn, AlertCircle, Sparkles, Shield, User as UserIcon, Stethoscope } from 'lucide-react';

function LoginFormContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // If user is already logged in, redirect to appropriate role portal
    if (user) {
      if (user.role === 'ADMIN') router.push('/admin/dashboard');
      else if (user.role === 'STAFF') router.push('/staff/dashboard');
      else router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'admin') {
      fillCredentials('admin@clinic.gov.za', 'AdminPass123!');
    } else if (roleParam === 'staff') {
      fillCredentials('staff@soweto.clinic.gov.za', 'StaffPass123!');
    } else if (roleParam === 'patient') {
      fillCredentials('patient@gmail.com', 'PatientPass123!');
    }
  }, [searchParams]);

  const fillCredentials = (e: string, p: string) => {
    setEmail(e);
    setPassword(p);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Login failed. Please verify your email and password.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center mx-auto shadow-md shadow-sky-600/20 mb-3">
          <LogIn className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Sign In to Your Account
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Access clinic queue monitors, medication inventory, and notifications.
        </p>
      </div>

      {/* Demo Fast Fill Buttons */}
      <div className="p-4 rounded-2xl bg-sky-50/60 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/60 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-sky-800 dark:text-sky-300">
          <Sparkles className="w-3.5 h-3.5 text-sky-600" />
          <span>Click to autofill demo credentials:</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => fillCredentials('patient@gmail.com', 'PatientPass123!')}
            className="px-2 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:border-sky-500 transition-colors flex flex-col items-center"
          >
            <UserIcon className="w-3.5 h-3.5 text-sky-500 mb-0.5" />
            <span>Patient</span>
          </button>
          <button
            type="button"
            onClick={() => fillCredentials('staff@soweto.clinic.gov.za', 'StaffPass123!')}
            className="px-2 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:border-teal-500 transition-colors flex flex-col items-center"
          >
            <Stethoscope className="w-3.5 h-3.5 text-teal-500 mb-0.5" />
            <span>Staff (Soweto)</span>
          </button>
          <button
            type="button"
            onClick={() => fillCredentials('admin@clinic.gov.za', 'AdminPass123!')}
            className="px-2 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:border-purple-500 transition-colors flex flex-col items-center"
          >
            <Shield className="w-3.5 h-3.5 text-purple-500 mb-0.5" />
            <span>Admin</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g., patient@gmail.com"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/20 disabled:opacity-60 transition-all"
        >
          {loading ? 'Authenticating...' : 'Sign In'}
        </button>

        <div className="text-center pt-2">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Don't have an account yet?{' '}
            <Link href="/register" className="text-sky-600 dark:text-sky-400 font-semibold hover:underline">
              Create a Patient Account
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading sign in portal...</div>}>
        <LoginFormContent />
      </Suspense>
    </div>
  );
}
