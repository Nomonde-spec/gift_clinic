import { Router } from 'express';
import {
  getNotifications,
  markRead,
  markAllRead,
} from '../controllers/notification.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticateToken, getNotifications);
router.patch('/read-all', authenticateToken, markAllRead);
router.patch('/:id/read', authenticateToken, markRead);

export default router;
