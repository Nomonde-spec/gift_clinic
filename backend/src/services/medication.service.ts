import prisma from './prisma';
import { logAudit } from './audit.service';
import { calculateStockStatus } from './stock.service';

export const listMedications = async (query?: { search?: string; category?: string; isActive?: boolean }) => {
  const whereClause: any = {};

  if (query?.search) {
    whereClause.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { description: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  if (query?.category) {
    whereClause.category = { equals: query.category, mode: 'insensitive' };
  }

  if (query?.isActive !== undefined) {
    whereClause.isActive = query.isActive;
  }

  return prisma.medication.findMany({
    where: whereClause,
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { clinicStocks: true },
      },
    },
  });
};

export const createMedication = async (data: any, adminUserId?: string, ip?: string) => {
  const medication = await prisma.medication.create({
    data: {
      name: data.name,
      description: data.description,
      category: data.category,
      unit: data.unit || 'tablets',
      lowStockThreshold: data.lowStockThreshold || 20,
      isActive: data.isActive ?? true,
    },
  });

  // Automatically initialize stock records for this medication across all existing clinics
  const clinics = await prisma.clinic.findMany({ select: { id: true } });
  if (clinics.length > 0) {
    await prisma.clinicMedicationStock.createMany({
      data: clinics.map((c) => ({
        clinicId: c.id,
        medicationId: medication.id,
        quantity: 0,
        status: 'OUT_OF_STOCK',
      })),
      skipDuplicates: true,
    });
  }

  await logAudit({
    userId: adminUserId,
    action: 'ADMIN_CREATED_MEDICATION',
    entity: 'Medication',
    entityId: medication.id,
    details: { name: medication.name, threshold: medication.lowStockThreshold },
    ipAddress: ip,
  });

  return medication;
};

export const updateMedication = async (
  id: string,
  data: any,
  adminUserId?: string,
  ip?: string
) => {
  const medication = await prisma.medication.update({
    where: { id },
    data,
  });

  // If lowStockThreshold changed, recalculate status for all clinic stocks for this med
  if (data.lowStockThreshold !== undefined) {
    const stocks = await prisma.clinicMedicationStock.findMany({
      where: { medicationId: id },
    });

    for (const stock of stocks) {
      const newStatus = calculateStockStatus(stock.quantity, medication.lowStockThreshold);
      if (newStatus !== stock.status) {
        await prisma.clinicMedicationStock.update({
          where: { id: stock.id },
          data: { status: newStatus as any },
        });
      }
    }
  }

  await logAudit({
    userId: adminUserId,
    action: 'ADMIN_UPDATED_MEDICATION',
    entity: 'Medication',
    entityId: id,
    details: data,
    ipAddress: ip,
  });

  return medication;
};

export const toggleMedication = async (
  id: string,
  adminUserId?: string,
  ip?: string
) => {
  const existing = await prisma.medication.findUnique({ where: { id } });
  if (!existing) return null;

  const updated = await prisma.medication.update({
    where: { id },
    data: { isActive: !existing.isActive },
  });

  await logAudit({
    userId: adminUserId,
    action: updated.isActive ? 'ADMIN_ACTIVATED_MEDICATION' : 'ADMIN_DEACTIVATED_MEDICATION',
    entity: 'Medication',
    entityId: id,
    details: { isActive: updated.isActive },
    ipAddress: ip,
  });

  return updated;
};
