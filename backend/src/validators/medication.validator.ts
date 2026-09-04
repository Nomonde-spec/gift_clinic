import { z } from 'zod';

export const createMedicationSchema = z.object({
  name: z.string().min(2, 'Medication name must be at least 2 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  category: z.string().min(2, 'Category is required'),
  unit: z.string().min(1, 'Unit is required').default('tablets'),
  lowStockThreshold: z
    .number()
    .int()
    .min(1, 'Threshold must be at least 1')
    .default(20),
  isActive: z.boolean().default(true),
});

export const updateMedicationSchema = createMedicationSchema.partial();
