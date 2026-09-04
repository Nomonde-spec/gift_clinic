import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import {
  getQueueReports,
  getStockReports,
  getClinicPerformance,
} from '../services/report.service';
import { sendSuccess, sendError } from '../utils/response';

export const getQueueReportHandler = async (req: AuthenticatedRequest, res: Response) => {
  const days = req.query.days ? parseInt(req.query.days as string, 10) : 7;
  try {
    const report = await getQueueReports(days);
    return sendSuccess(res, report);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to generate queue report', 500);
  }
};

export const getStockReportHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const report = await getStockReports();
    return sendSuccess(res, report);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to generate stock report', 500);
  }
};

export const getClinicPerformanceHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const report = await getClinicPerformance();
    return sendSuccess(res, report);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to generate clinic performance report', 500);
  }
};
