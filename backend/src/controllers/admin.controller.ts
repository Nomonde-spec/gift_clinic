import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import prisma from '../services/prisma';
import { hashPassword } from '../utils/password';
import { sendSuccess, sendError } from '../utils/response';
import { logAudit } from '../services/audit.service';

export const getStaffList = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const staff = await prisma.user.findMany({
      where: { role: 'STAFF' },
      select: {
        id: true,
        name: true,
        surname: true,
        email: true,
        phone: true,
        isActive: true,
        createdAt: true,
        staffClinics: {
          include: {
            clinic: {
              select: { id: true, name: true, city: true, suburb: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, staff);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to list staff', 500);
  }
};

export const createStaffMember = async (req: AuthenticatedRequest, res: Response) => {
  const { name, surname, email, password, phone, clinicIds } = req.body;

  try {
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return sendError(res, 'User with this email already exists', 409);
    }

    const passwordHash = await hashPassword(password || 'StaffPass123!');

    const staff = await prisma.user.create({
      data: {
        name,
        surname,
        email: email.toLowerCase(),
        passwordHash,
        phone,
        role: 'STAFF',
        isActive: true,
        ...(clinicIds && clinicIds.length > 0 && {
          staffClinics: {
            create: clinicIds.map((clinicId: string) => ({ clinicId })),
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
        isActive: true,
        createdAt: true,
        staffClinics: {
          include: {
            clinic: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    await logAudit({
      userId: req.user?.id,
      action: 'ADMIN_CREATED_STAFF',
      entity: 'User',
      entityId: staff.id,
      details: { email: staff.email, clinicsAssigned: clinicIds },
      ipAddress: req.ip,
    });

    return sendSuccess(res, staff, 'Staff account created successfully', 201);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to create staff account', 400);
  }
};

export const updateStaffAssignments = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { clinicIds, isActive, phone, name, surname } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user || user.role !== 'STAFF') {
      return sendError(res, 'Staff member not found', 404);
    }

    if (clinicIds !== undefined) {
      await prisma.staffClinic.deleteMany({ where: { staffId: id } });
      if (clinicIds.length > 0) {
        await prisma.staffClinic.createMany({
          data: clinicIds.map((clinicId: string) => ({
            staffId: id,
            clinicId,
          })),
        });
      }
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(isActive !== undefined && { isActive }),
        ...(phone !== undefined && { phone }),
        ...(name && { name }),
        ...(surname && { surname }),
      },
      select: {
        id: true,
        name: true,
        surname: true,
        email: true,
        isActive: true,
        staffClinics: {
          include: {
            clinic: { select: { id: true, name: true } },
          },
        },
      },
    });

    await logAudit({
      userId: req.user?.id,
      action: 'ADMIN_UPDATED_STAFF',
      entity: 'User',
      entityId: id,
      details: { clinicIds, isActive },
      ipAddress: req.ip,
    });

    return sendSuccess(res, updated, 'Staff updated successfully');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to update staff assignments', 400);
  }
};

export const toggleStaffStatus = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return sendError(res, 'Staff member not found', 404);

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
    });

    await logAudit({
      userId: req.user?.id,
      action: updated.isActive ? 'ADMIN_ACTIVATED_STAFF' : 'ADMIN_DEACTIVATED_STAFF',
      entity: 'User',
      entityId: id,
      details: { isActive: updated.isActive },
      ipAddress: req.ip,
    });

    return sendSuccess(
      res,
      updated,
      `Staff member marked as ${updated.isActive ? 'ACTIVE' : 'INACTIVE'}`
    );
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to toggle staff status', 400);
  }
};

export const getAuditLogs = async (req: AuthenticatedRequest, res: Response) => {
  const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
  const skip = (page - 1) * limit;
  const { action, entity } = req.query;

  const whereClause: any = {};
  if (action) whereClause.action = action as string;
  if (entity) whereClause.entity = entity as string;

  try {
    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where: whereClause }),
      prisma.auditLog.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, surname: true, email: true, role: true },
          },
        },
      }),
    ]);

    return sendSuccess(res, {
      logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch audit logs', 500);
  }
};

export const getDashboardSummary = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const [
      totalClinics,
      openClinics,
      totalStaff,
      busyQueues,
      lowStockCount,
      outOfStockCount,
      recentAudits,
    ] = await Promise.all([
      prisma.clinic.count(),
      prisma.clinic.count({ where: { isOpen: true } }),
      prisma.user.count({ where: { role: 'STAFF', isActive: true } }),
      prisma.queueStatus.count({
        where: { status: { in: ['BUSY', 'VERY_BUSY'] } },
      }),
      prisma.clinicMedicationStock.count({ where: { status: 'LOW_STOCK' } }),
      prisma.clinicMedicationStock.count({ where: { status: 'OUT_OF_STOCK' } }),
      prisma.auditLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { name: true, surname: true, role: true },
          },
        },
      }),
    ]);

    return sendSuccess(res, {
      totalClinics,
      openClinics,
      totalStaff,
      busyClinics: busyQueues,
      lowStockCount,
      outOfStockCount,
      recentAudits,
    });
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to compile dashboard summary', 500);
  }
};
