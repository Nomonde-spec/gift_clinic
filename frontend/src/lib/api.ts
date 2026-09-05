import axios, { AxiosError } from 'axios';
import {
  Clinic,
  QueueStatus,
  ClinicStockItem,
  Medication,
  NotificationItem,
  User,
  AuditLogItem,
  QueueHistoryRecord,
  StockHistoryRecord,
} from '../types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token from localStorage if available
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('clinic_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Centralized response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const isAuthRequest = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register');
      if (!isAuthRequest) {
        localStorage.removeItem('clinic_auth_token');
        localStorage.removeItem('clinic_user');
        window.dispatchEvent(new Event('auth-unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const res = await apiClient.post<{ success: boolean; data: { user: User; token: string }; message?: string }>(
      '/auth/login',
      credentials
    );
    return res.data;
  },

  register: async (payload: {
    name: string;
    surname: string;
    email: string;
    password: string;
    phone?: string;
    role?: string;
  }) => {
    const res = await apiClient.post<{ success: boolean; data: { user: User; token: string }; message?: string }>(
      '/auth/register',
      payload
    );
    return res.data;
  },

  getMe: async () => {
    const res = await apiClient.get<{ success: boolean; data: User }>('/auth/me');
    return res.data.data;
  },

  forgotPassword: async (payload: { email: string }) => {
    const res = await apiClient.post<{ success: boolean; message?: string }>('/auth/forgot', payload);
    return res.data;
  },

  resetPassword: async (payload: { email: string; token: string; newPassword: string }) => {
    const res = await apiClient.post<{ success: boolean; message?: string }>('/auth/reset', payload);
    return res.data;
  },

  updateProfile: async (payload: {
    name?: string;
    surname?: string;
    phone?: string;
    currentPassword?: string;
    newPassword?: string;
  }) => {
    const res = await apiClient.put<{ success: boolean; data: User; message?: string }>(
      '/auth/profile',
      payload
    );
    return res.data;
  },
};

export const clinicApi = {
  getClinics: async (params?: Record<string, any>) => {
    const res = await apiClient.get<{
      success: boolean;
      data: {
        clinics: Clinic[];
        pagination: { total: number; page: number; limit: number; totalPages: number };
      };
    }>('/clinics', { params });
    return res.data.data;
  },

  getClinicById: async (id: string) => {
    const res = await apiClient.get<{ success: boolean; data: Clinic }>(`/clinics/${id}`);
    return res.data.data;
  },

  createClinic: async (clinicData: Partial<Clinic>) => {
    const res = await apiClient.post<{ success: boolean; data: Clinic }>('/clinics', clinicData);
    return res.data.data;
  },

  updateClinic: async (id: string, clinicData: Partial<Clinic>) => {
    const res = await apiClient.put<{ success: boolean; data: Clinic }>(`/clinics/${id}`, clinicData);
    return res.data.data;
  },

  toggleClinicStatus: async (id: string) => {
    const res = await apiClient.patch<{ success: boolean; data: Clinic }>(`/clinics/${id}/toggle`);
    return res.data.data;
  },
};

export const queueApi = {
  getQueue: async (clinicId: string) => {
    const res = await apiClient.get<{ success: boolean; data: QueueStatus }>(`/clinics/${clinicId}/queue`);
    return res.data.data;
  },

  updateQueue: async (
    clinicId: string,
    payload: {
      peopleWaiting: number;
      estimatedWaitMinutes: number;
      openConsultationRooms: number;
      status: string;
    }
  ) => {
    const res = await apiClient.put<{
      success: boolean;
      data: { queue: QueueStatus; history: QueueHistoryRecord };
      message?: string;
    }>(`/clinics/${clinicId}/queue`, payload);
    return res.data.data;
  },

  getQueueHistory: async (clinicId: string, days = 7) => {
    const res = await apiClient.get<{ success: boolean; data: QueueHistoryRecord[] }>(
      `/clinics/${clinicId}/queue/history`,
      { params: { days } }
    );
    return res.data.data;
  },

  getQueueAnalytics: async (clinicId: string) => {
    const res = await apiClient.get<{ success: boolean; data: any }>(
      `/clinics/${clinicId}/queue/analytics`
    );
    return res.data.data;
  },
};

export const stockApi = {
  getStock: async (
    clinicId: string,
    params?: { search?: string; status?: string; category?: string }
  ) => {
    const res = await apiClient.get<{
      success: boolean;
      data: {
        stock: ClinicStockItem[];
        summary: {
          total: number;
          inStockCount: number;
          lowStockCount: number;
          outOfStockCount: number;
        };
      };
    }>(`/clinics/${clinicId}/stock`, { params });
    return res.data.data;
  },

  updateStock: async (
    clinicId: string,
    medicationId: string,
    payload: { quantity: number }
  ) => {
    const res = await apiClient.put<{
      success: boolean;
      data: { stock: ClinicStockItem; history: StockHistoryRecord };
      message?: string;
    }>(`/clinics/${clinicId}/stock/${medicationId}`, payload);
    return res.data;
  },

  getStockHistory: async (clinicId: string, medicationId?: string) => {
    const res = await apiClient.get<{ success: boolean; data: StockHistoryRecord[] }>(
      `/clinics/${clinicId}/stock/history`,
      { params: { medicationId } }
    );
    return res.data.data;
  },
};

export const medicationApi = {
  getMedications: async (params?: { search?: string; category?: string; isActive?: boolean }) => {
    const res = await apiClient.get<{ success: boolean; data: Medication[] }>('/medications', {
      params,
    });
    return res.data.data;
  },

  createMedication: async (payload: Partial<Medication>) => {
    const res = await apiClient.post<{ success: boolean; data: Medication }>('/medications', payload);
    return res.data.data;
  },

  updateMedication: async (id: string, payload: Partial<Medication>) => {
    const res = await apiClient.put<{ success: boolean; data: Medication }>(`/medications/${id}`, payload);
    return res.data.data;
  },
  toggleMedication: async (id: string) => {
    const res = await apiClient.patch<{ success: boolean; data: Medication }>(`/medications/${id}/toggle`);
    return res.data.data;
  },
};

// Staff-specific API helpers
export const staffApi = {
  getMyClinic: async () => {
    const res = await apiClient.get<{ success: boolean; data: any }>('/staff/clinic');
    return res.data.data;
  },
};

export const notificationApi = {
  getNotifications: async () => {
    const res = await apiClient.get<{
      success: boolean;
      data: { notifications: NotificationItem[]; unreadCount: number };
    }>('/notifications');
    return res.data.data;
  },

  markRead: async (id: string) => {
    const res = await apiClient.patch<{ success: boolean }>(`/notifications/${id}/read`);
    return res.data;
  },

  markAllRead: async () => {
    const res = await apiClient.patch<{ success: boolean }>('/notifications/read-all');
    return res.data;
  },
};

export const adminApi = {
  getDashboardSummary: async () => {
    const res = await apiClient.get<{ success: boolean; data: any }>('/admin/dashboard');
    return res.data.data;
  },

  getStaffList: async () => {
    const res = await apiClient.get<{ success: boolean; data: User[] }>('/admin/staff');
    return res.data.data;
  },

  createStaff: async (payload: any) => {
    const res = await apiClient.post<{ success: boolean; data: User }>('/admin/staff', payload);
    return res.data.data;
  },

  updateStaff: async (id: string, payload: any) => {
    const res = await apiClient.put<{ success: boolean; data: User }>(`/admin/staff/${id}`, payload);
    return res.data.data;
  },

  toggleStaff: async (id: string) => {
    const res = await apiClient.patch<{ success: boolean; data: User }>(`/admin/staff/${id}/toggle`);
    return res.data.data;
  },

  getAuditLogs: async (params?: { page?: number; limit?: number; action?: string; entity?: string }) => {
    const res = await apiClient.get<{
      success: boolean;
      data: {
        logs: AuditLogItem[];
        pagination: { total: number; page: number; limit: number; totalPages: number };
      };
    }>('/admin/audit-logs', { params });
    return res.data.data;
  },
};

export const reportApi = {
  getQueueReports: async (days = 7) => {
    const res = await apiClient.get<{ success: boolean; data: any }>('/reports/queue', {
      params: { days },
    });
    return res.data.data;
  },

  getStockReports: async () => {
    const res = await apiClient.get<{ success: boolean; data: any }>('/reports/stock');
    return res.data.data;
  },

  getClinicPerformance: async () => {
    const res = await apiClient.get<{ success: boolean; data: any }>('/reports/clinics');
    return res.data.data;
  },
};
