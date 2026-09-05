import { Router } from 'express';
import authRoutes from './auth.routes';
import clinicRoutes from './clinic.routes';
import queueRoutes from './queue.routes';
import stockRoutes from './stock.routes';
import medicationRoutes from './medication.routes';
import notificationRoutes from './notification.routes';
import adminRoutes from './admin.routes';
import reportRoutes from './report.routes';
import staffRoutes from './staff.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/clinics', clinicRoutes);
router.use('/clinics/:id', queueRoutes);
router.use('/clinics/:id', stockRoutes);
router.use('/medications', medicationRoutes);
router.use('/notifications', notificationRoutes);
router.use('/admin', adminRoutes);
router.use('/staff', staffRoutes);
router.use('/reports', reportRoutes);

export default router;
