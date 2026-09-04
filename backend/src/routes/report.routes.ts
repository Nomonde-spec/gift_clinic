import { Router } from 'express';
import {
  getQueueReportHandler,
  getStockReportHandler,
  getClinicPerformanceHandler,
} from '../controllers/report.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/queue', requireRole('STAFF', 'ADMIN'), getQueueReportHandler);
router.get('/stock', requireRole('STAFF', 'ADMIN'), getStockReportHandler);
router.get('/clinics', requireRole('ADMIN'), getClinicPerformanceHandler);

export default router;
