import { z } from 'zod';

export const updateStockSchema = z.object({
  quantity: z
    .number({ required_error: 'Quantity is required' })
    .int('Quantity must be an integer')
    .min(0, 'Medication quantity cannot be negative'),
});

export const batchUpdateStockSchema = z.object({
  updates: z.array(
    z.object({
      medicationId: z.string().uuid('Invalid medication ID'),
      quantity: z.number().int().min(0, 'Medication quantity cannot be negative'),
    })
  ).min(1, 'At least one stock update required'),
});
