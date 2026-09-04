import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, UserRole } from '../types';
import { verifyJwt } from '../utils/jwt';
import { sendError } from '../utils/response';
import prisma from '../services/prisma';

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 'Authentication token missing or invalid format', 401);
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyJwt(token);

  if (!decoded) {
    return sendError(res, 'Invalid or expired token', 401);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        surname: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      return sendError(res, 'User account is deactivated or no longer exists', 401);
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
      name: user.name,
      surname: user.surname,
    };

    next();
  } catch (error) {
    return sendError(res, 'Authentication verification failed', 500);
  }
};

export const requireRole = (...roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        `Access denied. Requires one of: [${roles.join(', ')}]`,
        403
      );
    }

    next();
  };
};

export const requireStaffClinicAccess = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return sendError(res, 'Authentication required', 401);
  }

  // Administrators have system-wide access to all clinics
  if (req.user.role === 'ADMIN') {
    return next();
  }

  if (req.user.role !== 'STAFF') {
    return sendError(res, 'Staff or Admin privileges required', 403);
  }

  const clinicId = req.params.id || req.params.clinicId;
  if (!clinicId) {
    return sendError(res, 'Clinic ID is required in URL parameters', 400);
  }

  try {
    const assignment = await prisma.staffClinic.findUnique({
      where: {
        staffId_clinicId: {
          staffId: req.user.id,
          clinicId: clinicId,
        },
      },
    });

    if (!assignment) {
      return sendError(
        res,
        'Access denied: You are not assigned to manage this clinic',
        403
      );
    }

    next();
  } catch (error) {
    return sendError(res, 'Authorization check failed', 500);
  }
};
