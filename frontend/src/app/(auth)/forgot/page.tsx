'use client';

import React, { useState } from 'react';
import { authApi } from '../../../lib/api';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
	e.preventDefault();
	setError(null);
	setMessage(null);
	setLoading(true);
	try {
	  const res = await authApi.forgotPassword({ email });
	  setMessage(res.message || 'If an account with that email exists, a reset link has been sent.');
	} catch (err: any) {
	  setError(err.response?.data?.message || 'Failed to send reset email.');
	} finally {
	  setLoading(false);
	}
  };

  return (
	<div className="min-h-[60vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
	  <div className="w-full max-w-md space-y-6">
		<div className="text-center">
		  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Forgot Password</h1>
		  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
			Enter your email and we'll send a password reset link if an account exists.
		  </p>
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
			<div className="mt-2 text-[11px] text-slate-600 dark:text-slate-300">
			  Check your email for the reset link. If you don't see it, check spam or try again.
			</div>
		  </div>
		)}

		<form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
		  <div>
			<label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
			<input
			  type="email"
			  required
			  value={email}
			  onChange={(e) => setEmail(e.target.value)}
			  placeholder="you@example.com"
			  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
			/>
		  </div>

		  <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md disabled:opacity-60 transition-all">
			{loading ? 'Sending...' : 'Send Reset Link'}
		  </button>

		  <div className="text-center pt-2 text-xs">
			<Link href="/login" className="text-slate-600 dark:text-slate-300 hover:underline">Back to Sign In</Link>
		  </div>
		</form>
	  </div>
	</div>
  );
}
