import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import {
  getClinicQueue,
  updateClinicQueue,
  getQueueHistory,
  getQueueAnalytics,
} from '../services/queue.service';
import { sendSuccess, sendError } from '../utils/response';

export const getQueue = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    const queue = await getClinicQueue(id);
    if (!queue) {
      return sendError(res, 'Queue status not found for this clinic', 404);
    }
    return sendSuccess(res, queue);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to retrieve queue status', 500);
  }
};

export const updateQueue = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { peopleWaiting, estimatedWaitMinutes, openConsultationRooms, status } = req.body;

  try {
    const result = await updateClinicQueue({
      clinicId: id,
      peopleWaiting,
      estimatedWaitMinutes,
      openConsultationRooms,
      status,
      updatedById: req.user?.id,
      ipAddress: req.ip,
    });

    return sendSuccess(res, result, 'Queue status updated successfully');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to update queue status', 400);
  }
};

export const getHistory = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const days = req.query.days ? parseInt(req.query.days as string, 10) : 7;

  try {
    const history = await getQueueHistory(id, days);
    return sendSuccess(res, history);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to retrieve queue history', 500);
  }
};

export const getAnalytics = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    const analytics = await getQueueAnalytics(id);
    return sendSuccess(res, analytics);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to retrieve queue analytics', 500);
  }
};
