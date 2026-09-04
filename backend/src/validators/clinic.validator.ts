import { z } from 'zod';

export const createClinicSchema = z.object({
  name: z.string().min(3, 'Clinic name must be at least 3 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  address: z.string().min(5, 'Address is required'),
  suburb: z.string().min(2, 'Suburb is required'),
  city: z.string().min(2, 'City is required'),
  province: z.string().min(2, 'Province is required'),
  phone: z.string().min(5, 'Valid phone number is required'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  openingTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format must be HH:MM').default('07:00'),
  closingTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format must be HH:MM').default('17:00'),
  isOpen: z.boolean().default(true),
});

export const updateClinicSchema = createClinicSchema.partial();

export const clinicQuerySchema = z.object({
  search: z.string().optional(),
  city: z.string().optional(),
  suburb: z.string().optional(),
  isOpen: z.enum(['true', 'false']).optional(),
  queueStatus: z.enum(['LOW', 'MODERATE', 'BUSY', 'VERY_BUSY', 'CLOSED']).optional(),
  medicationAvailable: z.enum(['all', 'has_stock', 'low_stock', 'out_of_stock']).optional(),
  sortBy: z.enum(['waitAsc', 'waitDesc', 'nameAsc', 'nameDesc', 'createdDesc']).optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
});
