import { Router } from 'express';
import {
  getStock,
  updateStock,
  getHistory,
} from '../controllers/stock.controller';
import {
  authenticateToken,
  requireStaffClinicAccess,
  requireRole,
} from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { updateStockSchema } from '../validators/stock.validator';

const router = Router({ mergeParams: true });

router.get('/stock', authenticateToken, getStock);

router.put(
  '/stock/:medicationId',
  authenticateToken,
  requireStaffClinicAccess,
  validateBody(updateStockSchema),
  updateStock
);

router.get(
  '/stock/history',
  authenticateToken,
  requireRole('STAFF', 'ADMIN'),
  getHistory
);

export default router;
