import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../services/notification.service';
import { sendSuccess, sendError } from '../utils/response';

export const getNotifications = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Unauthorized', 401);
  }

  try {
    const result = await getUserNotifications(req.user.id);
    return sendSuccess(res, result);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch notifications', 500);
  }
};

export const markRead = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Unauthorized', 401);
  }

  const { id } = req.params;
  try {
    await markNotificationAsRead(id, req.user.id);
    return sendSuccess(res, null, 'Notification marked as read');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to update notification', 500);
  }
};

export const markAllRead = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Unauthorized', 401);
  }

  try {
    await markAllNotificationsAsRead(req.user.id);
    return sendSuccess(res, null, 'All notifications marked as read');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to update notifications', 500);
  }
};
