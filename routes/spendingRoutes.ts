// routes/spendingRoutes.ts
import { Router } from 'express';
import { upload, addSpendingFromReceipt, getSpendings, getMonthlySpendingReport } from '../controllers/spendingController'; // Sesuaikan import
import authenticateToken from '../middlewares/authMiddleware'; // Sesuaikan import

const router = Router();

router.post('/receipt', authenticateToken, upload.single('receiptImage'), addSpendingFromReceipt);
router.get('/', authenticateToken, getSpendings);
router.get('/report', authenticateToken, getMonthlySpendingReport);

export default router;