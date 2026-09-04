import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

declare global {
  // eslint-disable-next-line no-var
  var __db: PrismaClient | undefined;
}

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.__db) {
    global.__db = new PrismaClient({
      log: ['error', 'warn'],
    });
  }
  prisma = global.__db;
}

export default prisma;
