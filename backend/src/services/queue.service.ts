import prisma from './prisma';
import { logAudit } from './audit.service';
import { broadcastToStaffAndAdmin } from './notification.service';
import { QueueLevelType } from '../types';

interface UpdateQueueParams {
  clinicId: string;
  peopleWaiting: number;
  estimatedWaitMinutes: number;
  openConsultationRooms: number;
  status: QueueLevelType;
  updatedById?: string;
  ipAddress?: string;
}

export const getClinicQueue = async (clinicId: string) => {
  const queue = await prisma.queueStatus.findUnique({
    where: { clinicId },
    include: {
      clinic: {
        select: {
          id: true,
          name: true,
          isOpen: true,
        },
      },
      updatedBy: {
        select: {
          id: true,
          name: true,
          surname: true,
        },
      },
    },
  });

  return queue;
};

export const updateClinicQueue = async ({
  clinicId,
  peopleWaiting,
  estimatedWaitMinutes,
  openConsultationRooms,
  status,
  updatedById,
  ipAddress,
}: UpdateQueueParams) => {
  // 1. Transactionally update or create QueueStatus, and record QueueHistory
  const [updatedStatus, history] = await prisma.$transaction([
    prisma.queueStatus.upsert({
      where: { clinicId },
      create: {
        clinicId,
        peopleWaiting,
        estimatedWaitMinutes,
        openConsultationRooms,
        status: status as any,
        updatedById,
      },
      update: {
        peopleWaiting,
        estimatedWaitMinutes,
        openConsultationRooms,
        status: status as any,
        updatedById,
      },
      include: {
        clinic: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
    prisma.queueHistory.create({
      data: {
        clinicId,
        peopleWaiting,
        estimatedWaitMinutes,
        openConsultationRooms,
        status: status as any,
        updatedById,
      },
    }),
  ]);

  // 2. Record Audit Log
  await logAudit({
    userId: updatedById,
    action: 'STAFF_UPDATED_QUEUE',
    entity: 'QueueStatus',
    entityId: clinicId,
    details: {
      peopleWaiting,
      estimatedWaitMinutes,
      openConsultationRooms,
      status,
    },
    ipAddress,
  });

  // 3. Trigger alert notification if Queue is VERY_BUSY or BUSY with long wait
  if (status === 'VERY_BUSY' || (status === 'BUSY' && estimatedWaitMinutes >= 60)) {
    const clinicName = updatedStatus.clinic?.name || 'Clinic';
    await broadcastToStaffAndAdmin(
      'QUEUE_WARNING',
      `High Queue Alert: ${clinicName}`,
      `${clinicName} queue is ${status} with ${peopleWaiting} waiting (~${estimatedWaitMinutes} mins wait).`,
      clinicId
    );
  }

  return { queue: updatedStatus, history };
};

export const getQueueHistory = async (clinicId: string, days = 7) => {
  const sinceDate = new Date();
  sinceDate.setDate(sinceDate.getDate() - days);

  const history = await prisma.queueHistory.findMany({
    where: {
      clinicId,
      createdAt: { gte: sinceDate },
    },
    orderBy: { createdAt: 'asc' },
    include: {
      updatedBy: {
        select: {
          id: true,
          name: true,
          surname: true,
        },
      },
    },
  });

  return history;
};

export const getQueueAnalytics = async (clinicId: string) => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [current, todayHistory] = await Promise.all([
    prisma.queueStatus.findUnique({
      where: { clinicId },
    }),
    prisma.queueHistory.findMany({
      where: {
        clinicId,
        createdAt: { gte: todayStart },
      },
      orderBy: { createdAt: 'asc' },
    }),
  ]);

  if (!todayHistory.length) {
    return {
      currentWait: current?.estimatedWaitMinutes || 0,
      averageWaitToday: current?.estimatedWaitMinutes || 0,
      peakWaitToday: current?.estimatedWaitMinutes || 0,
      currentQueue: current?.peopleWaiting || 0,
      peakQueue: current?.peopleWaiting || 0,
      peakTime: 'N/A (No updates today)',
      historyCount: 0,
    };
  }

  const waitTimes = todayHistory.map((h) => h.estimatedWaitMinutes);
  const queueSizes = todayHistory.map((h) => h.peopleWaiting);

  const avgWait = Math.round(
    waitTimes.reduce((acc, curr) => acc + curr, 0) / waitTimes.length
  );
  const peakWait = Math.max(...waitTimes);
  const peakQueue = Math.max(...queueSizes);

  // Peak time discovery
  const peakRecord = todayHistory.reduce((prev, current) =>
    prev.peopleWaiting > current.peopleWaiting ? prev : current
  );
  const peakDate = new Date(peakRecord.createdAt);
  const startHour = peakDate.getHours().toString().padStart(2, '0');
  const endHour = (peakDate.getHours() + 2).toString().padStart(2, '0');
  const peakTime = `${startHour}:00 – ${endHour}:00`;

  return {
    currentWait: current?.estimatedWaitMinutes || 0,
    averageWaitToday: avgWait,
    peakWaitToday: peakWait,
    currentQueue: current?.peopleWaiting || 0,
    peakQueue,
    peakTime,
    historyCount: todayHistory.length,
  };
};
