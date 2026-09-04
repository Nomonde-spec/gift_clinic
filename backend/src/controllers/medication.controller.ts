import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import {
  listMedications,
  createMedication,
  updateMedication,
  toggleMedication,
} from '../services/medication.service';
import { sendSuccess, sendError } from '../utils/response';

export const getMedications = async (req: AuthenticatedRequest, res: Response) => {
  const { search, category, isActive } = req.query;
  try {
    const medications = await listMedications({
      search: search as string,
      category: category as string,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    });
    return sendSuccess(res, medications);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to retrieve medications', 500);
  }
};

export const createNewMedication = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const medication = await createMedication(req.body, req.user?.id, req.ip);
    return sendSuccess(res, medication, 'Medication added to catalogue', 201);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to create medication', 400);
  }
};

export const updateMedicationDetails = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    const medication = await updateMedication(id, req.body, req.user?.id, req.ip);
    return sendSuccess(res, medication, 'Medication updated successfully');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to update medication', 400);
  }
};

export const toggleMedicationStatus = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    const medication = await toggleMedication(id, req.user?.id, req.ip);
    if (!medication) {
      return sendError(res, 'Medication not found', 404);
    }
    return sendSuccess(
      res,
      medication,
      `Medication marked as ${medication.isActive ? 'ACTIVE' : 'INACTIVE'}`
    );
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to toggle medication', 400);
  }
};
