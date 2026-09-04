import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { sendError } from '../utils/response';

export const validateBody =
  (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formatted = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        return sendError(res, 'Validation error', 422, formatted);
      }
      return sendError(res, 'Invalid request payload', 400);
    }
  };

export const validateQuery =
  (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = await schema.parseAsync(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formatted = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        return sendError(res, 'Invalid query parameters', 422, formatted);
      }
      return sendError(res, 'Invalid query parameters', 400);
    }
  };
