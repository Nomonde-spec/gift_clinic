import { Request } from 'express';

export type UserRole = 'PATIENT' | 'STAFF' | 'ADMIN';
export type StockStatusType = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
export type QueueLevelType = 'LOW' | 'MODERATE' | 'BUSY' | 'VERY_BUSY' | 'CLOSED';
export type NotificationCategory = 'LOW_STOCK' | 'OUT_OF_STOCK' | 'QUEUE_WARNING' | 'SYSTEM';

export interface AuthUserPayload {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  surname: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUserPayload;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any;
}
