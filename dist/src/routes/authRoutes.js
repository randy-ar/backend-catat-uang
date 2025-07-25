"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// routes/authRoutes.ts
const express_1 = require("express");
const authController_1 = require("../controllers/authController"); // Sesuaikan import
const router = (0, express_1.Router)();
router.get('/verify-session', authController_1.verifySession);
exports.default = router;
