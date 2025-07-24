// routes/incomeRoutes.ts
import { Router } from 'express';
import { addIncome, getIncomes, validateIncome, getIncomesById, getCategories, deleteIncome, getReportMonthly } from '../controllers/incomeController'; // Sesuaikan import
import authenticateToken from '../middlewares/authMiddleware'; // Sesuaikan import

const router = Router();

router.post('/', authenticateToken, validateIncome, addIncome);
router.get('/', authenticateToken, getIncomes);
router.get('/categories', authenticateToken, getCategories);
router.get('/monthly-report', authenticateToken, getReportMonthly);
router.get('/details/:id', authenticateToken, getIncomesById);
router.delete('/delete/:id', authenticateToken, deleteIncome);

export default router;