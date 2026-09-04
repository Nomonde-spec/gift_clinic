'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { NotificationDropdown } from './NotificationDropdown';
import {
  Activity,
  Menu,
  X,
  User as UserIcon,
  LogOut,
  Building2,
  Users,
  Pill,
  BarChart3,
  Clock,
  ShieldCheck,
  Package,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isCurrent = (href: string) => {
    if (href === '/' && pathname !== '/') return false;
    return pathname.startsWith(href);
  };

  const navLinkClass = (href: string) =>
    `text-sm font-medium transition-colors px-3 py-1.5 rounded-lg ${
      isCurrent(href)
        ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-semibold'
        : 'text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-50 dark:hover:bg-slate-800'
    }`;

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <span className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  Clinic<span className="text-sky-600 dark:text-sky-400">Queue</span>
                </span>
                <span className="hidden sm:inline-block ml-1.5 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
                  Public Health
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center ml-6 space-x-1">
              {/* Common / Patient Links */}
              {(!user || user.role === 'PATIENT') && (
                <>
                  <Link href="/dashboard" className={navLinkClass('/dashboard')}>
                    Dashboard
                  </Link>
                  <Link href="/clinics" className={navLinkClass('/clinics')}>
                    Clinics & Queues
                  </Link>
                </>
              )}

              {/* Staff Portal Links */}
              {user?.role === 'STAFF' && (
                <>
                  <Link href="/staff/dashboard" className={navLinkClass('/staff/dashboard')}>
                    Staff Overview
                  </Link>
                  <Link href="/staff/queue" className={navLinkClass('/staff/queue')}>
                    Queue Manager
                  </Link>
                  <Link href="/staff/stock" className={navLinkClass('/staff/stock')}>
                    Stock Inventory
                  </Link>
                  <Link href="/staff/history" className={navLinkClass('/staff/history')}>
                    History & Trends
                  </Link>
                  <Link href="/clinics" className={navLinkClass('/clinics')}>
                    All Clinics
                  </Link>
                </>
              )}

              {/* Admin Portal Links */}
              {user?.role === 'ADMIN' && (
                <>
                  <Link href="/admin/dashboard" className={navLinkClass('/admin/dashboard')}>
                    Overview
                  </Link>
                  <Link href="/admin/clinics" className={navLinkClass('/admin/clinics')}>
                    Clinics
                  </Link>
                  <Link href="/admin/staff" className={navLinkClass('/admin/staff')}>
                    Staff
                  </Link>
                  <Link href="/admin/medications" className={navLinkClass('/admin/medications')}>
                    Catalogue
                  </Link>
                  <Link href="/admin/stock" className={navLinkClass('/admin/stock')}>
                    Cross-Stock
                  </Link>
                  <Link href="/admin/queue" className={navLinkClass('/admin/queue')}>
                    Queues
                  </Link>
                  <Link href="/admin/reports" className={navLinkClass('/admin/reports')}>
                    Reports
                  </Link>
                  <Link href="/admin/audit-logs" className={navLinkClass('/admin/audit-logs')}>
                    Audit Logs
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Right Action Section */}
          <div className="flex items-center gap-2.5">
            <ThemeToggle />

            {user ? (
              <>
                <NotificationDropdown />

                {/* User Role Badge */}
                <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                      user.role === 'ADMIN'
                        ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                        : user.role === 'STAFF'
                        ? 'bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300'
                        : 'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300'
                    }`}
                  >
                    {user.role}
                  </span>
                  <Link
                    href="/profile"
                    className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400"
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                    <span>{user.name}</span>
                  </Link>
                </div>

                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-xs font-semibold text-slate-700 dark:text-slate-200 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white px-3.5 py-2 rounded-lg shadow-sm transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <div className="flex md:hidden ml-1">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-2 pb-4 space-y-1">
          {(!user || user.role === 'PATIENT') && (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-sm font-medium ${isCurrent('/dashboard') ? 'bg-sky-50 dark:bg-sky-950 text-sky-600' : 'text-slate-700 dark:text-slate-300'}`}
              >
                Dashboard
              </Link>
              <Link
                href="/clinics"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-sm font-medium ${isCurrent('/clinics') ? 'bg-sky-50 dark:bg-sky-950 text-sky-600' : 'text-slate-700 dark:text-slate-300'}`}
              >
                Clinics & Queues
              </Link>
            </>
          )}

          {user?.role === 'STAFF' && (
            <>
              <Link
                href="/staff/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Staff Overview
              </Link>
              <Link
                href="/staff/queue"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Queue Manager
              </Link>
              <Link
                href="/staff/stock"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Stock Inventory
              </Link>
              <Link
                href="/staff/history"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                History & Trends
              </Link>
            </>
          )}

          {user?.role === 'ADMIN' && (
            <>
              <Link
                href="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Admin Overview
              </Link>
              <Link
                href="/admin/clinics"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Manage Clinics
              </Link>
              <Link
                href="/admin/staff"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Manage Staff
              </Link>
              <Link
                href="/admin/medications"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Medication Catalogue
              </Link>
              <Link
                href="/admin/reports"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Analytics & Reports
              </Link>
              <Link
                href="/admin/audit-logs"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Audit Logs
              </Link>
            </>
          )}

          {user && (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center px-3">
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
              >
                <UserIcon className="w-4 h-4" /> Profile ({user.name})
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="text-sm font-medium text-rose-600 hover:text-rose-700"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
