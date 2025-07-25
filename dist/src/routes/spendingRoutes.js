"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// routes/spendingRoutes.ts
const express_1 = require("express");
const spendingController_1 = require("../controllers/spendingController"); // Sesuaikan import
const authMiddleware_1 = __importDefault(require("../middlewares/authMiddleware")); // Sesuaikan import
const router = (0, express_1.Router)();
router.post('/scan-receipt', authMiddleware_1.default, spendingController_1.upload.single('receiptImage'), spendingController_1.scanFromReceipt);
router.post('/adjust-scanned', authMiddleware_1.default, spendingController_1.validateAdjustedSpending, spendingController_1.adjustSpendingData);
router.post('/save-scanned', authMiddleware_1.default, spendingController_1.validateScannedSpending, spendingController_1.saveScannedSpending);
router.get('/', authMiddleware_1.default, spendingController_1.getSpendings);
router.get('/categories', authMiddleware_1.default, spendingController_1.getCategories);
router.get('/report', authMiddleware_1.default, spendingController_1.getMonthlySpendingReport);
router.get('/monthly-report', authMiddleware_1.default, spendingController_1.getReportMonthly);
router.get('/details/:id', authMiddleware_1.default, spendingController_1.getSpendingById);
router.delete('/delete/:id', authMiddleware_1.default, spendingController_1.deleteSpending);
exports.default = router;
