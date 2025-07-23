// routes/authRoutes.ts
import { Router } from 'express';
import { verifySession } from '../controllers/authController'; // Sesuaikan import

const router = Router();

router.get('/verify-session', verifySession);

export default router;