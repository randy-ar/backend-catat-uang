"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// routes/reportRoutes.ts
const express_1 = require("express");
const reportController_1 = require("../controllers/reportController"); // Import controller laporan
const authMiddleware_1 = __importDefault(require("../middlewares/authMiddleware"));
const router = (0, express_1.Router)();
// Rute untuk mendapatkan laporan bulanan
// Contoh penggunaan: GET /api/reports/month?year=2025&month=7
router.get('/month', authMiddleware_1.default, reportController_1.getReportMonth);
exports.default = router;
