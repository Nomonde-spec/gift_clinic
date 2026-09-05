import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  surname: z.string().min(2, 'Surname must be at least 2 characters').max(50),
  email: z.string().email('Please provide a valid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100),
  phone: z.string().optional(),
  role: z.enum(['PATIENT', 'STAFF', 'ADMIN']).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  surname: z.string().min(2).max(50).optional(),
  phone: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6).optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  token: z.string().min(1, 'Token is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});
