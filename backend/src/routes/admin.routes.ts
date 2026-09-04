import { Router } from 'express';
import {
  getStaffList,
  createStaffMember,
  updateStaffAssignments,
  toggleStaffStatus,
  getAuditLogs,
  getDashboardSummary,
} from '../controllers/admin.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';

const router = Router();

// All admin routes strictly guarded with Role.ADMIN
router.use(authenticateToken, requireRole('ADMIN'));

router.get('/dashboard', getDashboardSummary);
router.get('/staff', getStaffList);
router.post('/staff', createStaffMember);
router.put('/staff/:id', updateStaffAssignments);
router.patch('/staff/:id/toggle', toggleStaffStatus);
router.get('/audit-logs', getAuditLogs);

export default router;
