import { z } from 'zod';

export const updateQueueSchema = z.object({
  peopleWaiting: z
    .number({ required_error: 'People waiting is required' })
    .int('People waiting must be an integer')
    .min(0, 'People waiting cannot be negative'),
  estimatedWaitMinutes: z
    .number({ required_error: 'Estimated wait minutes is required' })
    .int('Estimated wait minutes must be an integer')
    .min(0, 'Estimated wait time cannot be negative'),
  openConsultationRooms: z
    .number({ required_error: 'Consultation rooms is required' })
    .int()
    .min(0, 'Consultation rooms cannot be negative'),
  status: z.enum(['LOW', 'MODERATE', 'BUSY', 'VERY_BUSY', 'CLOSED'], {
    errorMap: () => ({ message: 'Invalid queue status level' }),
  }),
});
