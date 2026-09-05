import { Router } from 'express';
import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
} from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/auth.validator';

const router = Router();

router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);
router.post('/forgot', validateBody(forgotPasswordSchema), forgotPassword);
router.post('/reset', validateBody(resetPasswordSchema), resetPassword);
router.post('/logout', authenticateToken, logout);
router.get('/me', authenticateToken, getMe);
router.put('/profile', authenticateToken, validateBody(updateProfileSchema), updateProfile);

export default router;
