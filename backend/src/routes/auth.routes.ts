import { Router } from 'express';
import { register, login, getProfile } from '../controllers/auth.controller';
import { validateRequest, registerSchema, loginSchema } from '../utils/validators';
import authenticateToken from '../middlewares/auth.middleware';

const router = Router();

// Public routes
router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);

// Protected routes
router.get('/profile', authenticateToken, getProfile);

export default router;