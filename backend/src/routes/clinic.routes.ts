import { Router } from 'express';
import {
  getClinics,
  getSingleClinic,
  createNewClinic,
  updateClinicDetails,
  toggleClinic,
} from '../controllers/clinic.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';
import { validateBody, validateQuery } from '../middleware/validate.middleware';
import {
  createClinicSchema,
  updateClinicSchema,
  clinicQuerySchema,
} from '../validators/clinic.validator';

const router = Router();

router.get('/', validateQuery(clinicQuerySchema), getClinics);
router.get('/:id', getSingleClinic);

router.post(
  '/',
  authenticateToken,
  requireRole('ADMIN'),
  validateBody(createClinicSchema),
  createNewClinic
);

router.put(
  '/:id',
  authenticateToken,
  requireRole('ADMIN'),
  validateBody(updateClinicSchema),
  updateClinicDetails
);

router.patch(
  '/:id/toggle',
  authenticateToken,
  requireRole('ADMIN'),
  toggleClinic
);

export default router;
