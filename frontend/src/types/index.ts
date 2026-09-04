export type UserRole = 'PATIENT' | 'STAFF' | 'ADMIN';
export type StockStatusType = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
export type QueueLevelType = 'LOW' | 'MODERATE' | 'BUSY' | 'VERY_BUSY' | 'CLOSED';
export type NotificationType = 'LOW_STOCK' | 'OUT_OF_STOCK' | 'QUEUE_WARNING' | 'SYSTEM';

export interface User {
  id: string;
  name: string;
  surname: string;
  email: string;
  role: UserRole;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  staffClinics?: {
    id: string;
    clinicId: string;
    clinic: {
      id: string;
      name: string;
      city: string;
      suburb: string;
      isOpen?: boolean;
    };
  }[];
}

export interface OperatingHours {
  id: string;
  dayOfWeek: string;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export interface QueueStatus {
  id: string;
  clinicId: string;
  peopleWaiting: number;
  estimatedWaitMinutes: number;
  openConsultationRooms: number;
  status: QueueLevelType;
  updatedAt: string;
  updatedBy?: {
    id: string;
    name: string;
    surname: string;
  };
}

export interface Medication {
  id: string;
  name: string;
  description: string;
  category: string;
  unit: string;
  lowStockThreshold: number;
  isActive: boolean;
  _count?: {
    clinicStocks: number;
  };
}

export interface ClinicStockItem {
  id: string;
  clinicId: string;
  medicationId: string;
  quantity: number;
  status: StockStatusType;
  updatedAt: string;
  medication: Medication;
  lastUpdatedBy?: {
    id: string;
    name: string;
    surname: string;
  };
}

export interface Clinic {
  id: string;
  name: string;
  description: string;
  address: string;
  suburb: string;
  city: string;
  province: string;
  phone: string;
  latitude?: number;
  longitude?: number;
  openingTime: string;
  closingTime: string;
  isOpen: boolean;
  queueStatus?: QueueStatus;
  operatingHours?: OperatingHours[];
  medicationStock?: ClinicStockItem[];
  medicationSummary?: {
    totalMeds: number;
    inStock: number;
    lowStock: number;
    outOfStock: number;
    availabilityText?: string;
  };
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface QueueHistoryRecord {
  id: string;
  clinicId: string;
  peopleWaiting: number;
  estimatedWaitMinutes: number;
  openConsultationRooms: number;
  status: QueueLevelType;
  createdAt: string;
  updatedBy?: {
    id: string;
    name: string;
    surname: string;
  };
}

export interface StockHistoryRecord {
  id: string;
  clinicId: string;
  medicationId: string;
  previousQuantity: number;
  newQuantity: number;
  previousStatus: StockStatusType;
  newStatus: StockStatusType;
  createdAt: string;
  medication?: {
    id: string;
    name: string;
    unit: string;
  };
  updatedBy?: {
    id: string;
    name: string;
    surname: string;
  };
}

export interface AuditLogItem {
  id: string;
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
  user?: {
    name: string;
    surname: string;
    role: UserRole;
    email: string;
  };
}
