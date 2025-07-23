// routes/incomeRoutes.ts
import { Router } from 'express';
import { addIncome, getIncomes, validateIncome, getIncomesById, getCategories, deleteIncome } from '../controllers/incomeController'; // Sesuaikan import
import authenticateToken from '../middlewares/authMiddleware'; // Sesuaikan import

const router = Router();

router.post('/', authenticateToken, validateIncome, addIncome);
router.get('/', authenticateToken, getIncomes);
router.get('/categories', authenticateToken, getCategories);
router.get('/:id', authenticateToken, getIncomesById);
router.delete('/:id', authenticateToken, deleteIncome);

export default router;