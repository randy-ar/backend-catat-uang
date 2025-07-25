"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// app.ts
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors")); // Import CORS
const authRoutes_1 = __importDefault(require("./src/routes/authRoutes"));
const incomeRoutes_1 = __importDefault(require("./src/routes/incomeRoutes"));
const spendingRoutes_1 = __importDefault(require("./src/routes/spendingRoutes"));
const reportRoutes_1 = __importDefault(require("./src/routes/reportRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware
app.use(express_1.default.json());
app.use((0, cors_1.default)()); // Gunakan CORS middleware
// Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/incomes', incomeRoutes_1.default);
app.use('/api/spendings', spendingRoutes_1.default);
app.use('/api/reports', reportRoutes_1.default);
// Basic root route
app.get('/', (req, res) => {
    res.send('Welcome to the Financial Tracker API!');
});
exports.default = app;
