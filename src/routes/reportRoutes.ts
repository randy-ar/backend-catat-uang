// routes/reportRoutes.ts
import { Router } from 'express';
import { getReportMonth } from '../controllers/reportController'; // Import controller laporan
import authenticateToken from '../middlewares/authMiddleware';

const router = Router();

// Rute untuk mendapatkan laporan bulanan
// Contoh penggunaan: GET /api/reports/month?year=2025&month=7
router.get('/month', authenticateToken, getReportMonth);

export default router;