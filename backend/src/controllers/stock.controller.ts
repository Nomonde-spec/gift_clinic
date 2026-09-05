import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import {
  getClinicStock,
  updateClinicStock,
  getStockHistory,
} from '../services/stock.service';
import { sendSuccess, sendError } from '../utils/response';

export const getStock = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { search, status, category } = req.query;

  try {
    const clinicId = id || (req.params && req.params.clinicId);
    const result = await getClinicStock(clinicId, {
      search: search as string,
      status: status as any,
      category: category as string,
    });
    return sendSuccess(res, result);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to retrieve stock list', 500);
  }
};

export const updateStock = async (req: AuthenticatedRequest, res: Response) => {
  const { id: clinicId, medicationId } = req.params;
  const { quantity } = req.body;

  try {
    const result = await updateClinicStock({
      clinicId,
      medicationId,
      quantity,
      updatedById: req.user?.id,
      ipAddress: req.ip,
    });

    return sendSuccess(
      res,
      result,
      `Stock updated successfully. Current status: ${result.stock.status}`
    );
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to update stock', 400);
  }
};

export const getHistory = async (req: AuthenticatedRequest, res: Response) => {
  const { id: clinicId } = req.params;
  const { medicationId, limit } = req.query;

  try {
    const history = await getStockHistory(
      clinicId,
      medicationId as string,
      limit ? parseInt(limit as string, 10) : 50
    );
    return sendSuccess(res, history);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to retrieve stock history', 500);
  }
};
