import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { QueueLevelType, StockStatusType } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimeAgo(dateString: string | Date | undefined): string {
  if (!dateString) return 'Just now';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

export function formatWaitTime(minutes: number): string {
  if (minutes <= 0) return 'No wait';
  if (minutes < 60) return `${minutes} mins`;
  const hours = Math.floor(minutes / 60);
  const rem = minutes % 60;
  return rem > 0 ? `${hours}h ${rem}m` : `${hours} hour${hours > 1 ? 's' : ''}`;
}

export function getQueueConfig(status: QueueLevelType | undefined) {
  switch (status) {
    case 'LOW':
      return {
        label: 'Low Queue',
        color: 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800',
        badge: 'bg-emerald-500',
        indicator: '🟢',
      };
    case 'MODERATE':
      return {
        label: 'Moderate Queue',
        color: 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800',
        badge: 'bg-blue-500',
        indicator: '🔵',
      };
    case 'BUSY':
      return {
        label: 'Busy',
        color: 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800',
        badge: 'bg-amber-500',
        indicator: '🟠',
      };
    case 'VERY_BUSY':
      return {
        label: 'Very Busy',
        color: 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800',
        badge: 'bg-rose-600',
        indicator: '🔴',
      };
    case 'CLOSED':
    default:
      return {
        label: 'Closed',
        color: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
        badge: 'bg-slate-500',
        indicator: '⚪',
      };
  }
}

export function getStockConfig(status: StockStatusType) {
  switch (status) {
    case 'IN_STOCK':
      return {
        label: 'IN STOCK',
        color: 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
        indicator: '🟢',
        symbol: '✓',
      };
    case 'LOW_STOCK':
      return {
        label: 'LOW STOCK',
        color: 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
        indicator: '🟠',
        symbol: '⚠',
      };
    case 'OUT_OF_STOCK':
    default:
      return {
        label: 'OUT OF STOCK',
        color: 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800',
        indicator: '🔴',
        symbol: '✕',
      };
  }
}
