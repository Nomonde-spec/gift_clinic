import prisma from './prisma';

interface LogAuditParams {
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: string | Record<string, any>;
  ipAddress?: string;
}

export const logAudit = async ({
  userId,
  action,
  entity,
  entityId,
  details,
  ipAddress,
}: LogAuditParams) => {
  try {
    const detailsString =
      typeof details === 'object' ? JSON.stringify(details) : details;

    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        details: detailsString,
        ipAddress,
      },
    });
  } catch (error) {
    console.error('[AuditLog Error]', error);
  }
};
