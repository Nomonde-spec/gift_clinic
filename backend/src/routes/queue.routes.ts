import { Router } from 'express';
import {
  getQueue,
  updateQueue,
  getHistory,
  getAnalytics,
} from '../controllers/queue.controller';
import {
  authenticateToken,
  requireStaffClinicAccess,
} from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { updateQueueSchema } from '../validators/queue.validator';

const router = Router({ mergeParams: true });

router.get('/queue', getQueue);

router.put(
  '/queue',
  authenticateToken,
  requireStaffClinicAccess,
  validateBody(updateQueueSchema),
  updateQueue
);

router.get('/queue/history', authenticateToken, getHistory);
router.get('/queue/analytics', authenticateToken, getAnalytics);

export default router;
