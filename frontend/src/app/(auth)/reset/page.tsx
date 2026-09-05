'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { authApi } from '../../../lib/api';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

function ResetPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
	const t = searchParams.get('token') || '';
	const e = searchParams.get('email') || '';
	setToken(t);
	setEmail(e);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
	e.preventDefault();
	setError(null);
	setMessage(null);
	if (newPassword !== confirm) {
	  setError('Passwords do not match');
	  return;
	}
	setLoading(true);
	try {
	  const res = await authApi.resetPassword({ email, token, newPassword });
	  setMessage(res.message || 'Password has been reset.');
	  setTimeout(() => router.push('/login'), 1500);
	} catch (err: any) {
	  setError(err.response?.data?.message || 'Failed to reset password');
	} finally {
	  setLoading(false);
	}
  };

  return (
	<div className="min-h-[60vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
	  <div className="w-full max-w-md space-y-6">
		<div className="text-center">
		  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reset Password</h1>
		  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Set a new password for your account.</p>
		</div>

		{error && (
		  <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
			<AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
			<span>{error}</span>
		  </div>
		)}

		{message && (
		  <div className="p-3.5 rounded-xl bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-xs">
			{message}
		  </div>
		)}

		<form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
		  <div>
			<label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
			<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none" />
		  </div>

		  <div>
			<label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">New Password</label>
			<input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none" />
		  </div>

		  <div>
			<label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Confirm Password</label>
			<input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none" />
		  </div>

		  <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md disabled:opacity-60 transition-all">{loading ? 'Resetting...' : 'Reset Password'}</button>

		  <div className="text-center pt-2 text-xs">
			<Link href="/login" className="text-slate-600 dark:text-slate-300 hover:underline">Back to Sign In</Link>
		  </div>
		</form>
	  </div>
	</div>
  );
}

export default function ResetPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center py-12 px-4 text-xs text-slate-400">Loading password reset...</div>}>
      <ResetPageContent />
    </Suspense>
  );
}
