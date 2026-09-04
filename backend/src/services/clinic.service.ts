import prisma from './prisma';
import { logAudit } from './audit.service';

interface ClinicFilterParams {
  search?: string;
  city?: string;
  suburb?: string;
  isOpen?: string;
  queueStatus?: string;
  medicationAvailable?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
}

export const listClinics = async (filters: ClinicFilterParams) => {
  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const limit = filters.limit && filters.limit > 0 ? filters.limit : 20;
  const skip = (page - 1) * limit;

  const whereClause: any = {};

  if (filters.search) {
    whereClause.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { suburb: { contains: filters.search, mode: 'insensitive' } },
      { city: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  if (filters.city) {
    whereClause.city = { equals: filters.city, mode: 'insensitive' };
  }

  if (filters.suburb) {
    whereClause.suburb = { equals: filters.suburb, mode: 'insensitive' };
  }

  if (filters.isOpen !== undefined) {
    whereClause.isOpen = filters.isOpen === 'true';
  }

  if (filters.queueStatus) {
    whereClause.queueStatus = {
      status: filters.queueStatus,
    };
  }

  let orderBy: any = { name: 'asc' };
  if (filters.sortBy === 'nameDesc') {
    orderBy = { name: 'desc' };
  } else if (filters.sortBy === 'createdDesc') {
    orderBy = { createdAt: 'desc' };
  }

  const [total, clinics] = await Promise.all([
    prisma.clinic.count({ where: whereClause }),
    prisma.clinic.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy,
      include: {
        queueStatus: true,
        medicationStock: {
          select: {
            id: true,
            status: true,
            quantity: true,
            medication: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        operatingHours: {
          orderBy: { dayOfWeek: 'asc' },
        },
      },
    }),
  ]);

  // Compute medication rollups for each clinic card
  const formattedClinics = clinics.map((c) => {
    const totalMeds = c.medicationStock.length;
    const inStock = c.medicationStock.filter((s) => s.status === 'IN_STOCK').length;
    const lowStock = c.medicationStock.filter((s) => s.status === 'LOW_STOCK').length;
    const outOfStock = c.medicationStock.filter((s) => s.status === 'OUT_OF_STOCK').length;

    return {
      ...c,
      medicationSummary: {
        totalMeds,
        inStock,
        lowStock,
        outOfStock,
        availabilityText:
          outOfStock === 0 && lowStock === 0
            ? 'All available'
            : outOfStock > 0
            ? `${outOfStock} out of stock`
            : `${lowStock} low stock`,
      },
    };
  });

  // If sorting by wait time, sort the retrieved page
  if (filters.sortBy === 'waitAsc') {
    formattedClinics.sort(
      (a, b) =>
        (a.queueStatus?.estimatedWaitMinutes ?? 999) -
        (b.queueStatus?.estimatedWaitMinutes ?? 999)
    );
  } else if (filters.sortBy === 'waitDesc') {
    formattedClinics.sort(
      (a, b) =>
        (b.queueStatus?.estimatedWaitMinutes ?? 0) -
        (a.queueStatus?.estimatedWaitMinutes ?? 0)
    );
  }

  return {
    clinics: formattedClinics,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getClinicById = async (id: string) => {
  const clinic = await prisma.clinic.findUnique({
    where: { id },
    include: {
      queueStatus: {
        include: {
          updatedBy: {
            select: { id: true, name: true, surname: true },
          },
        },
      },
      operatingHours: {
        orderBy: { dayOfWeek: 'asc' },
      },
      medicationStock: {
        include: {
          medication: true,
          lastUpdatedBy: {
            select: { id: true, name: true, surname: true },
          },
        },
        orderBy: [{ status: 'asc' }, { medication: { name: 'asc' } }],
      },
      staffClinics: {
        include: {
          staff: {
            select: { id: true, name: true, surname: true, email: true },
          },
        },
      },
    },
  });

  if (!clinic) return null;

  const totalMeds = clinic.medicationStock.length;
  const inStock = clinic.medicationStock.filter((s) => s.status === 'IN_STOCK').length;
  const lowStock = clinic.medicationStock.filter((s) => s.status === 'LOW_STOCK').length;
  const outOfStock = clinic.medicationStock.filter((s) => s.status === 'OUT_OF_STOCK').length;

  return {
    ...clinic,
    medicationSummary: {
      totalMeds,
      inStock,
      lowStock,
      outOfStock,
    },
  };
};

export const createClinic = async (data: any, adminUserId?: string, ip?: string) => {
  const clinic = await prisma.clinic.create({
    data: {
      name: data.name,
      description: data.description,
      address: data.address,
      suburb: data.suburb,
      city: data.city,
      province: data.province,
      phone: data.phone,
      latitude: data.latitude,
      longitude: data.longitude,
      openingTime: data.openingTime || '07:00',
      closingTime: data.closingTime || '17:00',
      isOpen: data.isOpen ?? true,
      queueStatus: {
        create: {
          peopleWaiting: 0,
          estimatedWaitMinutes: 0,
          openConsultationRooms: 2,
          status: 'LOW',
        },
      },
      operatingHours: {
        create: [
          { dayOfWeek: 'Monday', openTime: '07:00', closeTime: '17:00', isClosed: false },
          { dayOfWeek: 'Tuesday', openTime: '07:00', closeTime: '17:00', isClosed: false },
          { dayOfWeek: 'Wednesday', openTime: '07:00', closeTime: '17:00', isClosed: false },
          { dayOfWeek: 'Thursday', openTime: '07:00', closeTime: '17:00', isClosed: false },
          { dayOfWeek: 'Friday', openTime: '07:00', closeTime: '17:00', isClosed: false },
          { dayOfWeek: 'Saturday', openTime: '08:00', closeTime: '13:00', isClosed: false },
          { dayOfWeek: 'Sunday', openTime: '08:00', closeTime: '12:00', isClosed: true },
        ],
      },
    },
  });

  // Seed default medication inventory for this new clinic with all active medications
  const allMeds = await prisma.medication.findMany({ where: { isActive: true } });
  if (allMeds.length > 0) {
    await prisma.clinicMedicationStock.createMany({
      data: allMeds.map((med) => ({
        clinicId: clinic.id,
        medicationId: med.id,
        quantity: 50,
        status: 'IN_STOCK',
      })),
      skipDuplicates: true,
    });
  }

  await logAudit({
    userId: adminUserId,
    action: 'ADMIN_CREATED_CLINIC',
    entity: 'Clinic',
    entityId: clinic.id,
    details: { name: clinic.name, city: clinic.city },
    ipAddress: ip,
  });

  return clinic;
};

export const updateClinic = async (
  id: string,
  data: any,
  adminUserId?: string,
  ip?: string
) => {
  const clinic = await prisma.clinic.update({
    where: { id },
    data,
  });

  await logAudit({
    userId: adminUserId,
    action: 'ADMIN_UPDATED_CLINIC',
    entity: 'Clinic',
    entityId: id,
    details: data,
    ipAddress: ip,
  });

  return clinic;
};

export const toggleClinicStatus = async (
  id: string,
  adminUserId?: string,
  ip?: string
) => {
  const existing = await prisma.clinic.findUnique({ where: { id } });
  if (!existing) return null;

  const updated = await prisma.clinic.update({
    where: { id },
    data: { isOpen: !existing.isOpen },
  });

  await logAudit({
    userId: adminUserId,
    action: updated.isOpen ? 'ADMIN_OPENED_CLINIC' : 'ADMIN_CLOSED_CLINIC',
    entity: 'Clinic',
    entityId: id,
    details: { isOpen: updated.isOpen },
    ipAddress: ip,
  });

  return updated;
};
