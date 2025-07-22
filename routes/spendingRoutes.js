// routes/spendingRoutes.js
const express = require('express');
const router = express.Router();
const spendingController = require('../controllers/spendingController');
const authenticateToken = require('../middlewares/authMiddleware');

router.post('/receipt', authenticateToken, spendingController.upload.single('receiptImage'), spendingController.addSpendingFromReceipt);
router.get('/', authenticateToken, spendingController.getSpendings);
router.get('/report', authenticateToken, spendingController.getMonthlySpendingReport);

module.exports = router;