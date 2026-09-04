import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

export const notFoundHandler = (req: Request, res: Response) => {
  return sendError(res, `Endpoint not found: ${req.method} ${req.originalUrl}`, 404);
};

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  console.error('[Error Handler]', err);

  // Prisma unique constraint violation
  if (err.code === 'P2002') {
    const target = err.meta?.target ? ` (${err.meta.target})` : '';
    return sendError(res, `A record with this unique value already exists${target}`, 409);
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    return sendError(res, 'Record not found', 404);
  }

  // Fallback 500 error
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' && statusCode === 500
    ? 'Internal Server Error'
    : err.message || 'An unexpected error occurred';

  return sendError(res, message, statusCode);
};
