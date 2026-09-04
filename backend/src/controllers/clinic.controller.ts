import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import {
  listClinics,
  getClinicById,
  createClinic,
  updateClinic,
  toggleClinicStatus,
} from '../services/clinic.service';
import { sendSuccess, sendError } from '../utils/response';

export const getClinics = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await listClinics(req.query as any);
    return sendSuccess(res, result);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to retrieve clinics', 500);
  }
};

export const getSingleClinic = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    const clinic = await getClinicById(id);
    if (!clinic) {
      return sendError(res, 'Clinic not found', 404);
    }
    return sendSuccess(res, clinic);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to retrieve clinic details', 500);
  }
};

export const createNewClinic = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinic = await createClinic(req.body, req.user?.id, req.ip);
    return sendSuccess(res, clinic, 'Clinic created successfully', 201);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to create clinic', 400);
  }
};

export const updateClinicDetails = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    const clinic = await updateClinic(id, req.body, req.user?.id, req.ip);
    return sendSuccess(res, clinic, 'Clinic updated successfully');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to update clinic', 400);
  }
};

export const toggleClinic = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    const clinic = await toggleClinicStatus(id, req.user?.id, req.ip);
    if (!clinic) {
      return sendError(res, 'Clinic not found', 404);
    }
    return sendSuccess(
      res,
      clinic,
      `Clinic marked as ${clinic.isOpen ? 'OPEN' : 'CLOSED'}`
    );
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to toggle clinic status', 400);
  }
};
