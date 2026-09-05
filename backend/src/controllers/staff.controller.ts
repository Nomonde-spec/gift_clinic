import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import prisma from '../services/prisma';
import { sendSuccess, sendError } from '../utils/response';

export const getMyClinic = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return sendError(res, 'Authentication required', 401);

  try {
	console.log(`[staff.controller] getMyClinic called by userId=${req.user.id}`);
	// Find first clinic assignment for this staff user
	const assignment = await prisma.staffClinic.findFirst({
	  where: { staffId: req.user.id },
	  include: {
		clinic: {
		  include: {
			queueStatus: true,
			medicationStock: {
			  select: {
				id: true,
				quantity: true,
				status: true,
				medication: { select: { id: true, name: true, unit: true, lowStockThreshold: true } },
				lastUpdatedBy: { select: { id: true, name: true, surname: true } },
			  },
			},
			operatingHours: { orderBy: { dayOfWeek: 'asc' } },
		  },
		},
	  },
	});

	if (!assignment) {
	  console.log(`[staff.controller] no assignment found for userId=${req.user.id}`);
	  // Try to find any staffClinic by email fallback (handles preserved users missing staffClinic row)
	  const user = await prisma.user.findUnique({ where: { id: req.user.id }, include: { staffClinics: true } });
	  if (user?.staffClinics && user.staffClinics.length > 0) {
		const fallback = await prisma.staffClinic.findFirst({ where: { staffId: req.user.id }, include: { clinic: true } });
		if (fallback) return sendSuccess(res, fallback.clinic);
	  }
	  // Developer/testing: allow selecting a clinic directly via ?clinicId even if not assigned
	if (req.query?.clinicId) {
	  try {
		const clinicById = await prisma.clinic.findUnique({
		  where: { id: String(req.query.clinicId) },
		  include: {
			queueStatus: true,
			medicationStock: {
			  select: {
				id: true,
				quantity: true,
				status: true,
				medication: { select: { id: true, name: true, unit: true, lowStockThreshold: true } },
				lastUpdatedBy: { select: { id: true, name: true, surname: true } },
			  },
			},
			operatingHours: { orderBy: { dayOfWeek: 'asc' } },
		  },
		});
		if (clinicById) return sendSuccess(res, clinicById);
	  } catch (e: any) {
		console.log(`[staff.controller] clinic lookup by id failed: ${e?.message || e}`);
	  }
	}
	  return sendError(res, 'No clinic assigned to this staff member', 404);
	}

	const clinic = assignment.clinic;
	return sendSuccess(res, clinic);
  } catch (error: any) {
	return sendError(res, error.message || 'Failed to load staff clinic', 500);
  }
};

export const getMyDashboard = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return sendError(res, 'Authentication required', 401);

  try {
	const assignment = await prisma.staffClinic.findFirst({ where: { staffId: req.user.id } });
	if (!assignment) return sendError(res, 'No clinic assigned to this staff member', 404);

	const clinicId = assignment.clinicId;

	// Use existing services via prisma queries for dashboard data
	const clinic = await prisma.clinic.findUnique({
	  where: { id: clinicId },
	  include: {
		queueStatus: true,
		medicationStock: {
		  include: { medication: true, lastUpdatedBy: { select: { id: true, name: true, surname: true } } },
		},
	  },
	});

	if (!clinic) return sendError(res, 'Assigned clinic not found', 404);

	// Build simple dashboard payload
	const totalMeds = clinic.medicationStock.length;
	const inStock = clinic.medicationStock.filter((s) => s.status === 'IN_STOCK').length;
	const lowStock = clinic.medicationStock.filter((s) => s.status === 'LOW_STOCK').length;
	const outOfStock = clinic.medicationStock.filter((s) => s.status === 'OUT_OF_STOCK').length;

	const dashboard = {
	  clinic: clinic,
	  stockSummary: { total: totalMeds, inStock, lowStock, outOfStock },
	};

	return sendSuccess(res, dashboard);
  } catch (error: any) {
	return sendError(res, error.message || 'Failed to build dashboard', 500);
  }
};
