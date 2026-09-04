import { Response } from 'express';
import { AuthenticatedRequest, UserRole } from '../types';
import prisma from '../services/prisma';
import { hashPassword, comparePassword } from '../utils/password';
import { signJwt } from '../utils/jwt';
import { sendSuccess, sendError } from '../utils/response';
import { logAudit } from '../services/audit.service';

export const register = async (req: AuthenticatedRequest, res: Response) => {
  const { name, surname, email, password, phone } = req.body;

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    return sendError(res, 'An account with this email already exists', 409);
  }

  const passwordHash = await hashPassword(password);

  // Strictly assign PATIENT role for public registration
  const user = await prisma.user.create({
    data: {
      name,
      surname,
      email: email.toLowerCase(),
      passwordHash,
      phone,
      role: 'PATIENT',
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      surname: true,
      email: true,
      role: true,
      phone: true,
      createdAt: true,
    },
  });

  const token = signJwt({
    id: user.id,
    email: user.email,
    role: user.role as UserRole,
    name: user.name,
    surname: user.surname,
  });

  await logAudit({
    userId: user.id,
    action: 'USER_REGISTER',
    entity: 'User',
    entityId: user.id,
    ipAddress: req.ip,
  });

  return sendSuccess(
    res,
    { user, token },
    'Registration successful. Welcome to the Public Clinic Tracker.',
    201
  );
};

export const login = async (req: AuthenticatedRequest, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: {
      staffClinics: {
        include: {
          clinic: {
            select: { id: true, name: true, city: true, suburb: true },
          },
        },
      },
    },
  });

  if (!user) {
    return sendError(res, 'Invalid email or password', 401);
  }

  if (!user.isActive) {
    return sendError(res, 'Your account has been deactivated. Please contact an administrator.', 403);
  }

  const isMatch = await comparePassword(password, user.passwordHash);
  if (!isMatch) {
    return sendError(res, 'Invalid email or password', 401);
  }

  const token = signJwt({
    id: user.id,
    email: user.email,
    role: user.role as UserRole,
    name: user.name,
    surname: user.surname,
  });

  await logAudit({
    userId: user.id,
    action: 'USER_LOGIN',
    entity: 'User',
    entityId: user.id,
    ipAddress: req.ip,
  });

  const { passwordHash: _, ...safeUser } = user;

  return sendSuccess(res, { user: safeUser, token }, 'Login successful');
};

export const logout = async (req: AuthenticatedRequest, res: Response) => {
  if (req.user) {
    await logAudit({
      userId: req.user.id,
      action: 'USER_LOGOUT',
      entity: 'User',
      entityId: req.user.id,
      ipAddress: req.ip,
    });
  }
  return sendSuccess(res, null, 'Logged out successfully');
};

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Unauthorized', 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: {
      staffClinics: {
        include: {
          clinic: {
            select: {
              id: true,
              name: true,
              city: true,
              suburb: true,
              isOpen: true,
            },
          },
        },
      },
    },
  });

  if (!user || !user.isActive) {
    return sendError(res, 'User not found or deactivated', 404);
  }

  const { passwordHash: _, ...safeUser } = user;
  return sendSuccess(res, safeUser);
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Unauthorized', 401);
  }

  const { name, surname, phone, currentPassword, newPassword } = req.body;
  const updateData: any = {};

  if (name) updateData.name = name;
  if (surname) updateData.surname = surname;
  if (phone !== undefined) updateData.phone = phone;

  if (newPassword) {
    if (!currentPassword) {
      return sendError(res, 'Current password is required to set a new password', 400);
    }
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return sendError(res, 'User not found', 404);

    const matches = await comparePassword(currentPassword, user.passwordHash);
    if (!matches) {
      return sendError(res, 'Current password incorrect', 400);
    }
    updateData.passwordHash = await hashPassword(newPassword);
  }

  const updatedUser = await prisma.user.update({
    where: { id: req.user.id },
    data: updateData,
    select: {
      id: true,
      name: true,
      surname: true,
      email: true,
      role: true,
      phone: true,
      updatedAt: true,
    },
  });

  return sendSuccess(res, updatedUser, 'Profile updated successfully');
};
