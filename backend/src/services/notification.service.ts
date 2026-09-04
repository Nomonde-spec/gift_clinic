import prisma from './prisma';
import { NotificationCategory } from '../types';

export const createNotification = async (
  userId: string,
  type: NotificationCategory,
  title: string,
  message: string
) => {
  try {
    return await prisma.notification.create({
      data: {
        userId,
        type: type as any,
        title,
        message,
        isRead: false,
      },
    });
  } catch (error) {
    console.error('[Notification Error]', error);
  }
};

export const broadcastToStaffAndAdmin = async (
  type: NotificationCategory,
  title: string,
  message: string,
  clinicId?: string
) => {
  try {
    // Find all Admins
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN', isActive: true },
      select: { id: true },
    });

    // If clinicId provided, find staff assigned to that clinic; otherwise all active staff
    let staffUserIds: string[] = [];
    if (clinicId) {
      const assignments = await prisma.staffClinic.findMany({
        where: { clinicId },
        select: { staffId: true },
      });
      staffUserIds = assignments.map((a) => a.staffId);
    } else {
      const staff = await prisma.user.findMany({
        where: { role: 'STAFF', isActive: true },
        select: { id: true },
      });
      staffUserIds = staff.map((s) => s.id);
    }

    const recipientIds = Array.from(
      new Set([...admins.map((a) => a.id), ...staffUserIds])
    );

    if (recipientIds.length > 0) {
      await prisma.notification.createMany({
        data: recipientIds.map((userId) => ({
          userId,
          type: type as any,
          title,
          message,
          isRead: false,
        })),
      });
    }
  } catch (error) {
    console.error('[Broadcast Notification Error]', error);
  }
};

export const getUserNotifications = async (userId: string) => {
  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    prisma.notification.count({
      where: { userId, isRead: false },
    }),
  ]);

  return { notifications, unreadCount };
};

export const markNotificationAsRead = async (id: string, userId: string) => {
  return prisma.notification.updateMany({
    where: { id, userId },
    data: { isRead: true },
  });
};

export const markAllNotificationsAsRead = async (userId: string) => {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
};
