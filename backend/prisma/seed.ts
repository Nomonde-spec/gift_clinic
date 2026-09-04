import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seed...');

  // 1. Clean existing records in reverse order
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.stockHistory.deleteMany();
  await prisma.queueHistory.deleteMany();
  await prisma.clinicMedicationStock.deleteMany();
  await prisma.queueStatus.deleteMany();
  await prisma.clinicOperatingHours.deleteMany();
  await prisma.staffClinic.deleteMany();
  await prisma.medication.deleteMany();
  await prisma.clinic.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing database records.');

  // 2. Hash passwords
  const adminPasswordHash = await bcrypt.hash('AdminPass123!', 10);
  const staffPasswordHash = await bcrypt.hash('StaffPass123!', 10);
  const patientPasswordHash = await bcrypt.hash('PatientPass123!', 10);

  // 3. Create Users
  const admin = await prisma.user.create({
    data: {
      name: 'Sipho',
      surname: 'Dlamini',
      email: 'admin@clinic.gov.za',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      phone: '+27 11 555 0100',
      isActive: true,
    },
  });

  const staffSoweto = await prisma.user.create({
    data: {
      name: 'Thabo',
      surname: 'Mokoena',
      email: 'staff@soweto.clinic.gov.za',
      passwordHash: staffPasswordHash,
      role: 'STAFF',
      phone: '+27 11 555 0101',
      isActive: true,
    },
  });

  const staffHillbrow = await prisma.user.create({
    data: {
      name: 'Zanele',
      surname: 'Khuzwayo',
      email: 'staff@hillbrow.clinic.gov.za',
      passwordHash: staffPasswordHash,
      role: 'STAFF',
      phone: '+27 11 555 0102',
      isActive: true,
    },
  });

  const patient = await prisma.user.create({
    data: {
      name: 'Nomonde',
      surname: 'Cele',
      email: 'patient@gmail.com',
      passwordHash: patientPasswordHash,
      role: 'PATIENT',
      phone: '+27 82 555 0199',
      isActive: true,
    },
  });

  console.log('👤 Created demo users (Admin, Staff, Patient).');

  // 4. Create Clinics
  const soweto = await prisma.clinic.create({
    data: {
      name: 'Soweto Community Clinic',
      description: 'Comprehensive primary healthcare clinic serving the Soweto and greater Johannesburg community.',
      address: '247 Chris Hani Road, Klipspruit',
      suburb: 'Soweto',
      city: 'Johannesburg',
      province: 'Gauteng',
      phone: '+27 11 938 1111',
      latitude: -26.2485,
      longitude: 27.8540,
      openingTime: '07:00',
      closingTime: '17:00',
      isOpen: true,
    },
  });

  const hillbrow = await prisma.clinic.create({
    data: {
      name: 'Hillbrow Community Health Centre',
      description: 'Urban 24/7 emergency & primary health facility with maternal and chronic disease care.',
      address: 'Smith & Klein Street, Hillbrow',
      suburb: 'Hillbrow',
      city: 'Johannesburg',
      province: 'Gauteng',
      phone: '+27 11 694 3700',
      latitude: -26.1912,
      longitude: 28.0473,
      openingTime: '06:30',
      closingTime: '18:00',
      isOpen: true,
    },
  });

  const alexandra = await prisma.clinic.create({
    data: {
      name: 'Alexandra Health Centre and University Clinic',
      description: 'Historic public clinic delivering primary healthcare, child health, and emergency support.',
      address: '33 Arkwright Avenue, Wynberg',
      suburb: 'Alexandra',
      city: 'Johannesburg',
      province: 'Gauteng',
      phone: '+27 11 440 4000',
      latitude: -26.1037,
      longitude: 28.0931,
      openingTime: '07:00',
      closingTime: '16:30',
      isOpen: true,
    },
  });

  const mitchellsPlain = await prisma.clinic.create({
    data: {
      name: 'Mitchells Plain Community Health Clinic',
      description: 'Large municipal community clinic providing outpatient, dental, pharmacy, and immunization services.',
      address: 'AZ Berman Drive, Town Centre',
      suburb: 'Mitchells Plain',
      city: 'Cape Town',
      province: 'Western Cape',
      phone: '+27 21 370 5000',
      latitude: -34.0484,
      longitude: 18.6253,
      openingTime: '07:30',
      closingTime: '16:00',
      isOpen: true,
    },
  });

  const khayelitsha = await prisma.clinic.create({
    data: {
      name: 'Khayelitsha Shared Health Clinic',
      description: 'Community health station with maternal, HIV/TB care, and chronic medicine dispensing.',
      address: 'Steve Biko Road, Site B',
      suburb: 'Khayelitsha',
      city: 'Cape Town',
      province: 'Western Cape',
      phone: '+27 21 360 4200',
      latitude: -34.0371,
      longitude: 18.6725,
      openingTime: '08:00',
      closingTime: '16:30',
      isOpen: true,
    },
  });

  const clinics = [soweto, hillbrow, alexandra, mitchellsPlain, khayelitsha];
  console.log(`🏥 Created ${clinics.length} realistic clinics.`);

  // 5. Assign Staff to Clinics
  await prisma.staffClinic.createMany({
    data: [
      { staffId: staffSoweto.id, clinicId: soweto.id },
      { staffId: staffHillbrow.id, clinicId: hillbrow.id },
    ],
  });

  // 6. Create Operating Hours for all clinics
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  for (const c of clinics) {
    const hoursData = days.map((day) => ({
      clinicId: c.id,
      dayOfWeek: day,
      openTime: day === 'Saturday' ? '08:00' : '07:00',
      closeTime: day === 'Saturday' ? '13:00' : day === 'Sunday' ? '12:00' : '17:00',
      isClosed: day === 'Sunday',
    }));
    await prisma.clinicOperatingHours.createMany({ data: hoursData });
  }

  // 7. Create Medications
  const medicationData = [
    {
      name: 'Paracetamol',
      description: 'Pain relief and fever reducer (500mg tablets).',
      category: 'Analgesic',
      unit: 'tablets',
      lowStockThreshold: 100,
    },
    {
      name: 'Amoxicillin',
      description: 'Broad-spectrum penicillin antibiotic (500mg capsules).',
      category: 'Antibiotic',
      unit: 'capsules',
      lowStockThreshold: 40,
    },
    {
      name: 'Insulin Glargine',
      description: 'Long-acting insulin analogue for diabetes blood glucose regulation.',
      category: 'Chronic - Diabetes',
      unit: 'vials',
      lowStockThreshold: 20,
    },
    {
      name: 'Ibuprofen',
      description: 'Nonsteroidal anti-inflammatory drug (400mg tablets).',
      category: 'Anti-inflammatory',
      unit: 'tablets',
      lowStockThreshold: 80,
    },
    {
      name: 'Salbutamol Inhaler',
      description: 'Beta-2 agonist bronchodilator for asthma relief (100mcg/dose).',
      category: 'Respiratory',
      unit: 'inhalers',
      lowStockThreshold: 25,
    },
    {
      name: 'Metformin',
      description: 'First-line medication for type 2 diabetes management (500mg).',
      category: 'Chronic - Diabetes',
      unit: 'tablets',
      lowStockThreshold: 120,
    },
    {
      name: 'Amlodipine',
      description: 'Calcium channel blocker for hypertension and chest pain (5mg).',
      category: 'Cardiovascular',
      unit: 'tablets',
      lowStockThreshold: 60,
    },
    {
      name: 'Enalapril',
      description: 'ACE inhibitor medication for high blood pressure (10mg).',
      category: 'Cardiovascular',
      unit: 'tablets',
      lowStockThreshold: 50,
    },
    {
      name: 'Ceftriaxone',
      description: 'Third-generation cephalosporin antibiotic injection (1g).',
      category: 'Antibiotic',
      unit: 'vials',
      lowStockThreshold: 15,
    },
    {
      name: 'Oral Rehydration Salts',
      description: 'Electrolyte mixture for dehydration treatment.',
      category: 'Gastrointestinal',
      unit: 'sachets',
      lowStockThreshold: 100,
    },
    {
      name: 'Artemether / Lumefantrine',
      description: 'Combination antimalarial medication.',
      category: 'Antimalarial',
      unit: 'tablets',
      lowStockThreshold: 30,
    },
    {
      name: 'Cotrimoxazole',
      description: 'Bacteriostatic antibiotic prophylaxis (480mg tablets).',
      category: 'Antibiotic',
      unit: 'tablets',
      lowStockThreshold: 70,
    },
  ];

  const createdMeds = [];
  for (const m of medicationData) {
    const med = await prisma.medication.create({ data: m });
    createdMeds.push(med);
  }
  console.log(`💊 Created ${createdMeds.length} catalogued medications.`);

  // 8. Create Stock for each clinic with realistic varied statuses
  for (const c of clinics) {
    for (const med of createdMeds) {
      let qty = 150;
      let status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' = 'IN_STOCK';

      if (c.id === soweto.id) {
        if (med.name === 'Amoxicillin') {
          qty = 0;
          status = 'OUT_OF_STOCK';
        } else if (med.name === 'Insulin Glargine') {
          qty = 10; // below threshold 20
          status = 'LOW_STOCK';
        } else if (med.name === 'Salbutamol Inhaler') {
          qty = 15; // below threshold 25
          status = 'LOW_STOCK';
        } else {
          qty = 220;
          status = 'IN_STOCK';
        }
      } else if (c.id === hillbrow.id) {
        if (med.name === 'Ceftriaxone') {
          qty = 0;
          status = 'OUT_OF_STOCK';
        } else if (med.name === 'Amlodipine') {
          qty = 35; // threshold 60
          status = 'LOW_STOCK';
        } else {
          qty = 180;
          status = 'IN_STOCK';
        }
      } else if (c.id === alexandra.id) {
        if (med.name === 'Oral Rehydration Salts') {
          qty = 0;
          status = 'OUT_OF_STOCK';
        } else if (med.name === 'Paracetamol') {
          qty = 50; // threshold 100
          status = 'LOW_STOCK';
        } else {
          qty = 140;
          status = 'IN_STOCK';
        }
      } else {
        qty = 160;
        status = 'IN_STOCK';
      }

      await prisma.clinicMedicationStock.create({
        data: {
          clinicId: c.id,
          medicationId: med.id,
          quantity: qty,
          status,
          lastUpdatedById: c.id === soweto.id ? staffSoweto.id : staffHillbrow.id,
        },
      });

      // Add StockHistory record
      await prisma.stockHistory.create({
        data: {
          clinicId: c.id,
          medicationId: med.id,
          previousQuantity: qty + 20,
          newQuantity: qty,
          previousStatus: 'IN_STOCK',
          newStatus: status,
          updatedById: c.id === soweto.id ? staffSoweto.id : staffHillbrow.id,
        },
      });
    }
  }

  // 9. Create QueueStatus and QueueHistory for each clinic
  const queueConfigs = [
    {
      clinicId: soweto.id,
      waiting: 35,
      waitMins: 75,
      rooms: 3,
      status: 'BUSY' as const,
      updater: staffSoweto.id,
    },
    {
      clinicId: hillbrow.id,
      waiting: 14,
      waitMins: 25,
      rooms: 4,
      status: 'MODERATE' as const,
      updater: staffHillbrow.id,
    },
    {
      clinicId: alexandra.id,
      waiting: 48,
      waitMins: 110,
      rooms: 2,
      status: 'VERY_BUSY' as const,
      updater: admin.id,
    },
    {
      clinicId: mitchellsPlain.id,
      waiting: 8,
      waitMins: 15,
      rooms: 4,
      status: 'LOW' as const,
      updater: admin.id,
    },
    {
      clinicId: khayelitsha.id,
      waiting: 0,
      waitMins: 0,
      rooms: 2,
      status: 'LOW' as const,
      updater: admin.id,
    },
  ];

  for (const q of queueConfigs) {
    await prisma.queueStatus.create({
      data: {
        clinicId: q.clinicId,
        peopleWaiting: q.waiting,
        estimatedWaitMinutes: q.waitMins,
        openConsultationRooms: q.rooms,
        status: q.status,
        updatedById: q.updater,
      },
    });

    // Create 7 past entries for historical charts
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const pastDate = new Date(now.getTime() - i * 3 * 3600 * 1000);
      const variance = (i % 3) * 5;
      await prisma.queueHistory.create({
        data: {
          clinicId: q.clinicId,
          peopleWaiting: Math.max(2, q.waiting - variance + (i * 2)),
          estimatedWaitMinutes: Math.max(5, q.waitMins - (variance * 2) + (i * 5)),
          openConsultationRooms: q.rooms,
          status: q.status,
          updatedById: q.updater,
          createdAt: pastDate,
        },
      });
    }
  }

  // 10. Create Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: staffSoweto.id,
        type: 'OUT_OF_STOCK',
        title: 'Critical Out of Stock Alert',
        message: 'Amoxicillin is now OUT OF STOCK at Soweto Community Clinic.',
        isRead: false,
      },
      {
        userId: staffSoweto.id,
        type: 'LOW_STOCK',
        title: 'Low Stock Notice',
        message: 'Insulin Glargine is running low at Soweto Community Clinic (10 vials remaining).',
        isRead: false,
      },
      {
        userId: staffSoweto.id,
        type: 'QUEUE_WARNING',
        title: 'High Queue Alert',
        message: 'Soweto Community Clinic is currently BUSY with 35 people waiting (~75 min wait).',
        isRead: true,
      },
      {
        userId: admin.id,
        type: 'SYSTEM',
        title: 'System Initialized',
        message: 'Public Clinic Queue & Stock Tracker active with 5 clinics and 12 medications.',
        isRead: false,
      },
    ],
  });

  // 11. Create Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        userId: admin.id,
        action: 'SYSTEM_INITIALIZATION',
        entity: 'System',
        entityId: 'global',
        details: JSON.stringify({ version: '1.0.0', seed: true }),
        ipAddress: '127.0.0.1',
      },
      {
        userId: staffSoweto.id,
        action: 'STAFF_UPDATED_QUEUE',
        entity: 'QueueStatus',
        entityId: soweto.id,
        details: JSON.stringify({ peopleWaiting: 35, estimatedWaitMinutes: 75, status: 'BUSY' }),
        ipAddress: '127.0.0.1',
      },
      {
        userId: staffSoweto.id,
        action: 'STAFF_UPDATED_STOCK',
        entity: 'ClinicMedicationStock',
        entityId: `${soweto.id}:Amoxicillin`,
        details: JSON.stringify({ medication: 'Amoxicillin', quantity: 0, status: 'OUT_OF_STOCK' }),
        ipAddress: '127.0.0.1',
      },
    ],
  });

  console.log('✅ Database seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
