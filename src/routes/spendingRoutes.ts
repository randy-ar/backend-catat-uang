// routes/spendingRoutes.ts
import { Router } from 'express';
import { upload, scanFromReceipt,saveScannedSpending, getSpendings, getMonthlySpendingReport, validateScannedSpending, getSpendingById, getReportMonthly, deleteSpending, getCategories, adjustSpendingData, validateAdjustedSpending } from '../controllers/spendingController'; // Sesuaikan import
import authenticateToken from '../middlewares/authMiddleware'; // Sesuaikan import

const router = Router();

router.post('/scan-receipt', authenticateToken, upload.single('receiptImage'), scanFromReceipt);
router.post('/adjust-scanned', authenticateToken, validateAdjustedSpending, adjustSpendingData);
router.post('/save-scanned', authenticateToken, validateScannedSpending, saveScannedSpending);
router.get('/', authenticateToken, getSpendings);
router.get('/categories', authenticateToken, getCategories);
router.get('/report', authenticateToken, getMonthlySpendingReport);
router.get('/monthly-report', authenticateToken, getReportMonthly);
router.get('/details/:id', authenticateToken, getSpendingById);
router.delete('/delete/:id', authenticateToken, deleteSpending);

export default router;