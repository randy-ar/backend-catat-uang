"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReportMonthly = exports.deleteIncome = exports.getCategories = exports.getIncomesById = exports.getIncomes = exports.addIncome = exports.validateIncome = void 0;
const incomeModel = __importStar(require("../models/incomeModel")); // Import sebagai namespace
const lib_1 = require("express-validator/lib");
const IncomeCategories_1 = __importDefault(require("../constant/IncomeCategories"));
const validateIncome = [
    (0, lib_1.body)('name')
        .notEmpty().withMessage('Nama income tidak boleh kosong')
        .isString().withMessage('Nama income harus berupa teks'),
    (0, lib_1.body)('amount')
        .notEmpty().withMessage('Jumlah income tidak boleh kosong')
        .isNumeric().withMessage('Jumlah income harus berupa angka')
        .toFloat()
        .custom((value) => value > 0).withMessage('Jumlah income harus lebih besar dari 0'),
    (0, lib_1.body)('description')
        .optional()
        .isString().withMessage('Deskripsi harus berupa teks'),
    (0, lib_1.body)('category.name')
        .optional()
        .isString().withMessage('Nama kategori harus berupa teks'),
    (0, lib_1.body)('category.id')
        .optional()
        .isInt().withMessage('ID kategori harus berupa angka bulat')
        .toInt()
];
exports.validateIncome = validateIncome;
const addIncome = async (req, res) => {
    const errors = (0, lib_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { name, amount, description, category, date } = req.body;
    console.log(req.body);
    const userId = req.user?.uid; // Gunakan optional chaining karena user bisa undefined
    const incomeCategoryData = IncomeCategories_1.default.find((c) => c.id === category.id);
    console.log("CATEGORY: ", incomeCategoryData);
    if (!incomeCategoryData) {
        return res.status(400).json({ message: 'Invalid income category' });
    }
    if (!userId) {
        return res.status(401).json({ message: 'User not authenticated or UID not available.' });
    }
    const incomeData = {
        name,
        amount: parseFloat(amount),
        description,
        category: incomeCategoryData,
        date: new Date(date).toISOString().split('T')[0],
    };
    try {
        const newIncome = await incomeModel.addIncome(userId, incomeData);
        res.status(201).json({ message: 'Income added successfully', income: newIncome });
    }
    catch (error) {
        console.error('Error adding income:', error);
        res.status(500).json({ message: 'Failed to add income', error: error.message });
    }
};
exports.addIncome = addIncome;
const getIncomes = async (req, res) => {
    const userId = req.user?.uid;
    if (!userId) {
        return res.status(401).json({ message: 'User not authenticated or UID not available.' });
    }
    try {
        const incomes = await incomeModel.getIncomesByUserId(userId);
        res.status(200).json(incomes);
    }
    catch (error) {
        console.error('Error fetching incomes:', error);
        res.status(500).json({ message: 'Failed to fetch incomes', error: error.message });
    }
};
exports.getIncomes = getIncomes;
const getIncomesById = async (req, res) => {
    const userId = req.user?.uid;
    const incomeId = req.params.id;
    if (!userId) {
        return res.status(401).json({ message: 'User not authenticated or UID not available.' });
    }
    try {
        const income = await incomeModel.getIncomeById(userId, incomeId);
        if (!income) {
            return res.status(404).json({ message: 'Income not found' });
        }
        res.status(200).json(income);
    }
    catch (error) {
    }
};
exports.getIncomesById = getIncomesById;
const getCategories = async (req, res) => {
    return res.status(200).json(IncomeCategories_1.default);
};
exports.getCategories = getCategories;
const deleteIncome = async (req, res) => {
    const userId = req.user?.uid;
    const incomeId = req.params.id;
    console.log("DELETE INCOME:", incomeId);
    if (!userId) {
        return res.status(404).json({ message: 'User not authenticated or UID not available.' });
    }
    try {
        const result = await incomeModel.deleteIncome(userId, incomeId);
        console.log("RESULT: ", result);
        res.status(200).json(result);
    }
    catch {
        res.status(500).json({ message: 'Failed to delete income' });
    }
};
exports.deleteIncome = deleteIncome;
const getReportMonthly = async (req, res) => {
    const userId = req.user?.uid;
    const { year, month } = req.query;
    if (!userId) {
        return res.status(401).json({ message: 'User not authenticated or UID not available.' });
    }
    if (!year || !month) {
        return res.status(400).json({ message: 'Query parameter "year" dan "month" dibutuhkan.' });
    }
    try {
        const parsedYear = parseInt(year);
        const parsedMonth = parseInt(month);
        if (isNaN(parsedYear) || isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
            return res.status(400).json({ message: 'Format "year" atau "month" tidak valid.' });
        }
        // Hitung bulan sebelumnya
        let prevYear = parsedYear;
        let prevMonth = parsedMonth - 1;
        if (prevMonth === 0) {
            prevMonth = 12;
            prevYear -= 1;
        }
        const currentMonthIncomes = await incomeModel.getMonthlyIncomes(userId, parsedYear, parsedMonth);
        const previousMonthIncomes = await incomeModel.getMonthlyIncomes(userId, prevYear, prevMonth);
        const totalCurrentMonth = currentMonthIncomes.reduce((sum, income) => sum + income.amount, 0);
        const totalPreviousMonth = previousMonthIncomes.reduce((sum, income) => sum + income.amount, 0);
        let percentageChange = 0;
        if (totalPreviousMonth > 0) {
            percentageChange = ((totalCurrentMonth - totalPreviousMonth) / totalPreviousMonth) * 100;
        }
        else if (totalCurrentMonth > 0) {
            percentageChange = 100; // Jika bulan lalu 0 dan bulan ini ada pemasukan, anggap naik 100%
        }
        res.status(200).json({
            summary: {
                totalCurrentMonth,
                totalPreviousMonth,
                percentageChange: parseFloat(percentageChange.toFixed(2)),
            },
            details: {
                currentMonthIncomes,
                previousMonthIncomes,
            }
        });
    }
    catch (error) {
        console.error('Error generating monthly income report:', error);
        res.status(500).json({ message: 'Failed to generate monthly income report', error: error.message });
    }
};
exports.getReportMonthly = getReportMonthly;
