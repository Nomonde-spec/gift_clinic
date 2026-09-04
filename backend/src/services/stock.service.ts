import prisma from './prisma';
import { logAudit } from './audit.service';
import { broadcastToStaffAndAdmin } from './notification.service';
import { StockStatusType } from '../types';

export const calculateStockStatus = (
  quantity: number,
  lowStockThreshold: number
): StockStatusType => {
  if (quantity <= 0) {
    return 'OUT_OF_STOCK';
  }
  if (quantity <= lowStockThreshold) {
    return 'LOW_STOCK';
  }
  return 'IN_STOCK';
};

interface UpdateStockParams {
  clinicId: string;
  medicationId: string;
  quantity: number;
  updatedById?: string;
  ipAddress?: string;
}

export const getClinicStock = async (
  clinicId: string,
  filter?: { search?: string; status?: StockStatusType; category?: string }
) => {
  const whereClause: any = { clinicId };

  if (filter?.status) {
    whereClause.status = filter.status;
  }

  if (filter?.search || filter?.category) {
    whereClause.medication = {
      ...(filter.search && {
        OR: [
          { name: { contains: filter.search, mode: 'insensitive' } },
          { description: { contains: filter.search, mode: 'insensitive' } },
        ],
      }),
      ...(filter.category && {
        category: { equals: filter.category, mode: 'insensitive' },
      }),
      isActive: true,
    };
  }

  const stock = await prisma.clinicMedicationStock.findMany({
    where: whereClause,
    include: {
      medication: true,
      lastUpdatedBy: {
        select: {
          id: true,
          name: true,
          surname: true,
        },
      },
    },
    orderBy: [
      { status: 'asc' }, // OUT_OF_STOCK and LOW_STOCK first
      { medication: { name: 'asc' } },
    ],
  });

  // Calculate summary counts
  const total = stock.length;
  const inStockCount = stock.filter((s) => s.status === 'IN_STOCK').length;
  const lowStockCount = stock.filter((s) => s.status === 'LOW_STOCK').length;
  const outOfStockCount = stock.filter((s) => s.status === 'OUT_OF_STOCK').length;

  return {
    stock,
    summary: {
      total,
      inStockCount,
      lowStockCount,
      outOfStockCount,
    },
  };
};

export const updateClinicStock = async ({
  clinicId,
  medicationId,
  quantity,
  updatedById,
  ipAddress,
}: UpdateStockParams) => {
  if (quantity < 0) {
    throw new Error('Medication quantity cannot be negative');
  }

  // 1. Fetch medication and current clinic stock
  const [medication, clinic, existingStock] = await Promise.all([
    prisma.medication.findUnique({
      where: { id: medicationId },
    }),
    prisma.clinic.findUnique({
      where: { id: clinicId },
      select: { id: true, name: true },
    }),
    prisma.clinicMedicationStock.findUnique({
      where: {
        clinicId_medicationId: {
          clinicId,
          medicationId,
        },
      },
    }),
  ]);

  if (!medication) {
    throw new Error('Medication not found in catalogue');
  }

  if (!clinic) {
    throw new Error('Clinic not found');
  }

  const previousQuantity = existingStock?.quantity ?? 0;
  const previousStatus = existingStock?.status ?? 'OUT_OF_STOCK';
  const newStatus = calculateStockStatus(quantity, medication.lowStockThreshold);

  // 2. Transactionally update/create stock and log stock history
  const [updatedStock, history] = await prisma.$transaction([
    prisma.clinicMedicationStock.upsert({
      where: {
        clinicId_medicationId: {
          clinicId,
          medicationId,
        },
      },
      create: {
        clinicId,
        medicationId,
        quantity,
        status: newStatus as any,
        lastUpdatedById: updatedById,
      },
      update: {
        quantity,
        status: newStatus as any,
        lastUpdatedById: updatedById,
      },
      include: {
        medication: true,
      },
    }),
    prisma.stockHistory.create({
      data: {
        clinicId,
        medicationId,
        previousQuantity,
        newQuantity: quantity,
        previousStatus: previousStatus as any,
        newStatus: newStatus as any,
        updatedById,
      },
    }),
  ]);

  // 3. Record Audit Log
  await logAudit({
    userId: updatedById,
    action: 'STAFF_UPDATED_STOCK',
    entity: 'ClinicMedicationStock',
    entityId: `${clinicId}:${medicationId}`,
    details: {
      medicationName: medication.name,
      previousQuantity,
      newQuantity: quantity,
      previousStatus,
      newStatus,
    },
    ipAddress,
  });

  // 4. Trigger alert notification if status changed to LOW_STOCK or OUT_OF_STOCK
  if (newStatus === 'OUT_OF_STOCK' && previousStatus !== 'OUT_OF_STOCK') {
    await broadcastToStaffAndAdmin(
      'OUT_OF_STOCK',
      `Out of Stock: ${medication.name}`,
      `Urgent: ${medication.name} is now OUT OF STOCK at ${clinic.name}.`,
      clinicId
    );
  } else if (newStatus === 'LOW_STOCK' && previousStatus === 'IN_STOCK') {
    await broadcastToStaffAndAdmin(
      'LOW_STOCK',
      `Low Stock Warning: ${medication.name}`,
      `Notice: ${medication.name} is running low at ${clinic.name} (${quantity} ${medication.unit} remaining).`,
      clinicId
    );
  }

  return { stock: updatedStock, history };
};

export const getStockHistory = async (
  clinicId: string,
  medicationId?: string,
  limit = 50
) => {
  const whereClause: any = { clinicId };
  if (medicationId) {
    whereClause.medicationId = medicationId;
  }

  const history = await prisma.stockHistory.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      medication: {
        select: {
          id: true,
          name: true,
          unit: true,
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

  return history;
};
