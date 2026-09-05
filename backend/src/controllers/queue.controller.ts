import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import {
  getClinicQueue,
  updateClinicQueue,
  getQueueHistory,
  getQueueAnalytics,
} from '../services/queue.service';
import prisma from '../services/prisma';
import { logAudit } from '../services/audit.service';
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
  const clinicId =
    (req.params && (req.params.id || req.params.clinicId)) ||
    req.user?.assignedClinicId ||
    req.user?.clinicId;
  const { peopleWaiting, estimatedWaitMinutes, openConsultationRooms, status } = req.body;

  if (!clinicId) {
    return sendError(res, 'Clinic ID is required', 400);
  }

  try {
    // Find existing queue status for the clinic
    const queue = await prisma.queueStatus.findFirst({ where: { clinicId } });
    if (!queue) return sendError(res, 'Queue not found for clinic', 404);

    // Update queue status
    const updated = await prisma.queueStatus.update({
      where: { id: queue.id },
      data: {
        peopleWaiting,
        estimatedWaitMinutes,
        openConsultationRooms,
        status,
        updatedById: req.user?.id,
      },
    });

    // Record history
    await prisma.queueHistory.create({
      data: {
        clinicId: queue.clinicId,
        peopleWaiting,
        estimatedWaitMinutes,
        openConsultationRooms,
        status,
        updatedById: req.user?.id,
      },
    });

    // Audit log
    await logAudit({
      userId: req.user?.id,
      action: 'STAFF_UPDATED_QUEUE',
      entity: 'QueueStatus',
      entityId: queue.id,
      ipAddress: req.ip,
      details: JSON.stringify({ peopleWaiting, estimatedWaitMinutes, openConsultationRooms, status }),
    });

    // Notification when VERY_BUSY
    if (status === 'VERY_BUSY' && req.user?.id) {
      await prisma.notification.create({
        data: {
          userId: req.user.id,
          type: 'QUEUE_WARNING',
          title: 'Queue Very Busy',
          message: `Queue status changed to VERY_BUSY at clinic ${clinicId}`,
          isRead: false,
        },
      });
    }

    return sendSuccess(res, updated, 'Queue status updated successfully');
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
