import { Router } from 'express';
import {
  register,
  verifyEmail,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
} from '../controllers/authController.js';
import { validateRequest } from '../middlewares/validate.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authRateLimiter } from '../middlewares/rateLimiters.js';
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../schemas/authSchema.js';

const router = Router();

router.post('/register', authRateLimiter, validateRequest(registerSchema), register);
router.post('/verify-email', validateRequest(verifyEmailSchema), verifyEmail);
router.post('/login', authRateLimiter, validateRequest(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', authenticate, logout);
router.post('/forgot-password', validateRequest(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validateRequest(resetPasswordSchema), resetPassword);
router.get('/me', authenticate, getMe);

export default router;
