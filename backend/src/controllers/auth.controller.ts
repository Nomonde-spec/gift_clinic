import { Response } from 'express';
import { AuthenticatedRequest, UserRole } from '../types';
import prisma from '../services/prisma';
import { hashPassword, comparePassword } from '../utils/password';
import { signJwt } from '../utils/jwt';
import { sendSuccess, sendError } from '../utils/response';
import { logAudit } from '../services/audit.service';
import crypto from 'crypto';
import { URL } from 'url';

export const register = async (req: AuthenticatedRequest, res: Response) => {
  const { name, surname, email, password, phone, role: requestedRole, clinicId, clinicIds } = req.body;

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    // Log existing user id for debugging (do not log sensitive data)
    console.warn(`Register attempt with existing email: ${email.toLowerCase()} (userId: ${existing.id})`);
    return sendError(res, 'An account with this email already exists. Try signing in or use Forgot Password to recover access.', 409);
  }

  const passwordHash = await hashPassword(password);

  // Determine role to assign. Default to PATIENT. Allow STAFF via registration but never allow ADMIN by public registration.
  let roleToAssign: string = 'PATIENT';
  if (requestedRole) {
    const r = String(requestedRole).toUpperCase();
    if (r === 'STAFF') {
      roleToAssign = 'STAFF';
    } else {
      // Any attempt to set ADMIN or invalid values falls back to PATIENT
      roleToAssign = 'PATIENT';
    }
  }

  // Determine clinics to assign (if any). For public STAFF registration, default to Soweto clinic when none provided.
  let clinicsToAssign: string[] = [];
  if (Array.isArray(clinicIds) && clinicIds.length > 0) clinicsToAssign = clinicIds;
  else if (clinicId) clinicsToAssign = [clinicId];

  if (roleToAssign === 'STAFF' && clinicsToAssign.length === 0) {
    // try to find a Soweto clinic as a sensible default
    const soweto = await prisma.clinic.findFirst({
      where: {
        OR: [
          { name: { contains: 'soweto', mode: 'insensitive' } },
          { suburb: { contains: 'soweto', mode: 'insensitive' } },
        ],
      },
    });
    if (soweto) clinicsToAssign = [soweto.id];
  }

  const user = await prisma.user.create({
    data: {
      name,
      surname,
      email: email.toLowerCase(),
      passwordHash,
      phone,
      role: roleToAssign as any,
      isActive: true,
      ...(roleToAssign === 'STAFF' && clinicsToAssign.length > 0 && {
        staffClinics: {
          create: clinicsToAssign.map((cId: string) => ({ clinicId: cId })),
        },
      }),
    },
    select: {
      id: true,
      name: true,
      surname: true,
      email: true,
      role: true,
      phone: true,
      createdAt: true,
      staffClinics: {
        include: { clinic: { select: { id: true, name: true, city: true, suburb: true } } },
      },
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

export const forgotPassword = async (req: AuthenticatedRequest, res: Response) => {
  const { email } = req.body;
  if (!email) return sendError(res, 'Email is required', 400);

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

  // Always return success for security reasons (avoid account enumeration)
  if (!user) {
    return sendSuccess(res, null, 'If an account with that email exists, a reset link has been sent');
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiry = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

  await prisma.user.update({ where: { id: user.id }, data: { resetToken: token, resetTokenExpiry: expiry } });

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const resetUrl = `${frontendUrl}/reset?token=${token}&email=${encodeURIComponent(user.email)}`;

  // Ideally send email via SMTP. For now, log the reset link for development.
  console.log(`Password reset link for ${user.email}: ${resetUrl}`);

  await logAudit({
    userId: user.id,
    action: 'PASSWORD_RESET_REQUEST',
    entity: 'User',
    entityId: user.id,
    ipAddress: req.ip,
  });

  return sendSuccess(res, null, 'If an account with that email exists, a reset link has been sent');
};

export const resetPassword = async (req: AuthenticatedRequest, res: Response) => {
  const { email, token, newPassword } = req.body;
  if (!email || !token || !newPassword) return sendError(res, 'Missing required fields', 400);

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user || !user.resetToken || !user.resetTokenExpiry) return sendError(res, 'Invalid or expired reset token', 400);

  if (user.resetToken !== token) return sendError(res, 'Invalid or expired reset token', 400);
  if (new Date() > user.resetTokenExpiry) return sendError(res, 'Reset token has expired', 400);

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash, resetToken: null, resetTokenExpiry: null } });

  await logAudit({
    userId: user.id,
    action: 'PASSWORD_RESET_COMPLETE',
    entity: 'User',
    entityId: user.id,
    ipAddress: req.ip,
  });

  return sendSuccess(res, null, 'Password has been reset successfully');
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
