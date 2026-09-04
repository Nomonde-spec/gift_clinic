import { Router } from 'express';
import {
  getMedications,
  createNewMedication,
  updateMedicationDetails,
  toggleMedicationStatus,
} from '../controllers/medication.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import {
  createMedicationSchema,
  updateMedicationSchema,
} from '../validators/medication.validator';

const router = Router();

router.get('/', authenticateToken, getMedications);

router.post(
  '/',
  authenticateToken,
  requireRole('ADMIN'),
  validateBody(createMedicationSchema),
  createNewMedication
);

router.put(
  '/:id',
  authenticateToken,
  requireRole('ADMIN'),
  validateBody(updateMedicationSchema),
  updateMedicationDetails
);

router.patch(
  '/:id/toggle',
  authenticateToken,
  requireRole('ADMIN'),
  toggleMedicationStatus
);

export default router;
