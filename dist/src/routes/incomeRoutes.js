"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// routes/incomeRoutes.ts
const express_1 = require("express");
const incomeController_1 = require("../controllers/incomeController"); // Sesuaikan import
const authMiddleware_1 = __importDefault(require("../middlewares/authMiddleware")); // Sesuaikan import
const router = (0, express_1.Router)();
router.post('/', authMiddleware_1.default, incomeController_1.validateIncome, incomeController_1.addIncome);
router.get('/', authMiddleware_1.default, incomeController_1.getIncomes);
router.get('/categories', authMiddleware_1.default, incomeController_1.getCategories);
router.get('/monthly-report', authMiddleware_1.default, incomeController_1.getReportMonthly);
router.get('/details/:id', authMiddleware_1.default, incomeController_1.getIncomesById);
router.delete('/delete/:id', authMiddleware_1.default, incomeController_1.deleteIncome);
exports.default = router;
