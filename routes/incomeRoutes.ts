// routes/incomeRoutes.ts
import { Router } from 'express';
import { addIncome, getIncomes } from '../controllers/incomeController'; // Sesuaikan import
import authenticateToken from '../middlewares/authMiddleware'; // Sesuaikan import

const router = Router();

router.post('/', authenticateToken, addIncome);
router.get('/', authenticateToken, getIncomes);

export default router;