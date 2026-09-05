import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { getMyClinic, getMyDashboard } from '../controllers/staff.controller';

const router = Router();

router.get('/clinic', authenticateToken, getMyClinic);
router.get('/dashboard', authenticateToken, getMyDashboard);

export default router;
