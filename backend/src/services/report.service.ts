import prisma from './prisma';

export const getQueueReports = async (days = 7) => {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const [history, clinics] = await Promise.all([
    prisma.queueHistory.findMany({
      where: { createdAt: { gte: since } },
      include: {
        clinic: {
          select: { id: true, name: true, city: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.clinic.findMany({
      select: { id: true, name: true },
    }),
  ]);

  if (!history.length) {
    return {
      averageWaitTime: 0,
      maxWaitTime: 0,
      averageQueue: 0,
      peakQueue: 0,
      busiestClinic: 'N/A',
      busiestTime: 'N/A',
      historySeries: [],
      clinicAverages: [],
    };
  }

  const waitTimes = history.map((h) => h.estimatedWaitMinutes);
  const queues = history.map((h) => h.peopleWaiting);

  const avgWait = Math.round(waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length);
  const maxWait = Math.max(...waitTimes);
  const avgQueue = Math.round(queues.reduce((a, b) => a + b, 0) / queues.length);
  const peakQueue = Math.max(...queues);

  // Group by clinic to find busiest
  const clinicCounts: Record<string, { name: string; totalPeople: number; count: number; totalWait: number }> = {};
  for (const h of history) {
    if (!clinicCounts[h.clinicId]) {
      clinicCounts[h.clinicId] = {
        name: h.clinic.name,
        totalPeople: 0,
        count: 0,
        totalWait: 0,
      };
    }
    clinicCounts[h.clinicId].totalPeople += h.peopleWaiting;
    clinicCounts[h.clinicId].totalWait += h.estimatedWaitMinutes;
    clinicCounts[h.clinicId].count += 1;
  }

  let busiestClinic = 'N/A';
  let highestAvgPeople = -1;
  const clinicAverages = Object.entries(clinicCounts).map(([clinicId, data]) => {
    const avgP = Math.round(data.totalPeople / data.count);
    const avgW = Math.round(data.totalWait / data.count);
    if (avgP > highestAvgPeople) {
      highestAvgPeople = avgP;
      busiestClinic = data.name;
    }
    return {
      clinicId,
      name: data.name,
      averageQueue: avgP,
      averageWaitMinutes: avgW,
    };
  });

  // Hour breakdown for busiest time
  const hourCounts: Record<number, number> = {};
  for (const h of history) {
    const hour = new Date(h.createdAt).getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + h.peopleWaiting;
  }
  let busiestHour = 9;
  let maxHourPeople = -1;
  for (const [hour, people] of Object.entries(hourCounts)) {
    if (people > maxHourPeople) {
      maxHourPeople = people;
      busiestHour = parseInt(hour, 10);
    }
  }
  const busiestTime = `${busiestHour.toString().padStart(2, '0')}:00 – ${(busiestHour + 2)
    .toString()
    .padStart(2, '0')}:00`;

  // History timeline series for charts
  const historySeries = history.map((h) => ({
    timestamp: h.createdAt,
    clinicName: h.clinic.name,
    peopleWaiting: h.peopleWaiting,
    waitMinutes: h.estimatedWaitMinutes,
  }));

  return {
    averageWaitTime: avgWait,
    maxWaitTime: maxWait,
    averageQueue: avgQueue,
    peakQueue,
    busiestClinic,
    busiestTime,
    historySeries,
    clinicAverages,
  };
};

export const getStockReports = async () => {
  const [medications, allStock, stockHistories] = await Promise.all([
    prisma.medication.findMany({
      where: { isActive: true },
      select: { id: true, name: true, category: true, lowStockThreshold: true },
    }),
    prisma.clinicMedicationStock.findMany({
      include: {
        clinic: { select: { id: true, name: true } },
        medication: { select: { id: true, name: true, category: true } },
      },
    }),
    prisma.stockHistory.findMany({
      where: { newStatus: 'OUT_OF_STOCK' },
      include: {
        medication: { select: { id: true, name: true } },
        clinic: { select: { id: true, name: true } },
      },
      take: 100,
    }),
  ]);

  const totalMedications = medications.length;
  const inStockItems = allStock.filter((s) => s.status === 'IN_STOCK').length;
  const lowStockItems = allStock.filter((s) => s.status === 'LOW_STOCK').length;
  const outOfStockItems = allStock.filter((s) => s.status === 'OUT_OF_STOCK').length;

  // Calculate most frequently out-of-stock medications
  const outOfStockFrequencies: Record<string, { name: string; count: number }> = {};
  for (const sh of stockHistories) {
    if (!outOfStockFrequencies[sh.medicationId]) {
      outOfStockFrequencies[sh.medicationId] = {
        name: sh.medication.name,
        count: 0,
      };
    }
    outOfStockFrequencies[sh.medicationId].count += 1;
  }

  const frequentlyOutOfStock = Object.values(outOfStockFrequencies)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Category breakdown
  const categoryBreakdown: Record<string, { total: number; lowOrOut: number }> = {};
  for (const s of allStock) {
    const cat = s.medication.category || 'General';
    if (!categoryBreakdown[cat]) {
      categoryBreakdown[cat] = { total: 0, lowOrOut: 0 };
    }
    categoryBreakdown[cat].total += 1;
    if (s.status !== 'IN_STOCK') {
      categoryBreakdown[cat].lowOrOut += 1;
    }
  }

  return {
    totalMedications,
    inventoryRecords: allStock.length,
    inStockItems,
    lowStockItems,
    outOfStockItems,
    stockAvailabilityRate: allStock.length
      ? Math.round((inStockItems / allStock.length) * 100)
      : 100,
    frequentlyOutOfStock,
    categoryBreakdown,
  };
};

export const getClinicPerformance = async () => {
  const clinics = await prisma.clinic.findMany({
    include: {
      queueStatus: true,
      queueHistories: {
        take: 30,
        orderBy: { createdAt: 'desc' },
      },
      medicationStock: {
        select: { status: true },
      },
    },
  });

  return clinics.map((c) => {
    const waitList = c.queueHistories.map((q) => q.estimatedWaitMinutes);
    const queueList = c.queueHistories.map((q) => q.peopleWaiting);

    const avgWait = waitList.length
      ? Math.round(waitList.reduce((a, b) => a + b, 0) / waitList.length)
      : c.queueStatus?.estimatedWaitMinutes || 0;

    const avgQueue = queueList.length
      ? Math.round(queueList.reduce((a, b) => a + b, 0) / queueList.length)
      : c.queueStatus?.peopleWaiting || 0;

    const peakQueue = queueList.length
      ? Math.max(...queueList)
      : c.queueStatus?.peopleWaiting || 0;

    const totalStock = c.medicationStock.length;
    const availableStock = c.medicationStock.filter((s) => s.status === 'IN_STOCK').length;
    const stockAvailability = totalStock
      ? Math.round((availableStock / totalStock) * 100)
      : 100;

    return {
      clinicId: c.id,
      name: c.name,
      city: c.city,
      suburb: c.suburb,
      isOpen: c.isOpen,
      currentWait: c.queueStatus?.estimatedWaitMinutes || 0,
      currentQueue: c.queueStatus?.peopleWaiting || 0,
      currentQueueStatus: c.queueStatus?.status || 'LOW',
      averageWait: avgWait,
      averageQueue: avgQueue,
      peakQueue,
      stockAvailability,
    };
  });
};
